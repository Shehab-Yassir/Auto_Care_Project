# Local verification — 2026-09-06

## Results

- `npm.cmd --prefix autoCare-vue run build`: passed TypeScript checking and Vite production build.
- `npm.cmd --prefix autoCare-backend test`: passed the API integration test on a fresh in-memory SQLite database.
- Backend startup and `GET /health` on port 3000: passed.
- Database seeding on a fresh in-memory database: passed.
- Browser: all five roles accepted arbitrary email addresses with a one-character password; all 22 dashboard routes rendered with valid navigation links.
- Booking workflow: customer booking appeared for the manager, assignment appeared for the technician, and completion appeared in the customer's reports.
- Technician forms: rejected an unknown job; valid part requests and repair reports saved successfully.
- Driver: accepted and completed a pickup; history updated.
- Admin: suspended and reactivated a user; demo health/activity rendered without protected API requests.
- Registration UI: mismatched passwords rejected; successful registration verified against the temporary backend database.
- Session refresh, role guards, logout, chatbot response, and the not-found page: passed.
- Invalid saved authentication JSON and a non-array saved collection recovered without a blank page.
- Visual checks: desktop home and mobile home/admin at 390px; mobile pages had no document-level horizontal overflow.
- Browser console: no application errors observed in the tested flows.

## Fixes

- Shared demo collections across all roles; sample technician/driver identities now match assigned records.
- Demo admin overview uses local sample information. The health page identifies its values as examples rather than live monitoring.
- Invalid saved session/collection data no longer causes initialization failures.
- Login honors the saved destination after authentication.
- Registration password length agrees with backend validation.
- Technician forms validate the assigned job and content before saving; failed saves keep the entered values.
- Suspended technicians are excluded from new assignment options.
- Backend priority/type-only filters now apply to the result set; malformed pagination falls back to valid values.
- Backend health statistics return all groups instead of only the first group.
- Backend authentication validates input types and normalizes emails consistently.
- Inventory accepts zero prices/thresholds, saves zero-price updates, and rejects invalid quantities.
- Database configuration loads before selecting the database path, creates its directory when needed, and seeding initializes the schema.

## Scope

Login is intentionally a local demo. Dashboard collections are sample data saved in the browser, not records synchronized with the backend. Each role uses a sample identity; the supplied email is retained. Registration still calls the real backend. The chatbot uses predefined responses, and the health-page service cards are examples.

API integration tests exercise registration/login, authentication, vehicles, bookings, technician assignment/completion, driver tasks, reports, parts, inventory, filters, pagination, and health statistics. This is local functional verification, not an exhaustive security or production-load audit.

## Repeating checks

```powershell
npm.cmd --prefix autoCare-vue run build
npm.cmd --prefix autoCare-backend test
```

For browser checks, start Vite and open it in a dedicated agent-browser session, then run these scripts through `agent-browser eval --stdin` in order:

- `autoCare-vue/scripts/browser-smoke.js`
- `autoCare-vue/scripts/browser-actions.js`

Read `window.__autocareVerification` and `window.__autocareActions` until their status changes from `running` to `passed` or `failed`. These scripts create and update demo records in the test browser.
