# Docker Quick Start for SmartWaste.ke

## 30-Second Start

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f server` | View server logs |
| `docker-compose exec server npm test` | Run tests in container |
| `docker-compose ps` | List running services |
| `docker-compose build` | Build images |

## Environment Setup

```bash
# Copy env file
cp .env.docker .env

# Or create manually:
# ADMIN_EMAIL=your@email.com
# ADMIN_PASSWORD=your-password
# VITE_API_BASE_URL=http://localhost:4000/api
```

## Deployment Platforms

- **Railway** (easiest): Connect GitHub → auto-deploy
- **Render**: Similar to Railway
- **AWS ECS**: Most scalable
- **Self-hosted**: Full control, more management

See `DOCKER.md` for detailed platform guides.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | `docker-compose down`, check `lsof -i :4000` |
| Container won't start | `docker-compose logs service-name` |
| API not working | Check `VITE_API_BASE_URL` in client `.env` |
| Database issues | `docker volume prune`, recreate with `docker-compose down -v` |

## Next Steps

1. Read `DOCKER.md` for platform-specific guides
2. Set up deployment on your chosen platform
3. Configure CI/CD (optional, most platforms support auto-deploy)
