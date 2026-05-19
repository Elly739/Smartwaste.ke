# SmartWaste.ke

A full-stack waste management application that incentivizes proper waste disposal through a points-based reward system. Users can record waste disposal activities at smart bins and earn points for environmental responsibility.

## Project Overview

SmartWaste.ke is built with modern web technologies to provide a scalable, maintainable solution for waste management:

- **Frontend**: React 19 + Vite with Tailwind CSS
- **Backend**: Express.js with Node.js
- **Database**: SQLite (development), PostgreSQL-ready for production
- **Architecture**: REST API with clear separation of concerns

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun

### Installation & Setup

```bash
# 1. Install all dependencies
npm install
npm --prefix server install
npm --prefix client/vite-project install

# 2. Start development servers
npm run dev

# The application will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:4000
```

See [SETUP.md](./SETUP.md) for detailed configuration options and environment setup.

## Key Features

### User Features
- **User Registration & Authentication** - Secure account creation and login
- **Waste Disposal Logging** - Record waste disposal activities at smart bins
- **Points & Rewards** - Earn points for each disposal activity
- **Disposal History** - View personal waste disposal records and points earned
- **Environmental Impact** - Track contributions to waste management

### Admin Features
- **Admin Dashboard** - Overview of system statistics
- **User Management** - Monitor user activities
- **Statistics** - View total disposals, users, and points across the system

## Project Structure

```
smartwaste.ke/
├── client/                           # React frontend
│   └── vite-project/
│       ├── src/
│       │   ├── components/          # Reusable React components
│       │   ├── pages/               # Page components
│       │   ├── services/            # API service functions
│       │   └── main.jsx             # App entry point
│       ├── vite.config.js           # Vite configuration
│       └── package.json
│
├── server/                           # Express backend
│   └── src/
│       ├── routes/                  # API route handlers
│       ├── data/                    # Database setup & queries
│       ├── utils/                   # Helper functions
│       ├── app.js                   # Express app configuration
│       └── index.js                 # Server entry point
│
├── SETUP.md                         # Setup & configuration guide
├── DEVELOPMENT.md                   # Development best practices
├── DATABASE.md                      # Database schema & migrations
└── IMPROVEMENTS_SUMMARY.md          # Architecture improvements
```

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide with environment configuration
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development patterns and best practices
- **[DATABASE.md](./DATABASE.md)** - Database schema, queries, and migration guide
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - Recent architecture improvements

## Architecture Improvements

This project includes production-ready improvements:

### Environment Configuration
- Configurable database paths, ports, and API endpoints
- Support for different environments (development, testing, production)
- No hardcoded credentials or secrets

### Error Handling & Logging
- Comprehensive error handling middleware
- Request logging with timestamps and response times
- Configurable log levels (info/debug)
- Production-safe error responses

### Security
- Environment-based configuration for sensitive values
- Configurable CORS policies
- Parameterized database queries
- Foreign key constraints

### Developer Experience
- Clear separation of concerns
- Comprehensive documentation
- Example API patterns
- Migration guide to production database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Waste Management
- `POST /api/dispose` - Record waste disposal
- `GET /api/disposals` - Get user's disposal history

### Admin
- `GET /api/admin/overview` - System statistics

### Health Check
- `GET /api/health` - Server health status

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed API documentation.

## Running the Application

### Development Mode

```bash
# Start both server and client
npm run dev

# Or run separately
npm run server  # Terminal 1
npm run client  # Terminal 2
```

### Production Build

```bash
# Build client for production
npm run build

# The optimized build will be in client/vite-project/dist/
```

## Environment Configuration

Create `.env` files in both `server/` and `client/vite-project/` directories.

### Server Configuration (server/.env)
```env
PORT=4000
DATABASE_PATH=./data/smartwaste.sqlite
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
NODE_ENV=development
```

### Client Configuration (client/vite-project/.env)
```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:4000
VITE_ENV=development
```

See [SETUP.md](./SETUP.md) for complete configuration options.

## Development Workflow

1. **Create a feature branch** for your changes
2. **Follow the patterns** in [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Test your changes** using browser and API tools
4. **Run your changes** through `npm run dev`
5. **Commit with clear messages** describing your changes

## Database

SmartWaste.ke uses SQLite for development with the following tables:

- **users** - User accounts and authentication
- **sessions** - User sessions
- **disposal_events** - Waste disposal records

See [DATABASE.md](./DATABASE.md) for:
- Complete schema documentation
- Common query examples
- Adding new tables
- Migration to PostgreSQL for production

## Production Deployment

Before deploying to production:

1. Review [SETUP.md](./SETUP.md) for production configuration
2. Follow the migration guide in [DATABASE.md](./DATABASE.md) to use PostgreSQL
3. Update environment variables with production values
4. Set `NODE_ENV=production`
5. Ensure proper backups are configured
6. Review security checklist in [DEVELOPMENT.md](./DEVELOPMENT.md)

## Troubleshooting

### Common Issues

**Port already in use**
```bash
PORT=5000 npm run server
```

**Database locked error**
```bash
rm -f data/smartwaste.sqlite-wal
npm run server
```

**CORS errors**
- Check that `CORS_ORIGIN` in `server/.env` matches your client URL

**API requests failing**
- Verify server is running on configured port
- Check that client `VITE_PROXY_TARGET` matches server URL

See [SETUP.md](./SETUP.md#troubleshooting) for more solutions.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite (development), PostgreSQL-ready (production)
- **Package Manager**: npm/yarn/pnpm/bun
- **Development**: Modern ES6+, async/await

## Contributing

1. Follow the development guide in [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Maintain code style consistency
3. Add meaningful commit messages
4. Test your changes before submitting

## License

[Add your license here]

## Support

For issues, questions, or suggestions:

1. Check the troubleshooting section in [SETUP.md](./SETUP.md)
2. Review relevant documentation files
3. Check console logs for error messages
4. Verify environment variables are correctly set

## Next Steps

1. **Review Documentation**: Start with [SETUP.md](./SETUP.md)
2. **Understand Architecture**: Read [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Explore Code**: Check out the source files and API routes
4. **Set Up Development**: Follow the Quick Start above
5. **Start Building**: Create features following the patterns documented

---

**Happy coding! SmartWaste.ke is ready for development and production deployment.**
