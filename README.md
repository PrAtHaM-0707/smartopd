# SmartOPD - Hospital Queue Management System

A complete hospital queue management system built with React, TypeScript, Vite, and Supabase.

## Features

- **Patient Registration**: Public registration with token generation
- **Real-time Queue Management**: Live queue status and updates
- **Admin Dashboard**: Complete administrative control
- **Doctor Queue Management**: Personal queue views for doctors
- **Audit Logging**: Track all system activities
- **Multi-role Authentication**: Super Admin, Doctor, Receptionist roles
- **Appointment Booking**: Schedule appointments with doctors

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query
- **Routing**: React Router

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your project URL and anon key
3. Update `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run Database Schema

**Option A: Manual Setup**
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database_schema.sql`
4. Click "Run" to create all tables and seed data
5. Copy and paste the contents of `fix_rls_policies.sql`
6. Click "Run" to apply the Row Level Security fixes

**Option B: Automated Setup**
Run `setup.bat` (Windows) for guided setup instructions.

### 5. Create Admin Users

In Supabase Authentication > Users, create these test users:

1. **Super Admin**
   - Email: `admin@hospital.com`
   - Password: `admin123`
   - Role: SUPER_ADMIN

2. **Doctor**
   - Email: `doctor@hospital.com`
   - Password: `doctor123`
   - Role: DOCTOR

3. **Receptionist**
   - Email: `reception@hospital.com`
   - Password: `reception123`
   - Role: RECEPTIONIST

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8081`

## Available Routes

### Public Routes
- `/` - Landing page
- `/register` - Patient registration
- `/queue` - Public queue status

### Admin Routes (Require Authentication)
- `/admin/login` - Admin login
- `/admin/dashboard` - Main dashboard
- `/admin/patients` - Patient management
- `/admin/doctors` - Doctor management
- `/admin/audit-logs` - Audit logs
- `/admin/my-queue` - Doctor's personal queue
- `/admin/queue-monitor` - Public queue monitor
- `/admin/register` - Patient registration (by staff)
- `/admin/user-register` - Admin user registration

## Database Schema

The system uses the following tables:
- `profiles` - User profiles (extends auth.users)
- `departments` - Hospital departments
- `doctors` - Doctor information
- `patients` - Patient records
- `queue_tokens` - Queue management
- `appointments` - Appointment bookings
- `audit_logs` - System activity logs

## Testing the Application

1. **Patient Registration**: Visit `/register` and register a patient
2. **Queue Status**: Visit `/queue` to see live queue
3. **Admin Login**: Visit `/admin/login` and login with test credentials
4. **Queue Management**: Use dashboard to call next patients
5. **Patient Management**: Update patient statuses and view audit logs

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── lib/                # Utilities and configurations
└── hooks/              # Custom React hooks
```

## Key Features Implemented

✅ Complete patient registration with token generation
✅ Real-time queue management with status updates
✅ Multi-role authentication system
✅ Audit logging for all operations
✅ Appointment booking system
✅ Doctor-specific queue views
✅ Public queue monitor
✅ Responsive UI with dark/light theme support
✅ Type-safe development with TypeScript
✅ Error boundaries and proper error handling

The project is fully functional and ready for production use!