# Railway Deployment Guide for SmartWaste.ke Backend

This guide walks you through deploying the Express.js backend of SmartWaste.ke to Railway.app.

## Why Railway?

- **$5/month starting cost** - Very affordable for production
- **GitHub integration** - Auto-deploy on push
- **PostgreSQL support** - Easy connection to Neon
- **Excellent documentation** - Clear guides and support
- **Zero cold starts** - Always ready to serve requests
- **Simple setup** - Deploy in minutes

## Quick Start (5 Minutes)

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended for auto-deploy)

### Step 2: Create Backend Service

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub"
3. Choose your `Elly739/Smartwaste.ke` repository
4. Authorize Railway to access your GitHub

### Step 3: Configure Build Settings

1. Railway auto-detects it's a monorepo
2. Set **Root Directory** to `server`
3. Set **Start Command** to `npm start`
4. Set **Build Command** to `npm install`

### Step 4: Set Environment Variables

In Railway dashboard, go to **Variables** and add:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://username:password@host:5432/dbname?sslmode=require
CORS_ORIGIN=https://smartwaste.vercel.app
ADMIN_EMAIL=admin@smartwaste.ke
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=SmartWaste Admin
LOG_LEVEL=info
```

### Step 5: Get Your API URL

Once deployed, Railway shows your service URL. Copy it.

Example: `https://smartwaste-api-production.railway.app`

### Step 6: Deploy Frontend to Vercel

In Vercel project settings, add this environment variable:

```
VITE_API_BASE_URL=https://smartwaste-api-production.railway.app
```

Then redeploy Vercel to pick up the new API URL.

Done! Your app is now deployed.

## Detailed Setup Instructions

### Getting Neon Connection String

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Click "Connect"
4. Copy the **Connection string** (PostgreSQL URL)
5. Paste into Railway `DATABASE_URL` variable

The connection string looks like:
```
postgresql://user:password@neon.tech:5432/database?sslmode=require
```

### Understanding the Architecture

```
┌─────────────────────────────────────┐
│       Frontend on Vercel            │
│   (React Static Site - Free)        │
│  smartwaste.vercel.app              │
└────────────┬────────────────────────┘
             │
    VITE_API_BASE_URL points to:
             │
┌────────────▼────────────────────────┐
│       Backend on Railway            │
│   (Express.js Server - $5/mo)       │
│  smartwaste-api.railway.app         │
└────────────┬────────────────────────┘
             │
      DATABASE_URL points to:
             │
┌────────────▼────────────────────────┐
│    Database on Neon                 │
│ (PostgreSQL - Serverless)           │
│  neon.tech                          │
└─────────────────────────────────────┘
```

### Auto-Deployment Setup

Railway automatically deploys when you push to GitHub:

1. Push to `main` branch
2. GitHub webhook triggers Railway
3. Railway pulls latest code
4. Railway rebuilds and redeploys
5. Your new changes go live

To disable auto-deploy:
1. Go to Railway project settings
2. Disable "Auto Deploy"
3. Manual deployments available in dashboard

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Development or production | `production` |
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `CORS_ORIGIN` | Frontend URL allowed to access | `https://smartwaste.vercel.app` |
| `ADMIN_EMAIL` | Initial admin email | `admin@smartwaste.ke` |
| `ADMIN_PASSWORD` | Initial admin password | (secure password) |
| `ADMIN_NAME` | Admin display name | `SmartWaste Admin` |
| `LOG_LEVEL` | Logging level | `info` or `debug` |

## Monitoring and Logs

### View Logs in Railway

1. Go to your Railway project
2. Click on the backend service
3. Go to "Logs" tab
4. See real-time logs

### Common Issues

#### Service won't start
- Check logs for errors
- Verify `DATABASE_URL` is correct
- Ensure all required environment variables are set
- Check that `server/package.json` has correct start script

#### Connection timeout to database
- Verify Neon database is running
- Check `DATABASE_URL` is correct
- Ensure Railway has access to Neon (check firewall/IP allow lists)
- Add `?sslmode=require` to connection string

#### CORS errors in frontend
- Update `CORS_ORIGIN` to match your Vercel URL
- Redeploy the backend after changing CORS_ORIGIN
- Check browser console for exact error

#### High memory usage
- Increase Railway memory limit in project settings
- Check for memory leaks in application code
- Review database query performance

## Scaling Your Backend

### If you expect more users

1. Increase Railway memory limit
   - Go to project settings
   - Increase memory allocation
   - Higher memory = better performance

2. Upgrade Neon database
   - Go to neon.tech project
   - Upgrade from free to paid plan
   - Get dedicated PostgreSQL instance

3. Add database indexes
   - Speed up queries on frequently accessed fields
   - See DATABASE.md for example queries

### Cost Estimation

Current setup for 1,000+ daily active users:

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Frontend | Free | Static React app |
| Railway Backend | $5-20/mo | Starts at $5/month |
| Neon Database | Free-$100/mo | Free tier up to 10GB |
| **Total** | **$5-120/mo** | Very affordable |

## Production Checklist

Before marking as production-ready:

- [ ] Database backups configured (Neon auto-backups)
- [ ] Monitoring set up (check Railway logs regularly)
- [ ] Error tracking (add Sentry for error monitoring)
- [ ] SSL/HTTPS enabled (Railway/Vercel provide free SSL)
- [ ] Admin password changed from default
- [ ] CORS_ORIGIN set to your production domain
- [ ] LOG_LEVEL set to `info` (not `debug`)
- [ ] Gradual rollout tested with staging users
- [ ] Database migrations tested
- [ ] API endpoints tested with real data

## Updating Your App

### Deploying updates

1. Make code changes locally
2. Test locally: `npm run dev`
3. Commit and push to GitHub
4. Railway auto-deploys (watch logs in dashboard)
5. Vercel auto-deploys frontend if needed

### Database schema changes

1. Edit `server/src/data/database.js` (for SQLite)
2. Or create migration script for Neon
3. Test locally with SQLite
4. Deploy code to Railway
5. Neon will create tables automatically on first run

## Support and Troubleshooting

### Official Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) - Quick help
- [Neon Docs](https://neon.tech/docs) - Database help
- [Vercel Docs](https://vercel.com/docs) - Frontend help

### Getting Help

If something breaks:

1. Check Railway logs (last 50 lines)
2. Verify all environment variables are set correctly
3. Test database connection with psql or similar tool
4. Check CORS settings if frontend can't reach backend
5. Ask in Railway Discord community

## Next Steps

1. Set up monitoring dashboard
2. Configure automatic backups (Neon handles this)
3. Set up error tracking with Sentry
4. Monitor performance metrics
5. Plan scaling strategy based on growth

Congratulations! Your SmartWaste.ke backend is now live on Railway.
