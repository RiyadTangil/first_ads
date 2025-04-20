# Client Dashboard with Authentication

A secure Next.js dashboard application with role-based authentication using MongoDB as a backend database.

## Features

- **User Authentication**
  - Email and password login
  - User registration with email validation
  - Secure password hashing
  - Password reset functionality
  - Form validation with Zod
  - Protected routes

- **Role-Based Access Control**
  - User and Admin roles
  - Different dashboards based on role
  - Middleware protection for routes

- **MongoDB Integration**
  - User data stored in MongoDB
  - Secure connection handling
  - Data validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd client_com
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add:
```
MONGODB_URI=mongodb+srv://sadamon:Ri11559988@cluster0.ez5ix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=client_com
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

## Authentication Endpoints

- **Login**: `/api/auth/[...nextauth]`
- **Register**: `/api/auth/register`
- **Forgot Password**: `/api/auth/forgot-password`
- **Reset Password**: `/api/auth/reset-password`

## Pages

- **Home**: `/`
- **Login**: `/auth/login`
- **Register**: `/auth/register`
- **Forgot Password**: `/auth/forgot-password`
- **Reset Password**: `/auth/reset-password/[token]`
- **User Dashboard**: `/dashboard`
- **Admin Dashboard**: `/admin`

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form, Zod
- **Database**: MongoDB, Mongoose
- **Password Security**: bcryptjs

## Project Structure

```
├── app/                     # Next.js app router files
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes
│   │   └── auth/            # Authentication endpoints
│   ├── auth/                # Auth UI pages
│   ├── dashboard/           # User dashboard pages
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # UI components
│   └── AuthProvider.tsx     # NextAuth provider
├── lib/                     # Utility functions
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # MongoDB connection
│   └── validations.ts       # Zod validation schemas
├── models/                  # Mongoose models
│   └── User.ts              # User schema
├── middleware.ts            # NextAuth middleware
└── types/                   # TypeScript type definitions
```

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for session management
- Protected routes with NextAuth middleware
- Form validation with Zod
