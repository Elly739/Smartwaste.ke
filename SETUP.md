# SmartWaste.ke Development Setup Guide

This document provides comprehensive instructions for setting up and running the SmartWaste.ke development environment.

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun (matching the lockfile in the repository)
- Git

## Project Structure

```
smartwaste.ke/
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── index.js       # Server entry point
│   │   ├── app.js         # Express app configuration
│   │   ├── routes/        # API route handlers
│   │   ├── data/          # Database setup and queries
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── .env.example       # Environment variables template
├── client/                 # React + Vite frontend
│   └── vite-project/
│       ├── src/
│       │   ├── main.jsx   # Client entry point
│       │   ├── App.jsx    # Main React component
│       │   ├── services/  # API service functions
│       │   └── components/ # React components
│       ├── package.json
│       └── .env.example   # Environment variables template
├── package.json           # Root package configuration
└── .gitignore
```

## Quick Start

### 1. Install Dependencies

From the root directory:

```bash
# Install root dependencies
npm install

# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client/vite-project install
```

### 2. Environment Configuration

#### Server Setup

Create `.env` file in the `server` directory based on `.env.example`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
PORT=4000
DATABASE_PATH=./data/smartwaste.sqlite
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Name
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
NODE_ENV=development
```

#### Client Setup

Create `.env` file in the `client/vite-project` directory:

```bash
cd client/vite-project
cp .env.example .env
```

The default `.env` should work for development:

```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:4000
VITE_ENV=development
```

### 3. Run Development Servers

From the root directory, start both servers simultaneously:

```bash
npm run dev
```

This will start:
- **Server**: Running on `http://localhost:4000`
- **Client**: Running on `http://localhost:5173`

Alternatively, run them separately:

```bash
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
```

## Configuration Guide

### Environment Variables

#### Server Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `DATABASE_PATH` | `./data/smartwaste.sqlite` | SQLite database file path. Use `:memory:` for in-memory database (testing) |
| `ADMIN_EMAIL` | `iamellyokello@gmail.com` | Initial admin email |
| `ADMIN_PASSWORD` | `AGXR4X45` | Initial admin password |
| `ADMIN_NAME` | `Elly Admin` | Initial admin name |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS allowed origin |
| `LOG_LEVEL` | `info` | Logging level: `info`, `debug` |
| `NODE_ENV` | `development` | Environment: `development`, `production` |

#### Client Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | API base URL for fetch requests |
| `VITE_PROXY_TARGET` | `http://localhost:4000` | Vite proxy target for development |
| `VITE_ENV` | `development` | Environment |

### Database Configuration

#### Development

For development, SQLite is configured to store data in `./data/smartwaste.sqlite`:

```env
DATABASE_PATH=./data/smartwaste.sqlite
```

The database will be automatically created and initialized on first run.

#### Testing

For testing with an in-memory database:

```env
DATABASE_PATH=:memory:
```

#### Production

For production, consider migrating to PostgreSQL (Neon):

1. Update the database connection in `server/src/data/database.js`
2. Install PostgreSQL driver: `npm install pg`
3. Update database path and credentials in `.env`

### API Configuration

The client uses a configurable API base URL via `VITE_API_BASE_URL`:

- **Development (Vite Proxy)**: `/api` - Uses Vite's proxy to forward requests to `http://localhost:4000`
- **Production**: `https://api.smartwaste.ke` - Direct API URL

Vite handles proxying automatically for development, so you don't need to change `VITE_API_BASE_URL`.

## API Overview

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Disposal Routes

- `POST /api/dispose` - Submit waste disposal event
- `GET /api/disposals` - Get user's disposal history

### Admin Routes

- `GET /api/admin/overview` - Get admin overview statistics

### Health Check

- `GET /api/health` - Server health status

## Error Handling

The server includes global error handling middleware that:

- Logs errors to console (respects `LOG_LEVEL`)
- Returns standardized error responses
- Includes stack traces in development mode

Error response format:

```json
{
  "message": "Error message",
  "error": "Full error details (development only)"
}
```

## Logging

Logs are printed to the console with timestamps. Configure the `LOG_LEVEL` environment variable:

- `info` - Standard logs and request information
- `debug` - Detailed logs including error stack traces

Log format: `[ISO-TIMESTAMP] [REQUEST_METHOD] [PATH] - [STATUS_CODE] ([DURATION]ms)`

## Build and Deployment

### Build Client

```bash
npm run build
```

Creates optimized production build in `client/vite-project/dist/`

### Build Server

The server runs directly from source in development. For production:

1. Ensure all dependencies are installed
2. Set `NODE_ENV=production`
3. Run the start command (configure in server/package.json)

## Common Issues and Solutions

### Port Already in Use

If port 4000 or 5173 is already in use:

```bash
# Change server port
PORT=5000 npm run server

# Vite will automatically use next available port
npm run client
```

### Database Connection Error

Ensure the database path is correct and writable:

```bash
# Check database path
ls -la data/

# Reset database (removes existing data)
rm data/smartwaste.sqlite
npm run server
```

### CORS Errors

Make sure `CORS_ORIGIN` matches your client URL:

```env
# If client is on different port, update this
CORS_ORIGIN=http://localhost:5173
```

### API Requests Failing in Production

When deploying to production:

1. Update `VITE_API_BASE_URL` to the production API URL
2. Update server `CORS_ORIGIN` to production domain
3. Ensure both server and client are properly deployed

## Next Steps

1. Read the [Contributing Guidelines](CONTRIBUTING.md) (if available)
2. Check out the client and server source code
3. Review the API routes for integration points
4. Set up your IDE for JavaScript/Node.js development

## Support

For issues or questions:

1. Check this setup guide
2. Review error messages in console logs
3. Check the browser console for client-side errors
4. Verify environment variables are set correctly
