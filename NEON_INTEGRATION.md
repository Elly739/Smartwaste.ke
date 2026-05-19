# Neon PostgreSQL Integration Guide

This guide explains how SmartWaste.ke is configured to work with Neon PostgreSQL for production deployments.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Setup Instructions](#setup-instructions)
5. [Configuration](#configuration)
6. [Migration from SQLite](#migration-from-sqlite)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

SmartWaste.ke now supports **dual database modes**:

- **SQLite** (Development/Testing) - File-based, no server needed
- **PostgreSQL** (Production/Neon) - Server-based, scalable, reliable

The application automatically detects which database to use based on environment variables and seamlessly switches between them. Both databases use the same schema and API.

### Why Neon?

- **Serverless PostgreSQL** - No infrastructure management
- **Automatic Backups** - Daily backups included
- **High Availability** - 99.99% SLA
- **Scalable** - Auto-scaling for concurrent connections
- **Cost Effective** - Pay only for usage, free tier available
- **Connection Pooling** - Integrated PgBouncer support

## Quick Start

### Using SQLite (Development)

```bash
npm run dev
# or
docker-compose up
```

SQLite will be used by default. Database stored in `./data/smartwaste.sqlite`

### Using Neon PostgreSQL (Production)

1. Get your Neon connection string from the Neon dashboard
2. Set it in your environment:

```bash
export DATABASE_URL="postgresql://user:password@host.neon.tech:5432/database?sslmode=require"
```

3. Start the server:

```bash
npm run server
# or
docker-compose -f docker-compose.prod.yml up
```

## Architecture

### Database Abstraction Layer

The application uses a database abstraction layer that provides a unified interface:

```javascript
// Users don't need to change their code
import { get, run, all } from './data/database.js';

// Works with both SQLite and PostgreSQL
const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
await run('INSERT INTO users (...) VALUES (...)', [params]);
```

### Query Translation

Queries are automatically translated based on the database type:

| SQLite | PostgreSQL |
|--------|-----------|
| `?` | `$1, $2, $3...` |
| `datetime()` | `DATE()` / `NOW()` |
| `substr()` | `substring()` |

The `normalizeSql()` helper function handles this translation automatically.

### File Structure

```
server/
├── src/
│   ├── data/
│   │   ├── database.js          # Main database module (router)
│   │   ├── postgresql.js        # PostgreSQL implementation
│   │   ├── sqlHelper.js         # SQL translation helpers
│   │   ├── userStore.js         # User operations
│   │   └── disposalStore.js     # Disposal operations
│   ├── controllers/
│   ├── routes/
│   └── utils/
├── Dockerfile                   # Multi-stage for production
├── .env.example                 # Environment template
└── package.json
```

## Setup Instructions

### Step 1: Create Neon Account and Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Create a database (default is `neondb`)
5. Note the connection string in the dashboard

### Step 2: Update Environment Variables

**Option A: Development (with Docker)**

Update `server/.env`:

```bash
# Disable SQLite
USE_SQLITE=false

# Set your Neon connection string
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/neondb?sslmode=require

# Connection pool settings (optional)
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=2000
```

**Option B: Production (Docker Compose)**

Update `docker-compose.prod.yml` environment or use `.env`:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/neondb?sslmode=require
CORS_ORIGIN=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password
```

### Step 3: Start with Neon

**Using Docker:**

```bash
docker-compose up --build
# Server will auto-create tables and seed admin user
```

**Using npm:**

```bash
cd server
npm install
npm run dev
```

The application will:
1. Connect to Neon PostgreSQL
2. Automatically create all tables if they don't exist
3. Seed the admin user if it doesn't exist

### Step 4: Verify Connection

Check the server logs:

```
[Database] Using PostgreSQL (Neon)
[PostgreSQL] Database schema initialized successfully
[SmartWaste server running on http://localhost:4000
```

Test the API:

```bash
curl http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass"}'
```

## Configuration

### Environment Variables

#### Database Connection

```bash
# PostgreSQL (Neon) connection string
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# OR use SQLite (development)
USE_SQLITE=true
DATABASE_PATH=./data/smartwaste.sqlite
```

#### Connection Pool Settings

```bash
# Number of connections to pool (default: 10)
DATABASE_POOL_SIZE=10

# Idle timeout in milliseconds (default: 30000)
DATABASE_IDLE_TIMEOUT=30000

# Connection timeout in milliseconds (default: 2000)
DATABASE_CONNECTION_TIMEOUT=2000
```

#### Admin User

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
ADMIN_NAME=Admin User
```

#### Server Configuration

```bash
PORT=4000                           # Server port
NODE_ENV=production                 # Environment
LOG_LEVEL=info                      # Logging level
CORS_ORIGIN=https://yourdomain.com # CORS origin
```

## Migration from SQLite

### Export Data from SQLite

```bash
# Backup your SQLite database
cp ./data/smartwaste.sqlite ./data/smartwaste.sqlite.backup

# Export to CSV or JSON for inspection
sqlite3 ./data/smartwaste.sqlite ".mode csv" ".output users.csv" "SELECT * FROM users;"
```

### Import Data to Neon

The application automatically creates the schema in Neon on first connection. To migrate existing data:

1. **Option A: Automatic (Recommended)**
   - Keep both `DATABASE_URL` and `USE_SQLITE=false`
   - The app creates empty schema in Neon
   - Manually copy data from SQLite to Neon using a migration script

2. **Option B: Manual Script**

Create `server/scripts/migrate.js`:

```javascript
import sqlite3 from 'sqlite3';
import pg from 'pg';

const sqliteDb = new sqlite3.Database('./data/smartwaste.sqlite');
const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Read from SQLite and write to PostgreSQL
async function migrateUsers() {
  const users = await new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM users', (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });

  for (const user of users) {
    await pgPool.query(
      'INSERT INTO users (id, name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.id, user.name, user.email, user.password, user.role, user.created_at]
    );
  }
  
  console.log(`Migrated ${users.length} users`);
}

await migrateUsers();
await pgPool.end();
```

Run with:

```bash
DATABASE_URL=your-neon-url node server/scripts/migrate.js
```

## Deployment

### Railway.app

1. Connect your GitHub repository
2. Create a PostgreSQL add-on (or use Neon)
3. Set environment variables in Railway dashboard:
   ```
   DATABASE_URL=your-neon-connection-string
   NODE_ENV=production
   ```
4. Railway automatically deploys on git push

### Render.com

1. Create new Web Service from GitHub
2. Build command: `npm install`
3. Start command: `npm run server`
4. Set environment variables in Render dashboard
5. Add Neon database connection string as `DATABASE_URL`

### Docker Push to Registry

```bash
# Build Docker images
docker build -t smartwaste-server:latest ./server
docker build -t smartwaste-client:latest ./client/vite-project

# Tag for registry
docker tag smartwaste-server:latest registry.example.com/smartwaste-server:latest

# Push to registry
docker push registry.example.com/smartwaste-server:latest
```

### Kubernetes

Update deployment environment variables:

```yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: smartwaste-secrets
        key: neon-connection-string
  - name: NODE_ENV
    value: "production"
```

## Monitoring & Maintenance

### Check Connection Health

```bash
# Test database connection
curl http://localhost:4000/api/admin/overview
```

### View Connection Pool Stats

Check server logs for connection pool information:

```bash
LOG_LEVEL=debug npm run server
```

### Neon Dashboard

Monitor in Neon dashboard:
- Query performance
- Connection count
- Backup status
- Storage usage

### Backup Strategy

Neon includes daily backups. For additional safety:

```bash
# Manual backup to local file
pg_dump postgresql://user:password@host/db > backup-$(date +%Y%m%d).sql

# Restore from backup
psql postgresql://user:password@host/db < backup-20240119.sql
```

## Troubleshooting

### "DATABASE_URL is required"

**Problem**: Error when `DATABASE_URL` is not set and `USE_SQLITE` is not true

**Solution**:
```bash
# Option 1: Use SQLite
USE_SQLITE=true npm run dev

# Option 2: Set DATABASE_URL
DATABASE_URL=postgresql://... npm run dev
```

### Connection Timeout

**Problem**: "connection timeout" errors

**Solution**:
```bash
# Increase connection timeout
DATABASE_CONNECTION_TIMEOUT=5000 npm run dev

# Or check Neon console for connection limits
```

### "SSL certificate problem"

**Problem**: SSL/TLS certificate errors

**Solution**: Ensure your connection string includes `sslmode=require`:
```
postgresql://user:password@host:5432/db?sslmode=require
                                              ^^^^^^^^
```

### "Too many connections"

**Problem**: Connection pool exhausted

**Solution**:
```bash
# Reduce pool size
DATABASE_POOL_SIZE=5 npm run dev

# Or use Neon's PgBouncer connection pooling
# (configure in Neon dashboard under Connection pooling)
```

### Switching Back to SQLite

```bash
# Temporarily use SQLite
USE_SQLITE=true npm run dev

# Data will be separate from PostgreSQL
```

## Performance Tips

1. **Connection Pooling**: Set `DATABASE_POOL_SIZE` to 20-30 in production
2. **Idle Timeout**: Increase to 60000ms in production for better connection reuse
3. **Indexes**: Neon automatically creates indexes on primary keys; add more as needed
4. **Query Optimization**: Monitor slow queries in Neon dashboard

## Security Best Practices

1. **Never commit .env files** with real connection strings
2. **Rotate passwords** regularly
3. **Use strong admin passwords** (25+ characters with special characters)
4. **Enable Neon IP allowlisting** in production
5. **Use SSL connections** (sslmode=require)
6. **Monitor access logs** in Neon dashboard

## FAQ

**Q: Can I use both SQLite and PostgreSQL at the same time?**
A: No, set either `USE_SQLITE=true` OR `DATABASE_URL`, not both.

**Q: Will my SQLite data be lost when I switch to Neon?**
A: SQLite data remains in the local file. Use the migration script to move data to Neon if needed.

**Q: Is Neon free?**
A: Yes, Neon offers a free tier with 1 project, 3 branches, and 512MB storage.

**Q: How do I backup my Neon database?**
A: Neon includes daily automated backups. Manual backups use pg_dump (see Maintenance section).

**Q: Can I use both during development?**
A: Yes! Use SQLite locally with `USE_SQLITE=true`, test production code with Neon via `docker-compose.prod.yml`.

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection Pooling Guide](https://neon.tech/docs/connect/connection-pooling)
- [Node.js pg Library](https://github.com/brianc/node-postgres)
