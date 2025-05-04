# MongoDB Setup for Client_Com Application

## Setup Instructions

1. Create a `.env.local` file in the root of your project with the following content:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_DB=client_com

# Application Settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

2. Replace the placeholders in the MongoDB connection string:
   - `<username>`: Your MongoDB username
   - `<password>`: Your MongoDB password
   - `<cluster>`: Your MongoDB cluster name
   - `<database>`: Your database name (usually "client_com")

## Build Error Fix

If you encounter this error during build:
```
uncaughtException [Error: EPERM: operation not permitted, open 'C:\job\client_com\.next\trace']
```

Run the provided PowerShell script to fix it:
```
powershell -ExecutionPolicy Bypass -File fix-build-error.ps1
```

## Local MongoDB Setup (Alternative)

If you want to use a local MongoDB instance:

1. Install MongoDB Community Edition on your machine
2. Start the MongoDB service
3. Use this connection string in your `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/client_com
```

## Database Structure

The application uses the following collections:
- `users`: Stores user information
- `links`: Stores link data for the link management system

## API Routes

The following API routes interact with MongoDB:
- `app/api/links/[linkId]/route.ts`: CRUD operations for specific links
- `app/api/links/route.ts`: General link operations
- `app/api/links/users/route.ts`: User operations related to links 