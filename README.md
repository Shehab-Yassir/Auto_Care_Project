# AutoCare - Professional Full-Stack Application

A premium automotive service platform built with Vue 3, TypeScript, Express.js, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup Instructions

#### 1. Backend Setup

```bash
cd autoCare-backend
npm install
cp .env.example .env
```

Configure `.env` (update JWT_SECRET for production):
```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production
```

Start the server:
```bash
npm run dev        # Development with auto-reload
npm start          # Production
```

The backend will run on `http://localhost:3000`

**Seed the database (optional):**
```bash
npm run seed
```

#### 2. Frontend Setup

```bash
cd autoCare-vue
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Default Test Credentials

After seeding the database, use any of these accounts:

**Customer:**
- Email: `john@example.com`
- Password: `password123`

**Technician:**
- Email: `mike@autocare.com`
- Password: `password123`

**Driver:**
- Email: `james@autocare.com`
- Password: `password123`

**Manager:**
- Email: `robert@autocare.com`
- Password: `password123`

**Admin:**
- Email: `admin@autocare.com`
- Password: `password123`

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- Production: Set via `VITE_API_URL` environment variable

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

#### Users
- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `PUT /users/:id/status` - Change user status (admin only)

#### Vehicles
- `GET /vehicles` - List vehicles
- `POST /vehicles` - Create vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

#### Jobs
- `GET /jobs` - List jobs (filtered by role)
- `POST /jobs` - Create job
- `PUT /jobs/:id/status` - Update job status
- `PUT /jobs/:id/assign-technician` - Assign technician

#### Tasks
- `GET /tasks` - List tasks (filtered by role)
- `POST /tasks` - Create task
- `PUT /tasks/:id/status` - Update task status
- `PUT /tasks/:id/assign-driver` - Assign driver

#### Inventory
- `GET /inventory` - List inventory
- `POST /inventory` - Create inventory item
- `PUT /inventory/:id` - Update inventory
- `DELETE /inventory/:id` - Delete inventory

#### Reports
- `GET /reports` - List repair reports
- `POST /reports` - Create report
- `PUT /reports/:id/approve` - Approve report

#### Admin
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/logs` - Audit logs

## 🔐 Security Features

✅ **Authentication**
- JWT token-based authentication
- Secure password hashing with bcryptjs
- Token expiration (7 days default)

✅ **Authorization**
- Role-based access control (RBAC)
- Route-level protection on frontend
- Endpoint-level protection on backend
- Field-level permission checks

✅ **Data Protection**
- Input validation on server
- SQL injection prevention via parameterized queries
- XSS protection (Vue built-in)
- CORS configured
- Secure error messages (no sensitive info leaked)

✅ **Best Practices**
- Environment variables for secrets
- No hardcoded credentials
- Audit logging for admin actions
- User session tracking
- Account suspension capability

## 🛠 Project Structure

```
autoCare-backend/
├── src/
│   ├── index.js              # Main server
│   ├── config/database.js    # Database setup and schema
│   ├── middleware/
│   │   ├── auth.js          # JWT and role middleware
│   │   └── errorHandler.js  # Global error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── vehicles.js
│   │   ├── jobs.js
│   │   ├── tasks.js
│   │   ├── inventory.js
│   │   ├── reports.js
│   │   ├── parts.js
│   │   └── admin.js
│   └── scripts/seed.js       # Database seeding

autoCare-vue/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── router/index.ts       # Routes with guards
│   ├── stores/
│   │   ├── auth.ts           # Authentication store
│   │   └── data.ts           # Data stores
│   ├── services/
│   │   ├── apiClient.ts      # Real API client
│   │   └── validation.ts     # Form validation
│   ├── composables/
│   │   ├── useToast.ts       # Toast notifications
│   │   └── useReveal.ts      # Scroll animations
│   ├── components/
│   │   ├── ui/               # UI components
│   │   ├── layout/           # Layout components
│   │   └── illustrations/    # SVG illustrations
│   └── views/                # Page components
```

## 📋 Database Schema

### Tables
- `users` - User accounts with roles
- `vehicles` - Customer vehicles
- `jobs` - Service jobs/requests
- `tasks` - Pickup/delivery tasks
- `part_requests` - Part requests by technicians
- `inventory` - Parts inventory
- `repair_reports` - Service reports
- `audit_logs` - Action audit trail

All tables include:
- Primary key (UUID-based)
- Timestamps (createdAt, updatedAt)
- Foreign key relationships
- Proper indexes for performance
- Constraints for data integrity

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, desktop
- **Dark Mode** - Built-in with Tailwind CSS
- **Smooth Animations** - Page transitions, hover effects
- **Toast Notifications** - Success, error, warning, info
- **Loading States** - Progress bars, skeleton loaders
- **Professional Components** - Buttons, cards, inputs, badges
- **Consistent Theme** - Color system, typography, spacing
- **Accessible** - ARIA labels, keyboard navigation

## 🚢 Deployment

### Frontend Deployment (Vercel, Netlify, etc.)

1. Update `.env.production` with your API URL:
   ```env
   VITE_API_URL=https://api.yourapi.com
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy the `dist/` folder to your hosting service

### Backend Deployment (Heroku, Railway, AWS, etc.)

1. Update `.env` with production settings:
   ```env
   NODE_ENV=production
   JWT_SECRET=<strong-random-key>
   DB_PATH=/app/data/autocare.db
   CORS_ORIGIN=https://yourfrontend.com
   ```

2. Deploy using your hosting provider's CLI/Dashboard

3. Seed production database (if first deployment):
   ```bash
   npm run seed
   ```

### Database Persistence

SQLite stores data in `data/autocare.db`. For production:
- Use PostgreSQL instead of SQLite (recommended)
- Set up proper backups
- Monitor database performance

## 📊 Key Metrics

After setup, check admin dashboard for:
- Total users by role
- Job statistics by status
- Inventory levels
- System health
- Audit logs

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 3000 is available
- Verify Node.js version is 18+
- Check database directory permissions

**Frontend won't connect to backend:**
- Verify backend is running on port 3000
- Check `.env.development` has correct VITE_API_URL
- Check browser console for CORS errors

**Authentication failed:**
- Verify seed script ran: `npm run seed`
- Check credentials match seeded data
- Clear browser localStorage and retry

**Database locked:**
- Close all terminal sessions running the server
- Remove any `.db-journal` files
- Restart the application

## 📝 Next Steps

1. ✅ Test full authentication flow
2. ✅ Verify all role-based permissions
3. ✅ Test CRUD operations for each resource
4. ✅ Verify responsive design on mobile
5. ✅ Performance optimization
6. ✅ Security audit
7. ✅ Production deployment

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response logs in browser console
3. Check backend terminal for error logs
4. Verify database integrity with `npm run seed`

## 📄 License

This project is proprietary and confidential.

---

**Built with:** Vue 3 • TypeScript • Express.js • SQLite • Tailwind CSS

**Version:** 1.0.0  
**Last Updated:** 2024
