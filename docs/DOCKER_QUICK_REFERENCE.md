# Docker Quick Reference

Quick reference guide for common Docker commands used in the Doon Gooseberry Farm project.

## 🚀 Getting Started

```bash
# First time setup
./scripts/docker-setup.sh

# Start development
docker compose up -d
npm run dev
```

## 📦 Container Management

```bash
# Start containers
docker compose up -d

# Stop containers (keeps data)
docker compose down

# Stop and remove all data
docker compose down -v

# Restart containers
docker compose restart

# View running containers
docker compose ps
```

## 📋 Logs & Debugging

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f postgres

# View last 50 lines
docker compose logs --tail=50 postgres

# Check container health
docker compose ps
```

## 🗄️ Database Operations

```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d doon_farm_dev

# Run SQL query
docker compose exec postgres psql -U postgres -d doon_farm_dev -c "SELECT COUNT(*) FROM users;"

# Backup database
docker compose exec -T postgres pg_dump -U postgres doon_farm_dev > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres -d doon_farm_dev < backup.sql

# Reset database
docker compose down -v
./scripts/docker-setup.sh
```

## 🔄 Database Migrations

```bash
# Push schema changes
npm run db:push

# Generate migration
npm run db:generate

# Seed database
npm run db:seed

# Open database GUI
npm run db:studio
```

## 🧹 Cleanup

```bash
# Remove stopped containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Clean up Docker system
docker system prune

# Clean up everything (careful!)
docker system prune -a --volumes
```

## 🔍 Troubleshooting

```bash
# Check if Docker is running
docker ps

# Check container status
docker compose ps

# View detailed container info
docker inspect doon_farm_postgres

# Check Docker disk usage
docker system df

# Restart Docker Desktop
# macOS: Click Docker icon > Restart
# Windows: Right-click Docker icon > Restart
```

## 🛠️ Common Issues

### Port 5432 in use
```bash
# Stop local PostgreSQL
brew services stop postgresql@14  # macOS
sudo systemctl stop postgresql    # Linux
```

### Container won't start
```bash
# View error logs
docker compose logs postgres

# Force recreate
docker compose up -d --force-recreate

# Remove and restart
docker compose down -v
docker compose up -d
```

### Connection refused
```bash
# Check if container is healthy
docker compose exec postgres pg_isready -U postgres

# Restart container
docker compose restart postgres

# Check DATABASE_URL
cat .env.local | grep DATABASE_URL
```

## 📚 Useful SQL Commands

```sql
-- Inside PostgreSQL shell (docker compose exec postgres psql -U postgres -d doon_farm_dev)

-- List all tables
\dt

-- Describe table structure
\d users

-- Count records
SELECT COUNT(*) FROM products;

-- View recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Exit
\q
```

## 🎯 Development Workflow

```bash
# 1. Start database
docker compose up -d

# 2. Start dev server
npm run dev

# 3. Make changes to code

# 4. Update database schema (if needed)
npm run db:push

# 5. View logs if issues
docker compose logs -f postgres

# 6. Stop when done
docker compose down
```

## 📖 More Information

- [Complete Docker Setup Guide](DOCKER_SETUP.md)
- [Local Development Guide](LOCAL_DEVELOPMENT.md)
- [Main README](../README.md)

---

**Tip:** Bookmark this page for quick access to common commands!
