# SmartWaste.ke Deployment Checklist

## Pre-Deployment (Before Going Live)

### Code & Configuration
- [ ] All tests passing: `npm test`
- [ ] No console.log statements in production code
- [ ] Environment variables documented in `.env.example`
- [ ] Git repository clean with meaningful commit messages
- [ ] Code reviewed and approved
- [ ] All dependencies up to date: `npm outdated`

### Security
- [ ] Admin credentials changed from defaults
- [ ] Database password set to strong value (16+ chars)
- [ ] HTTPS/TLS enabled on all domains
- [ ] CORS_ORIGIN set to your production domain only
- [ ] No sensitive data in code or git history
- [ ] Security headers configured (HSTS, X-Frame-Options, etc.)

### Docker Configuration
- [ ] Dockerfile builds without errors: `docker-compose build`
- [ ] Services start correctly: `docker-compose up`
- [ ] Health checks passing: `docker ps`
- [ ] Image sizes reasonable (< 500MB each)
- [ ] .dockerignore files configured
- [ ] No hardcoded credentials in Dockerfiles

### Database
- [ ] Database connection string working
- [ ] Backup strategy in place
- [ ] Migrations tested in staging
- [ ] Database user permissions minimal (least privilege)
- [ ] Connection pooling configured
- [ ] Backup automated and tested

### Deployment Platform
- [ ] Account created on chosen platform (Railway, Render, AWS, etc.)
- [ ] Domain purchased and configured
- [ ] SSL certificate provisioned (auto or manual)
- [ ] Environment variables set in platform dashboard
- [ ] Docker images pushed to registry (if required)
- [ ] Deployment pipeline configured

## Deployment Steps

### 1. Choose Platform
- [ ] Railway (recommended for simplicity)
- [ ] Render
- [ ] AWS ECS
- [ ] DigitalOcean App Platform
- [ ] Self-hosted VPS

### 2. Platform-Specific Setup
See **DOCKER.md** → **Platform-Specific Guides** for detailed steps

#### For Railway
- [ ] Connect GitHub repository
- [ ] Create project
- [ ] Add environment variables
- [ ] Deploy
- [ ] Verify health checks passing

#### For Render
- [ ] Create account
- [ ] Add web services
- [ ] Configure PostgreSQL database
- [ ] Set environment variables
- [ ] Deploy and monitor

#### For AWS ECS
- [ ] Create ECR repositories
- [ ] Build and push Docker images
- [ ] Create task definitions
- [ ] Configure load balancer
- [ ] Create ECS service
- [ ] Verify auto-scaling

#### For Self-Hosted
- [ ] Provision VPS
- [ ] Install Docker and Docker Compose
- [ ] Clone repository
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL with Let's Encrypt
- [ ] Start services
- [ ] Configure firewall

### 3. Post-Deployment Verification
- [ ] Application loads (http://your-domain.com)
- [ ] Frontend displays correctly
- [ ] API responds (http://api.your-domain.com/health)
- [ ] Database connection working
- [ ] Authentication functional
- [ ] Forms submit successfully
- [ ] No console errors in browser
- [ ] HTTPS working
- [ ] Mobile responsive

### 4. Monitoring Setup
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] Uptime monitoring enabled (UptimeRobot, etc.)
- [ ] Performance monitoring active (New Relic, DataDog, etc.)
- [ ] Log aggregation set up (ELK, CloudWatch, etc.)
- [ ] Alerts configured for critical errors

## Health Checks

### Automated Health Checks
```bash
# Frontend
curl -I http://localhost:3000
# Expected: 200 OK

# Backend
curl -I http://localhost:4000/health
# Expected: 200 OK

# Docker
docker-compose ps
# Expected: All services healthy
```

### Manual Testing
```bash
# Test API endpoint
curl http://localhost:4000/api/auth/status

# Test database
curl http://localhost:4000/api/disposal-sites

# Test authentication (if available)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## Scaling Considerations

### When to Scale
- [ ] CPU usage consistently > 80%
- [ ] Memory usage > 85%
- [ ] Response time > 1 second
- [ ] Error rate > 0.1%

### Horizontal Scaling (Add More Servers)
- [ ] Load balancer configured
- [ ] Stateless application design verified
- [ ] Database connection pooling enabled
- [ ] Session storage externalized (Redis)

### Vertical Scaling (More Powerful Server)
- [ ] Monitor resource usage trends
- [ ] Plan upgrade before reaching limits
- [ ] Schedule downtime for upgrade

## Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check uptime status
- [ ] Review performance metrics

### Weekly
- [ ] Update dependencies: `npm update`
- [ ] Review security advisories
- [ ] Check disk space usage

### Monthly
- [ ] Run full backup
- [ ] Test backup restoration
- [ ] Review access logs
- [ ] Update Docker base images

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning
- [ ] Update documentation

## Rollback Plan

### Quick Rollback (< 5 minutes)
```bash
# For Docker Compose
docker-compose down
docker-compose up -d  # Previous version

# For Kubernetes
kubectl rollout undo deployment/smartwaste-server
```

### Backup Restore
```bash
# Restore database from backup
psql -U smartwaste < backup-$(date +%Y%m%d).sql

# Restore SQLite
cp backup.sqlite ./data/smartwaste.sqlite
```

## Disaster Recovery

### Data Loss Scenario
- [ ] Database daily backups
- [ ] Backups stored off-site (S3, cloud storage)
- [ ] Backup restoration tested monthly
- [ ] Document RTO (Recovery Time Objective)
- [ ] Document RPO (Recovery Point Objective)

### Service Outage Scenario
- [ ] Auto-restart enabled
- [ ] Load balancer health checks active
- [ ] Database replication set up (if critical)
- [ ] Failover procedures documented

### Security Breach Scenario
- [ ] Incident response plan documented
- [ ] Security contact information ready
- [ ] Log retention policy defined
- [ ] Communication template prepared

## Post-Deployment Monitoring (First Week)

- [ ] Check error logs daily
- [ ] Monitor database growth
- [ ] Review API response times
- [ ] Check for memory leaks
- [ ] Verify backup success
- [ ] Monitor disk usage
- [ ] Review user feedback
- [ ] Check security warnings

## Success Criteria

- [ ] 99.9% uptime
- [ ] API response time < 500ms (p95)
- [ ] Frontend load time < 3s
- [ ] Error rate < 0.1%
- [ ] Database backup successful
- [ ] All health checks passing
- [ ] Security headers present
- [ ] HTTPS working correctly

## Troubleshooting Quick Links

| Issue | Reference |
|-------|-----------|
| Container won't start | DOCKER.md → Troubleshooting |
| Database connection failed | DOCKER.md → Troubleshooting |
| API not responding | DEVELOPMENT.md → Debugging |
| High memory usage | DOCKER.md → Performance Optimization |
| Network issues | DOCKER.md → Service Communication |

## Communication

- [ ] Notify stakeholders of deployment
- [ ] Document any breaking changes
- [ ] Update API documentation if changed
- [ ] Notify users if downtime required
- [ ] Share deployment success message
- [ ] Document lessons learned

## Post-Deployment Tasks

- [ ] Create incident response procedures
- [ ] Set up on-call rotation (if needed)
- [ ] Document runbook for operations team
- [ ] Schedule post-deployment review
- [ ] Plan next feature release
- [ ] Update project README with new URL

---

## Quick Start

**Ready to deploy?**

1. Choose your platform (Railway recommended)
2. Follow the platform-specific guide in DOCKER.md
3. Set all environment variables
4. Deploy and test
5. Monitor for 24 hours

**Support**: See DOCKER.md for platform-specific support links
