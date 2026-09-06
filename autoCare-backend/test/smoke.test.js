import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('API workflow and filter regressions on an isolated in-memory database', async () => {
  const server = spawn(process.execPath, ['src/index.js'], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, PORT: '3012', DB_PATH: ':memory:', JWT_SECRET: 'test-only-secret' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', (data) => { output += data; });
  server.stderr.on('data', (data) => { output += data; });
  const base = 'http://127.0.0.1:3012';
  async function request(path, { method = 'GET', body, token, status = 200 } = {}) {
    const response = await fetch(`${base}${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    const result = await response.json();
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
    assert.equal(result.ok, status < 400);
    return result.data;
  }
  try {
    for (let attempt = 0; attempt < 50 && !output.includes('Backend running'); attempt++) {
      if (server.exitCode !== null) throw new Error(output);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.match(output, /Backend running/);
    await request('/health');
    await request('/api/jobs', { status: 401 });
    await request('/api/auth/login', { method: 'POST', body: { email: {}, password: [] }, status: 422 });
    const accounts = {};
    for (const role of ['customer', 'technician', 'driver', 'manager', 'admin']) {
      accounts[role] = await request('/api/auth/register', {
        method: 'POST', status: 201,
        body: { name: `Test ${role}`, email: `${role}@example.com`, password: 'test1234', confirmPassword: 'test1234', role },
      });
      await request('/api/auth/login', { method: 'POST', body: { email: ` ${role.toUpperCase()}@example.com `, password: 'test1234', role } });
      await request('/api/auth/me', { token: accounts[role].token });
      await request('/api/admin/dashboard', { token: accounts[role].token });
    }
    await request('/api/auth/register', { method: 'POST', status: 422, body: { name: 'Duplicate', email: ' CUSTOMER@example.com ', password: 'test1234', confirmPassword: 'test1234' } });
    const customer = accounts.customer.token;
    const manager = accounts.manager.token;
    const admin = accounts.admin.token;
    const technician = accounts.technician.token;
    const stock = await request('/api/inventory', { method: 'POST', token: manager, status: 201, body: { name: 'Sample filter', category: 'Filters', quantity: 0, minQuantity: 0, unitPrice: 10 } });
    assert.equal(stock.minQuantity, 0);
    const freeStock = await request(`/api/inventory/${stock.id}`, { method: 'PUT', token: manager, body: { unitPrice: 0 } });
    assert.equal(freeStock.unitPrice, 0);
    await request(`/api/inventory/${stock.id}`, { method: 'PUT', token: manager, body: { quantity: -1 }, status: 422 });
    await request('/api/users', { token: customer, status: 403 });
    const vehicle = await request('/api/vehicles', { method: 'POST', token: customer, status: 201, body: { model: 'Test Car', plate: 'TEST-001' } });
    const job = await request('/api/jobs', { method: 'POST', token: customer, status: 201, body: { customerId: accounts.customer.id, vehicleId: vehicle.id, serviceType: 'Inspection', priority: 'high' } });
    const filtered = await request('/api/jobs?priority=normal', { token: manager });
    assert.equal(filtered.length, 0, 'Priority-only filter must exclude high-priority jobs');
    assert.equal((await request('/api/jobs?priority=high', { token: manager })).length, 1);
    await request(`/api/jobs/${job.id}/assign-technician`, { method: 'PUT', token: manager, body: { technicianId: accounts.technician.id } });
    assert.equal((await request('/api/jobs', { token: technician }))[0].id, job.id);
    await request(`/api/jobs/${job.id}/status`, { method: 'PUT', token: technician, body: { status: 'completed' } });
    const task = await request('/api/tasks', { method: 'POST', token: manager, status: 201, body: { jobId: job.id, customerId: accounts.customer.id, vehicleId: vehicle.id, type: 'pickup', scheduledTime: new Date().toISOString() } });
    assert.equal((await request('/api/tasks?type=delivery', { token: manager })).length, 0);
    assert.equal((await request('/api/tasks?type=pickup', { token: manager })).length, 1);
    await request(`/api/tasks/${task.id}/assign-driver`, { method: 'PUT', token: manager, body: { driverId: accounts.driver.id } });
    await request(`/api/tasks/${task.id}/status`, { method: 'PUT', token: accounts.driver.token, body: { status: 'completed' } });
    const part = await request('/api/parts', { method: 'POST', token: technician, status: 201, body: { jobId: job.id, partName: 'Filter', quantity: 1 } });
    await request(`/api/parts/${part.id}/approve`, { method: 'PUT', token: manager, body: { status: 'approved' } });
    const report = await request('/api/reports', { method: 'POST', token: technician, status: 201, body: { jobId: job.id, diagnosis: 'Worn filter', workPerformed: 'Replaced filter' } });
    await request(`/api/reports/${report.id}`, { method: 'PUT', token: technician, body: { status: 'submitted' } });
    await request(`/api/reports/${report.id}/approve`, { method: 'PUT', token: manager });
    for (const endpoint of ['jobs', 'tasks', 'parts', 'reports', 'inventory', 'admin/logs']) {
      assert.ok(Array.isArray(await request(`/api/${endpoint}?page=invalid&limit=invalid`, { token: admin })));
    }
    const health = await request('/api/admin/health', { token: admin });
    assert.equal(health.stats.users.length, 5);
    assert.equal(health.database.connected, true);
  } finally {
    if (server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
  }
});
