// Run against the local Vite server using agent-browser eval --stdin.
// Use a dedicated browser session: this exercises local demo records.
window.__autocareVerification = { status: 'running', results: [] };
void (async () => {
  const router = document.querySelector('#app').__vue_app__.config.globalProperties.$router;
  const results = window.__autocareVerification.results;
  const pause = () => new Promise((resolve) => setTimeout(resolve, 500));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const go = async (path) => { await router.push(path); await pause(); };
  const fill = (selector, value) => {
    const input = document.querySelector(selector);
    assert(input, `Missing input ${selector}`);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const submit = async () => { document.querySelector('form').requestSubmit(); await pause(); };
  const clickText = async (text) => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim().startsWith(text));
    assert(button, `Missing button ${text}`);
    button.click(); await pause();
  };
  const login = async (role) => {
    await go('/select-role');
    await clickText(role[0].toUpperCase() + role.slice(1));
    fill('input[type=email]', `${role}-random-928@example.com`);
    fill('input[type=password]', 'x');
    await submit();
    assert(router.currentRoute.value.path === `/${role}`, `Login failed for ${role}`);
    assert(document.querySelector('main'), `Dashboard missing for ${role}`);
    results.push(`Login ${role}: PASS`);
  };
  const routes = {
    customer: ['', '/booking', '/progress', '/reports'],
    manager: ['', '/requests', '/technicians', '/inventory', '/reports'],
    technician: ['', '/jobs', '/parts', '/reports'],
    driver: ['', '/pickups', '/deliveries', '/history'],
    admin: ['', '/users', '/roles', '/logs', '/health'],
  };
  for (const [role, paths] of Object.entries(routes)) {
    await login(role);
    for (const suffix of paths) {
      await go(`/${role}${suffix}`);
      assert(document.querySelector('main h1'), `Missing heading ${role}${suffix}`);
      assert(!document.querySelector('vite-error-overlay'), 'Vite error overlay');
      for (const link of document.querySelectorAll('a[href^="/"]')) {
        assert(router.resolve(link.getAttribute('href')).name !== 'not-found', `Broken link ${link.getAttribute('href')}`);
      }
      results.push(`Route /${role}${suffix}: PASS`);
    }
  }
  await login('customer');
  await go('/customer/booking');
  fill('input[placeholder="e.g. Toyota Camry 2022"]', 'Verification Car');
  fill('input[placeholder="License plate"]', 'QA-928');
  fill('input[placeholder="Address"]', 'Verification Street');
  await submit();
  assert(document.body.innerText.includes('Demo booking saved!'), 'Booking failed');
  await go('/customer/progress');
  assert(document.body.innerText.includes('Verification Car'), 'Booking missing in progress');
  await login('manager');
  await go('/manager/requests');
  const card = [...document.querySelectorAll('select')].find((select) => select.closest('.reveal')?.textContent.includes('QA-928'));
  assert(card, 'Customer booking is not visible to manager');
  card.value = 'Mike Johnson'; card.dispatchEvent(new Event('change', { bubbles: true }));
  await pause();
  await login('technician');
  await go('/technician/jobs');
  assert(document.body.innerText.includes('QA-928'), 'Assigned booking is not visible to technician');
  for (let step = 0; step < 2; step++) {
    const jobCard = [...document.querySelectorAll('.reveal')].find((item) => item.textContent.includes('QA-928'));
    const button = jobCard?.querySelector('button');
    assert(button, 'Job status action missing'); button.click(); await pause();
  }
  await login('customer');
  await go('/customer/reports');
  assert(document.body.innerText.includes('Verification Car'), 'Completed job missing from customer reports');
  results.push('Customer booking -> manager assignment -> technician completion -> customer report: PASS');
  await go('/admin');
  assert(router.currentRoute.value.path === '/customer', 'Role guard failed');
  results.push('Role guard: PASS');
  await go('/chatbot');
  await clickText('Check engine light is on');
  await pause();
  assert(document.body.innerText.includes('diagnostics scan'), 'Chat response failed');
  results.push('Chat assistant response: PASS');
  await go('/customer');
  await clickText('Log out');
  await go('/customer/progress');
  assert(router.currentRoute.value.path === '/login', 'Logged-out guard failed');
  results.push('Logout and protected-route guard: PASS');
  window.__autocareVerification.status = 'passed';
})().catch((error) => {
  window.__autocareVerification.status = 'failed';
  window.__autocareVerification.error = error.message;
});
'Verification started; read window.__autocareVerification for results.';
