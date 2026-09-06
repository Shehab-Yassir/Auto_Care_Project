// Follow-up to browser-smoke.js in the same isolated browser session.
window.__autocareActions = { status: 'running', results: [] };
void (async () => {
  const router = document.querySelector('#app').__vue_app__.config.globalProperties.$router;
  const results = window.__autocareActions.results;
  const pause = () => new Promise((resolve) => setTimeout(resolve, 450));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const go = async (path) => { await router.push(path); await pause(); };
  const click = async (text) => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim().startsWith(text));
    assert(button, `Missing button: ${text}`); button.click(); await pause();
  };
  const fill = (selector, value) => {
    const input = document.querySelector(selector);
    assert(input, `Missing input: ${selector}`); input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const submit = async () => { document.querySelector('form').requestSubmit(); await pause(); };
  const login = async (role) => {
    await go('/select-role'); await click(role);
    fill('input[type=email]', 'actions@example.com'); fill('input[type=password]', 'x'); await submit();
  };
  await login('Technician');
  await go('/technician/parts');
  fill('input[placeholder^="Job ID"]', 'missing-job');
  fill('input[placeholder="Part name"]', 'QA filter');
  await submit();
  assert(document.body.innerText.includes('Enter the ID of a job assigned to you.'), 'Unknown job was not rejected');
  fill('input[placeholder^="Job ID"]', 'job-001'); await submit();
  assert(document.body.innerText.includes('QA filter'), 'Part request was not saved');
  results.push('Parts: reject unknown job and save valid request: PASS');
  await go('/technician/reports');
  fill('input[placeholder="Job ID"]', 'job-001');
  fill('textarea[placeholder="Diagnosis"]', 'QA diagnosis');
  fill('textarea[placeholder="Work performed"]', 'QA repair');
  await submit();
  assert(document.body.innerText.includes('QA diagnosis'), 'Repair report was not saved');
  results.push('Technician report submission: PASS');
  await login('Driver'); await go('/driver/pickups');
  await click('Accept'); await click('Mark picked up');
  await go('/driver/history');
  assert(document.body.innerText.includes('Jane Smith'), 'Completed pickup missing from history');
  results.push('Driver accepts and completes pickup; history updates: PASS');
  await login('Admin'); await go('/admin/users');
  await click('Suspend');
  assert(document.body.innerText.includes('Reactivate'), 'Suspend failed');
  await click('Reactivate');
  assert(!document.body.innerText.includes('Reactivate'), 'Reactivate failed');
  results.push('Admin suspends and reactivates a user: PASS');
  await go('/admin');
  assert(!document.body.innerText.includes('currently unavailable'), 'Demo admin made protected API calls');
  results.push('Admin demo health and activity load: PASS');
  window.__autocareActions.status = 'passed';
})().catch((error) => { window.__autocareActions.status = 'failed'; window.__autocareActions.error = error.message; });
'Action verification started.';
