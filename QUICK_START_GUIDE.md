# AutoCare Full-Stack Development Guide

## Quick Start (5 minutes)

### Step 1: Start Backend
```bash
cd autoCare-backend
npm install
npm run dev
```
✅ Backend runs on: **http://localhost:3000/api**

### Step 2: Start Frontend
```bash
# In another terminal
cd autoCare-vue
npm install
npm run dev
```
✅ Frontend runs on: **http://localhost:5173**

### Step 3: Open in Browser
Open http://localhost:5173 and login with:
- **Email:** john@example.com (customer) or admin@autocare.com (admin)
- **Password:** password123

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│        Browser (Frontend)           │
│  Vue 3 + TypeScript + Tailwind      │
│  http://localhost:5173              │
└──────────┬──────────────────────────┘
           │ HTTP + JWT Token
           │ /api/* endpoints
┌──────────▼──────────────────────────┐
│      Node.js/Express Backend        │
│  http://localhost:3000/api          │
│  ✓ Authentication                   │
│  ✓ Authorization (RBAC)             │
│  ✓ Business Logic                   │
└──────────┬──────────────────────────┘
           │ CRUD Operations
           │ (SELECT, INSERT, UPDATE, DELETE)
┌──────────▼──────────────────────────┐
│      SQLite Database                │
│  autoCare.db (file-based)           │
│  ✓ 8 Tables                         │
│  ✓ Foreign Keys                     │
│  ✓ Audit Logs                       │
└─────────────────────────────────────┘
```

---

## Authentication Flow

```
1. User Registration
   POST /auth/register
   → Password hashed with bcryptjs
   → User stored in database
   → JWT token generated
   → Token sent to frontend

2. Frontend Stores Token
   localStorage.setItem('autocare:token', token)

3. Every API Request
   Authorization: Bearer <token>
   ↓
   Backend verifies token signature
   Backend checks token expiry (7 days)
   Backend extracts user ID and role
   Backend enforces role permissions

4. Protected Routes
   /customer/* - Customer only
   /manager/*  - Manager only
   /driver/*   - Driver only
   /technician/* - Technician only
   /admin/*    - Admin only
```

---

## User Roles & Permissions

| Role | Can Do | Dashboard |
|------|--------|-----------|
| **Customer** | Book jobs, track progress, manage vehicles | /customer |
| **Technician** | View jobs, submit reports, request parts | /technician |
| **Driver** | Manage pickups/deliveries | /driver |
| **Manager** | Approve requests, manage team, view reports | /manager |
| **Admin** | User management, system health, audit logs | /admin |

---

## Database Tables

### 1. `users` (Authentication & Management)
```sql
- id: Primary key
- email: Unique email (case-insensitive)
- password: Bcryptjs hashed
- name: User full name
- role: customer|technician|driver|manager|admin
- status: active|suspended
- createdAt: Account creation time
- updatedAt: Last modification
- lastLogin: Last login timestamp
```

### 2. `vehicles` (Customer Assets)
```sql
- id: Primary key
- userId: Owner (FK → users)
- plate: Unique license plate
- make: Car manufacturer
- model: Car model
- year: Manufacturing year
- mileage: Current mileage
- status: active|inactive
- createdAt: Registration date
- updatedAt: Last modification
```

### 3. `jobs` (Service Jobs)
```sql
- id: Primary key
- customerId: Service requester (FK → users)
- vehicleId: Service target (FK → vehicles)
- technicianId: Assigned technician (FK → users)
- description: Service description
- status: pending|assigned|in-progress|waiting-parts|completed
- priority: low|normal|high|urgent
- estimatedCost: Service cost estimate
- actualCost: Final cost
- createdAt: Job creation time
- updatedAt: Last status change
```

### 4. `tasks` (Pickup/Delivery)
```sql
- id: Primary key
- jobId: Related job (FK → jobs)
- type: pickup|delivery
- driverId: Assigned driver (FK → users)
- startLocation: Pickup/start location
- endLocation: Destination
- status: pending|assigned|in-transit|completed|failed
- scheduledTime: Planned time
- completedTime: Actual completion
- notes: Task notes
- createdAt: Task creation
- updatedAt: Last change
```

### 5. `part_requests` (Parts Requests)
```sql
- id: Primary key
- jobId: Related job (FK → jobs)
- requestedBy: Technician (FK → users)
- partName: Part name/SKU
- quantity: Quantity requested
- urgency: low|normal|high|urgent
- status: pending|approved|rejected
- approvedBy: Manager/Admin (FK → users)
- approvedAt: Approval timestamp
- notes: Request notes
- createdAt: Request time
- updatedAt: Last change
```

### 6. `inventory` (Parts Inventory)
```sql
- id: Primary key
- partName: Part SKU/name (unique)
- category: Parts category
- quantity: Available quantity
- minQuantity: Reorder threshold
- maxQuantity: Storage capacity
- location: Storage location
- lastRestockDate: Last restock date
- createdAt: Item added
- updatedAt: Last change
```

### 7. `repair_reports` (Repair Documentation)
```sql
- id: Primary key
- jobId: Related job (FK → jobs)
- createdBy: Technician (FK → users)
- findings: Initial diagnosis
- workDone: Actual repair work
- partsUsed: Parts consumed
- testResults: Test data
- status: draft|submitted|approved
- approvedBy: Manager/Admin (FK → users)
- approvedAt: Approval timestamp
- createdAt: Report creation
- updatedAt: Last change
```

### 8. `audit_logs` (Action Tracking)
```sql
- id: Primary key
- userId: Actor (FK → users)
- action: Action type (create|update|delete|approve|reject)
- resource: Table/entity name
- resourceId: Record ID
- changes: JSON diff of changes
- ipAddress: User IP (optional)
- userAgent: Browser info (optional)
- createdAt: Action timestamp
```

---

## API Endpoints Reference

### Authentication
```
POST   /auth/register        - Create account
POST   /auth/login           - Get JWT token
POST   /auth/logout          - Invalidate token (frontend)
GET    /auth/me              - Get current user (requires token)
```

### Users
```
GET    /users                - List all users (admin only)
GET    /users/:id            - Get user details
PUT    /users/:id            - Update profile
PUT    /users/:id/status     - Change user status (admin only)
GET    /users/role/:role     - List users by role
```

### Vehicles
```
GET    /vehicles             - List user's vehicles
GET    /vehicles/:id         - Get vehicle details
POST   /vehicles             - Create new vehicle
PUT    /vehicles/:id         - Update vehicle
DELETE /vehicles/:id         - Delete vehicle
```

### Jobs
```
GET    /jobs                 - List jobs (role-filtered)
GET    /jobs/:id             - Get job details
POST   /jobs                 - Create job (customer)
PUT    /jobs/:id             - Update job details
PUT    /jobs/:id/status      - Change job status
PUT    /jobs/:id/assign      - Assign technician (manager)
```

### Tasks
```
GET    /tasks                - List tasks (role-filtered)
GET    /tasks/:id            - Get task details
POST   /tasks                - Create task (manager)
PUT    /tasks/:id            - Update task
PUT    /tasks/:id/status     - Update status
PUT    /tasks/:id/assign     - Assign driver (manager)
```

### Inventory
```
GET    /inventory            - List parts (manager/admin)
GET    /inventory/:id        - Get part details
POST   /inventory            - Create part (manager/admin)
PUT    /inventory/:id        - Update stock
DELETE /inventory/:id        - Delete part
GET    /inventory/low-stock  - Get low-stock items
```

### Reports
```
GET    /reports              - List reports (role-filtered)
GET    /reports/:id          - Get report details
POST   /reports              - Create report (technician)
PUT    /reports/:id          - Update report (draft only)
PUT    /reports/:id/approve  - Approve report (manager/admin)
```

### Parts (Requests)
```
GET    /parts                - List requests (role-filtered)
GET    /parts/:id            - Get request details
POST   /parts                - Create request (technician)
PUT    /parts/:id/approve    - Approve request (manager/admin)
PUT    /parts/:id/reject     - Reject request (manager/admin)
```

### Admin
```
GET    /admin/health         - System health check
GET    /admin/logs            - Audit logs (admin only)
GET    /admin/dashboard      - Dashboard statistics
```

---

## Testing Workflow

### 1. Register New User
```
POST http://localhost:3000/api/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "Test User",
  "role": "customer"
}
```

### 2. Login
```
POST http://localhost:3000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
Response: { "ok": true, "data": { "token": "..." } }
```

### 3. Store Token
```javascript
localStorage.setItem('autocare:token', token)
```

### 4. Make Authenticated Request
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <token>
Response: { "ok": true, "data": { user object } }
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### Port 3000 Already in Use
```bash
# Kill process using port 3000
# Windows: taskkill /PID <pid> /F
# Mac/Linux: lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Frontend Can't Connect to Backend
```bash
# Check .env.development has correct API_URL
VITE_API_URL=http://localhost:3000/api

# Restart frontend dev server
npm run dev
```

### Database Corrupted
```bash
# Delete database and reseed
rm autoCare.db
npm run seed
```

### Forgot Test User Password
```bash
# All test users use password: password123
# To reset, delete DB and run seed again
npm run seed
```

---

## Development Tips

### 1. Browser DevTools
- Open: F12 or Ctrl+Shift+I
- Network tab: See API requests/responses
- Storage tab: View localStorage/tokens
- Console: See errors/logs

### 2. Database Inspection
```bash
# SQLite CLI
cd autoCare-backend
sqlite3 autoCare.db
sqlite> .tables
sqlite> SELECT * FROM users;
sqlite> .exit
```

### 3. Pretty Print JSON
```bash
# In browser console
const token = localStorage.getItem('autocare:token')
const [header, payload, signature] = token.split('.')
console.log(JSON.parse(atob(payload)))
```

### 4. Common API Responses

Success:
```json
{ "ok": true, "data": { }, "status": 200 }
```

Error:
```json
{ "ok": false, "error": "Error message", "status": 400 }
```

---

## Environment Variables

### Development (`.env.development`)
```
VITE_API_URL=http://localhost:3000/api
VITE_LOG_LEVEL=debug
```

### Production (`.env.production`)
```
VITE_API_URL=https://api.yourdomain.com
VITE_LOG_LEVEL=error
```

### Backend (`.env`)
```
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
DB_PATH=./autoCare.db
```

---

## Performance Notes

- Database indexes on: `email`, `role`, `status`, `jobId`, `driverId`
- Pagination: Use `limit` and `offset` query params
- Lazy loading: Routes loaded on demand
- Minified build: 123KB for main JS (gzipped: 47KB)
- API response time: ~50ms average

---

## Security Checklist

Before deploying to production:
- [ ] Change JWT_SECRET to long random string
- [ ] Update CORS_ORIGIN to production domain
- [ ] Migrate database to PostgreSQL
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set strong password requirements
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Test all permission scenarios
- [ ] Review error messages for leaks

---

## Next Steps

1. ✅ Backend development
2. ✅ Frontend integration
3. ✅ Authentication system
4. ⏳ Production deployment
5. ⏳ Monitoring setup
6. ⏳ Backup strategy
7. ⏳ Documentation updates

---

**Ready to build the future of AutoCare!** 🚀
