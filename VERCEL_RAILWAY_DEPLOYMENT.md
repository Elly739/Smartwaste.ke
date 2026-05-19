# SmartWaste.ke - Vercel + Railway Deployment Guide

Complete guide to deploying SmartWaste.ke with frontend on Vercel and backend on Railway.

## 30-Second Overview

```
Vercel Frontend  ← → Railway Backend ← → Neon PostgreSQL
(React App)         (Express API)        (Database)
smartwaste.        smartwaste-api.      neon.tech
vercel.app         railway.app
```

## Architecture

SmartWaste.ke uses a distributed architecture for production:

| Component | Platform | Cost | Purpose |
|-----------|----------|------|---------|
| React Frontend | Vercel | FREE | Web interface, PWA |
| Express Backend | Railway | $5/mo | REST API, auth, data processing |
| PostgreSQL DB | Neon | FREE-100/mo | Data persistence, backups |

## Why This Architecture?

- **Frontend on Vercel**: Best for React apps, free tier, global CDN
- **Backend on Railway**: Excellent Node.js support, affordable, reliable
- **Database on Neon**: Serverless PostgreSQL, auto-scaling, included backups

## Complete Deployment Steps

### Phase 1: Database Setup (Neon)

#### 1.1 Create Neon Project

1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" (free tier available)
3. Create a new project, choose PostgreSQL
4. Wait for project to initialize

#### 1.2 Get Connection String

1. In Neon dashboard, go to "Connection strings"
2. Copy the **PostgreSQL** connection string
3. Save it somewhere safe - you'll need it 3 times

Example format:
```
postgresql://user:password@neon.tech:5432/neondb?sslmode=require
```

Keep this secret! Never commit to GitHub.

### Phase 2: Backend Deployment (Railway)

#### 2.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)
4. Authorize Railway to access your GitHub

#### 2.2 Deploy Backend Service

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub"
3. Choose repository: `Elly739/Smartwaste.ke`
4. Authorize if prompted

#### 2.3 Configure Build Settings

Railway should detect it's a monorepo automatically:

1. Click on the deployed service
2. Go to "Settings"
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Nixpacks**: Node.js (auto-detected)

#### 2.4 Set Environment Variables

In Railway project, go to **Variables** section and add:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<paste your Neon connection string here>
CORS_ORIGIN=https://smartwaste.vercel.app
ADMIN_EMAIL=admin@smartwaste.ke
ADMIN_PASSWORD=<create a secure password>
ADMIN_NAME=SmartWaste Admin
LOG_LEVEL=info
DATABASE_POOL_SIZE=20
```

#### 2.5 Complete Railway Deployment

1. Railway automatically deploys once variables are set
2. Monitor "Logs" tab to see deployment progress
3. Wait for "Running" status
4. Copy your **public URL** - looks like: `https://smartwaste-api-production.railway.app`

Save this URL - needed for Vercel!

### Phase 3: Frontend Deployment (Vercel)

#### 3.1 Connect to Vercel

You're already connected to Vercel for this chat. Now import the project:

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import Git Repository
4. Select `Elly739/Smartwaste.ke`
5. Click "Import"

#### 3.2 Configure Project Settings

In Vercel project settings:

1. **Framework Preset**: Vite (auto-detected)
2. **Build Command**: `cd client/vite-project && npm run build`
3. **Output Directory**: `client/vite-project/dist`
4. **Root Directory**: Leave empty

#### 3.3 Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```
VITE_API_BASE_URL=https://smartwaste-api-production.railway.app
```

Use the Railway URL you saved earlier!

#### 3.4 Deploy

1. Click "Deploy" button
2. Vercel builds and deploys automatically
3. Wait for deployment to complete (usually 2-3 minutes)
4. Copy your frontend URL - looks like: `https://smartwaste.vercel.app`

#### 3.5 Verify Frontend Works

1. Open your Vercel URL in browser
2. Try logging in with admin credentials:
   - Email: `admin@smartwaste.ke`
   - Password: (the one you set in Railway)
3. If login works, frontend is connected to backend!

### Phase 4: Verification

#### 4.1 Check All Services

Railway Backend:
```bash
curl https://smartwaste-api-production.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

Vercel Frontend:
```bash
# Visit in browser: https://smartwaste.vercel.app
# Should load immediately with no errors
```

Database:
- Login via web app and try creating a disposal event
- Check Neon dashboard for data

#### 4.2 Production Checklist

- [ ] Frontend loads on Vercel (no blank page)
- [ ] Login works with admin credentials
- [ ] API calls succeed (check browser Network tab)
- [ ] Data persists (logout and login again)
- [ ] Database backups enabled (Neon auto-enables)
- [ ] Error logs are readable (check Railway Logs)

## Managing Your Deployment

### Auto-Deployment

Both Vercel and Railway watch your GitHub repo:

1. Push code to `main` branch
2. Vercel auto-builds frontend
3. Railway auto-builds backend
4. Both auto-deploy when successful
5. Changes live within 5 minutes

### Manual Redeployment

If auto-deploy fails:

**Railway**:
1. Go to project in Railway
2. Click "Deployments" tab
3. Click "Redeploy" on latest

**Vercel**:
1. Go to project in Vercel
2. Click "Deployments" tab
3. Click the three dots → "Redeploy"

### Updating Environment Variables

**Adding/changing variables**:

1. Update in Railway or Vercel dashboard
2. Both services auto-redeploy
3. Changes take effect immediately

**Sensitive variables**:
- Never commit `.env` files to GitHub
- Always use platform dashboards to manage
- Rotate passwords every 3 months

## Troubleshooting

### Frontend shows blank page

**Solution**:
1. Check browser console for errors (F12)
2. Check Vercel build logs
3. Verify `VITE_API_BASE_URL` is set correctly
4. Redeploy Vercel

### Login fails / 401 errors

**Solution**:
1. Check Railway backend logs
2. Verify `DATABASE_URL` is correct
3. Confirm database connection in Railway
4. Check if admin user was created (check Neon database)
5. Redeploy Railway backend

### API timeouts

**Solution**:
1. Check if Railway backend is running (green status)
2. Increase Railway memory if needed
3. Check Neon database is accessible
4. Review API logs for bottlenecks

### CORS errors in browser console

**Solution**:
1. Update `CORS_ORIGIN` in Railway to match Vercel URL
2. Redeploy Railway backend
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

### Database connection failed

**Solution**:
1. Copy `DATABASE_URL` from Neon again
2. Paste into Railway Variables (exact copy/paste!)
3. Ensure it includes `?sslmode=require`
4. Redeploy Railway
5. Check Neon database exists and is not suspended

## Scaling Considerations

### If you need more power

1. **Increase Railway memory** (project settings)
2. **Upgrade Neon database** (free to $100/mo for scale)
3. **Add database caching** (with Redis if needed)
4. **Optimize queries** (check DATABASE.md)

### Monthly Cost Estimates

| Users | Railway | Neon | Vercel | Total |
|-------|---------|------|--------|-------|
| 10-100 | $5/mo | Free | Free | **$5/mo** |
| 100-1000 | $10/mo | Free | Free | **$10/mo** |
| 1000+ | $20/mo | $20/mo | Free | **$40/mo** |

## Monitoring

### Vercel Monitoring

1. Go to project
2. Check "Analytics" for traffic stats
3. Check "Logs" for errors
4. Set up alerts for failures

### Railway Monitoring

1. Go to project
2. Check "Logs" tab regularly
3. Monitor memory and CPU usage
4. Watch for database connection warnings

### Neon Monitoring

1. Go to Neon project
2. Check "Monitoring" tab
3. Monitor connections and queries
4. Enable backups (auto-enabled)

## Disaster Recovery

### If backend goes down

1. Check Railway logs for errors
2. Redeploy from Railway dashboard
3. Verify database connection
4. Restart the service

### If database goes down

1. Check Neon project status
2. Try reconnecting (database may be restarting)
3. Check if storage limit exceeded
4. Restore from automated backup

### If frontend has issues

1. Check Vercel build logs
2. Verify environment variables
3. Clear browser cache
4. Redeploy from Vercel dashboard

## Going Further

### Add monitoring/error tracking

- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay for debugging
- **Datadog**: Advanced monitoring

### Add email notifications

- Set up Railway alerts
- Get notified of failures
- Monitor performance metrics

### Custom domain

- Register domain (namecheap.com, Google Domains)
- Point to Vercel for frontend
- Update CORS_ORIGIN in Railway
- Add SSL certificate (auto with Vercel)

## Support

Need help?

1. **Vercel Support**: [vercel.com/help](https://vercel.com/help)
2. **Railway Support**: [Discord](https://discord.gg/railway)
3. **Neon Support**: [docs.neon.tech](https://docs.neon.tech)

## Success Criteria

Your deployment is successful when:

- Frontend loads immediately from Vercel
- Login works with admin credentials
- Data persists across sessions
- No errors in browser console
- Railway backend responds to API calls
- Neon database accepts connections
- All three services show healthy status

Congratulations! SmartWaste.ke is now live in production!
