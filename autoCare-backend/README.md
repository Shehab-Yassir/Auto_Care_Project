# Backend Directory Structure

- `src/`
  - `index.js` - Main server entry point
  - `config/`
    - `database.js` - Database initialization and schema
  - `middleware/`
    - `auth.js` - Authentication and authorization middleware
    - `errorHandler.js` - Global error handling
  - `routes/`
    - `auth.js` - Authentication endpoints (login, register, logout)
    - `users.js` - User management endpoints
    - `vehicles.js` - Vehicle management endpoints
    - `jobs.js` - Job/service management endpoints
    - `tasks.js` - Pickup/delivery task endpoints
    - `inventory.js` - Inventory management endpoints
    - `reports.js` - Repair report endpoints
    - `parts.js` - Part request endpoints
    - `admin.js` - Admin dashboard and logs endpoints
  - `scripts/`
    - `seed.js` - Database seeding script

## Setup Instructions

1. Install dependencies:
   ```bash
   cd autoCare-backend
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration

4. Seed database (optional):
   ```bash
   npm run seed
   ```

5. Start server:
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

Server will run on http://localhost:3000
