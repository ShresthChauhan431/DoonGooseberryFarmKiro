# Docker Troubleshooting Guide

Quick troubleshooting guide for common Docker issues in the Doon Gooseberry Farm project.

## 🔍 Quick Diagnostics

Run these commands to check your setup:

```bash
# 1. Check Docker is running
docker ps

# 2. Check container status
docker compose ps

# 3. Check container logs
docker compose logs postgres

# 4. Check database connection
docker compose exec postgres pg_isready -U postgres

# 5. Verify environment variables
cat .env.local | grep DATABASE_URL
```

## ❌ Common Issues & Solutions

### Issue 1: "Cannot connect to Docker daemon"

**Symptoms:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon should be steady)
3. Try your command again

**Verify:**
```bash
docker ps
```

---

### Issue 2: "Port 5432 is already in use"

**Symptoms:**
```
Error: bind: address already in use
```

**Cause:** Local PostgreSQL is running on port 5432

**Solution A - Stop local PostgreSQL:**
```bash
# macOS (Homebrew)
brew services stop postgresql@14

# Linux (systemd)
sudo systemctl stop postgresql

# Windows
# Stop PostgreSQL service from Services app
```

**Solution B - Use different port:**

Edit `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use port 5433 instead
```

Update `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/doon_farm_dev
```

**Verify:**
```bash
docker compose up -d
```

---

### Issue 3: "Container exits immediately"

**Symptoms:**
```
doon_farm_postgres exited with code 1
```

**Solution:**
```bash
# 1. View error logs
docker compose logs postgres

# 2. Remove old volumes
docker compose down -v

# 3. Restart
docker compose up -d

# 4. Check status
docker compose ps
```

**Common causes:**
- Corrupted data volume
- Insufficient disk space
- Permission issues

---

### Issue 4: "Database connection refused"

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# 1. Check if container is running
docker compose ps

# 2. Check if database is ready
docker compose exec postgres pg_isready -U postgres

# 3. Restart container
docker compose restart postgres

# 4. Wait a few seconds and try again
sleep 5

# 5. Verify DATABASE_URL
cat .env.local | grep DATABASE_URL
```

**Verify DATABASE_URL format:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doon_farm_dev
```

---

### Issue 5: "Permission denied: ./scripts/docker-setup.sh"

**Symptoms:**
```
bash: ./scripts/docker-setup.sh: Permission denied
```

**Solution:**
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

---

### Issue 6: "No space left on device"

**Symptoms:**
```
Error: no space left on device
```

**Solution:**
```bash
# 1. Check Docker disk usage
docker system df

# 2. Clean up unused resources
docker system prune

# 3. Remove unused volumes
docker volume prune

# 4. For aggressive cleanup (careful!)
docker system prune -a --volumes
```

---

### Issue 7: "Container is unhealthy"

**Symptoms:**
```
doon_farm_postgres is unhealthy
```

**Solution:**
```bash
# 1. Check health status
docker compose ps

# 2. View logs
docker compose logs postgres

# 3. Restart container
docker compose restart postgres

# 4. If still unhealthy, recreate
docker compose down
docker compose up -d --force-recreate
```

---

### Issue 8: "Database does not exist"

**Symptoms:**
```
Error: database "doon_farm_dev" does not exist
```

**Solution:**
```bash
# 1. Check if database exists
docker compose exec postgres psql -U postgres -l

# 2. Create database manually
docker compose exec postgres psql -U postgres -c "CREATE DATABASE doon_farm_dev;"

# 3. Or reset everything
docker compose down -v
./scripts/docker-setup.sh
```

---

### Issue 9: "Authentication failed"

**Symptoms:**
```
Error: password authentication failed for user "postgres"
```

**Solution:**
```bash
# 1. Verify credentials in docker-compose.yml
cat docker-compose.yml | grep POSTGRES

# 2. Verify DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL

# 3. Ensure they match:
# docker-compose.yml: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres
# .env.local: postgresql://postgres:postgres@localhost:5432/doon_farm_dev

# 4. If mismatch, fix and restart
docker compose down
docker compose up -d
```

---

### Issue 10: "npm run db:push fails"

**Symptoms:**
```
Error: Connection terminated unexpectedly
```

**Solution:**
```bash
# 1. Ensure database is running
docker compose ps

# 2. Check database is ready
docker compose exec postgres pg_isready -U postgres

# 3. Verify connection
docker compose exec postgres psql -U postgres -d doon_farm_dev -c "SELECT 1;"

# 4. Check .env.local
cat .env.local | grep DATABASE_URL

# 5. Try again
npm run db:push
```

---

## 🔄 Reset Everything

If all else fails, complete reset:

```bash
# 1. Stop and remove everything
docker compose down -v

# 2. Remove .env.local
rm .env.local

# 3. Clean Docker system (optional)
docker system prune

# 4. Run setup again
./scripts/docker-setup.sh

# 5. Start development
npm run dev
```

## 🧪 Testing Your Setup

Run these commands to verify everything works:

```bash
# 1. Container is running
docker compose ps | grep "Up"

# 2. Database is healthy
docker compose exec postgres pg_isready -U postgres

# 3. Can connect to database
docker compose exec postgres psql -U postgres -d doon_farm_dev -c "SELECT 1;"

# 4. Tables exist
docker compose exec postgres psql -U postgres -d doon_farm_dev -c "\dt"

# 5. Can query data
docker compose exec postgres psql -U postgres -d doon_farm_dev -c "SELECT COUNT(*) FROM users;"
```

If all commands succeed, your setup is working! ✅

## 📊 Health Check Commands

```bash
# Docker Desktop status
docker info

# Container status
docker compose ps

# Container logs
docker compose logs --tail=50 postgres

# Database status
docker compose exec postgres pg_isready -U postgres

# Database connections
docker compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Disk usage
docker system df

# Volume list
docker volume ls
```

## 🆘 Getting Help

If you're still stuck:

1. **Check logs:**
   ```bash
   docker compose logs postgres > docker-logs.txt
   ```

2. **Check Docker Desktop:**
   - Open Docker Desktop
   - Go to Containers
   - Click on `doon_farm_postgres`
   - View logs and stats

3. **Verify system resources:**
   - Ensure Docker Desktop has enough RAM (4GB minimum)
   - Check available disk space
   - Close other applications

4. **Restart Docker Desktop:**
   - Quit Docker Desktop completely
   - Start it again
   - Wait for it to fully initialize

5. **Contact support:**
   - Share the output of `docker compose logs postgres`
   - Share your `docker-compose.yml` (without sensitive data)
   - Describe what you were trying to do

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Complete Docker Setup Guide](DOCKER_SETUP.md)
- [Quick Reference](DOCKER_QUICK_REFERENCE.md)

---

**Remember:** Most issues can be solved by restarting containers or resetting the database! 🔄
