# Neon Quick Reference

## TL;DR - Get Running in 5 Minutes

### 1. Get Neon Connection String

```
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/neondb?sslmode=require
```

### 2. Set Environment Variable

```bash
export DATABASE_URL="postgresql://user:password@host.neon.tech:5432/neondb?sslmode=require"
```

### 3. Run with Neon

```bash
npm run server
# or
docker-compose up
```

Done! Tables auto-create, admin user auto-seeded.

## Common Tasks

### Switch to Neon from SQLite

```bash
# In server/.env or command line:
# Remove or comment out:
# USE_SQLITE=true
# DATABASE_PATH=./data/smartwaste.sqlite

# Add:
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/neondb?sslmode=require

npm run server
```

### Switch Back to SQLite

```bash
USE_SQLITE=true npm run dev
```

### Check Which Database is Active

```bash
# Look at server logs:
npm run server
# Output shows: "[Database] Using SQLite" or "[Database] Using PostgreSQL (Neon)"
```

### Test Database Connection

```bash
# Make a simple API call
curl http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass"}'
```

### View Neon Dashboard

1. Go to [neon.tech](https://neon.tech)
2. Click your project
3. View queries, connections, and backups

### Backup Database

```bash
# Automatic: Neon backs up daily
# Manual backup:
pg_dump postgresql://user:password@host/neondb > backup.sql
```

## Environment Variables Cheat Sheet

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | Neon connection string | (none) |
| `USE_SQLITE` | Force SQLite usage | false |
| `DATABASE_PATH` | SQLite file location | ./data/smartwaste.sqlite |
| `DATABASE_POOL_SIZE` | Connection pool size | 10 |
| `DATABASE_IDLE_TIMEOUT` | Pool idle timeout (ms) | 30000 |
| `DATABASE_CONNECTION_TIMEOUT` | Connection timeout (ms) | 2000 |
| `NODE_ENV` | Environment (production/development) | development |
| `PORT` | Server port | 4000 |
| `CORS_ORIGIN` | Frontend URL | http://localhost:5173 |

## Docker Commands

```bash
# Development with SQLite
docker-compose up

# Production with Neon (set DATABASE_URL first)
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f server

# Stop all containers
docker-compose down
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "DATABASE_URL is required" | Set `DATABASE_URL` or use `USE_SQLITE=true` |
| Connection timeout | Increase `DATABASE_CONNECTION_TIMEOUT` |
| "Too many connections" | Reduce `DATABASE_POOL_SIZE` or use Neon pooling |
| SSL certificate error | Ensure `?sslmode=require` in connection string |

## Files Modified for Neon Support

- `server/src/data/database.js` - Router layer
- `server/src/data/postgresql.js` - PostgreSQL implementation
- `server/src/data/sqlHelper.js` - SQL translation helpers
- `server/src/data/userStore.js` - Uses normalizeSql()
- `server/src/data/disposalStore.js` - Uses normalizeSql()
- `server/src/index.js` - Graceful shutdown
- Docker and env files - Neon configuration support

## Performance Defaults

| Setting | Value | Notes |
|---------|-------|-------|
| Pool Size | 10 | Dev; use 20-30 for production |
| Idle Timeout | 30s | Connections close after 30s idle |
| Connection Timeout | 2s | Max time to wait for connection |
| Connection Attempt | 3 retries | Auto-retry failed connections |

## Need Help?

- Full guide: See `NEON_INTEGRATION.md`
- Environment setup: See `server/.env.example`
- Database schema: See `DATABASE.md`
- Deployment options: See `DOCKER.md` and `DEPLOYMENT_CHECKLIST.md`
