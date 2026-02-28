# Docker Setup Guide

This guide provides detailed instructions for setting up and managing the Doon Gooseberry Farm e-commerce project using Docker.

## Table of Contents

- [Why Docker?](#why-docker)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Docker Commands](#docker-commands)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Why Docker?

Using Docker for development provides several benefits:

- **No Local PostgreSQL Required:** No need to install and configure PostgreSQL on your machine
- **Consistent Environment:** Same database setup across all development machines
- **Easy Reset:** Quickly reset your database to a clean state
- **Isolation:** Database runs in a container, isolated from your system
- **Simple Setup:** One command to get everything running
- **Version Control:** Database version is locked in docker-compose.yml

## Prerequisites

### Install Docker Desktop

1. **Download Docker Desktop:**
   - **macOS:** [Download for Mac](https://www.docker.com/products/docker-desktop)
   - **Windows:** [Download for Windows](https://www.docker.com/products/docker-desktop)
   - **Linux:** [Install Docker Engine](https://docs.docker.com/engine/install/)

2. **Install Docker Desktop:**
   - Run the installer
   - Follow the installation wizard
   - Start Docker Desktop

3. **Verify Installation:**
   ```bash
   docker --version
   docker compose version
   ```

   You should see version information for both commands.

### System Requirements

- **macOS:** macOS 10.15 or newer
- **Windows:** Windows 10 64-bit (Pro, Enterprise, or Education) or Windows 11
- **Linux:** 64-bit kernel and KVM virtualization support
- **RAM:** At least 4GB (8GB recommended)
- **Disk Space:** At least 10GB free space

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd doon-farm-ecommerce
```

### Step 2: Ensure Docker is Running

Make sure Docker Desktop is running. You should see the Docker icon in your system tray/menu bar.

### Step 3: Run the Setup Script

```bash
./scripts/docker-setup.sh
```

This automated script will:

1. ✅ Check if Docker is installed
2. 🛑 Stop any existing containers
3. 🚀 Start PostgreSQL container
4. ⏳ Wait for database to be ready
5. 📝 Create `.env.local` with database connection
6. 🔐 Generate authentication secret
7. 📦 Install npm dependencies
8. 🗄️ Run database migrations
9. 🌱 Seed database with sample data
10. ✅ Display success message and next steps

### Step 4: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Quick Start

For subsequent runs after initial setup:

```bash
# Start the database (if not running)
docker compose up -d

# Start the development server
npm run dev
```

## Docker Commands

### Starting and Stopping

```bash
# Start PostgreSQL container (detached mode)
docker compose up -d

# Stop PostgreSQL container
docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v

# Restart container
docker compose restart postgres
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f postgres

# View last 100 lines
docker compose logs --tail=100 postgres
```

### Container Status

```bash
# List running containers
docker compose ps

# View detailed container info
docker inspect doon_farm_postgres

# Check container health
docker compose ps
```

### Accessing PostgreSQL

```bash
# Open PostgreSQL shell
docker compose exec postgres psql -U postgres -d doon_farm_dev

# Run a SQL command
docker compose exec postgres psql -U postgres -d doon_farm_dev -c "SELECT * FROM users;"

# Execute SQL file
docker compose exec -T postgres psql -U postgres -d doon_farm_dev < backup.sql
```

## Database Management

### Viewing Data

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d doon_farm_dev

# Common SQL commands:
\dt              # List all tables
\d users         # Describe users table
\l               # List all databases
\q               # Quit
```

### Backup Database

```bash
# Create backup
docker compose exec -T postgres pg_dump -U postgres doon_farm_dev > backup.sql

# Create backup with timestamp
docker compose exec -T postgres pg_dump -U postgres doon_farm_dev > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker compose exec -T postgres psql -U postgres -d doon_farm_dev < backup.sql

# Or restore with docker compose down first
docker compose down -v
docker compose up -d
# Wait for database to be ready
sleep 5
docker compose exec -T postgres psql -U postgres -d doon_farm_dev < backup.sql
```

### Reset Database

To completely reset your database to a fresh state:

```bash
# Option 1: Use the setup script
docker compose down -v
./scripts/docker-setup.sh

# Option 2: Manual reset
docker compose down -v
docker compose up -d
npm run db:push
npm run db:seed
```

### Migrations

```bash
# Generate new migration
npm run db:generate

# Push schema changes
npm run db:push

# View database in Drizzle Studio
npm run db:studio
```

## Troubleshooting

### Docker Desktop Not Running

**Problem:** Error: "Cannot connect to the Docker daemon"

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon should be steady)
3. Try your command again

### Port 5432 Already in Use

**Problem:** Port conflict with local PostgreSQL

**Solution 1 - Stop local PostgreSQL:**
```bash
# macOS with Homebrew
brew services stop postgresql@14

# Linux (systemd)
sudo systemctl stop postgresql

# Windows
# Stop PostgreSQL service from Services app
```

**Solution 2 - Change Docker port:**

Edit `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use port 5433 instead
```

Update `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/doon_farm_dev
```

### Container Won't Start

**Problem:** Container exits immediately

**Solution:**
```bash
# View logs to see error
docker compose logs postgres

# Common fixes:
# 1. Remove old volumes
docker compose down -v

# 2. Restart Docker Desktop

# 3. Check disk space
df -h

# 4. Rebuild container
docker compose up -d --force-recreate
```

### Database Connection Refused

**Problem:** Application can't connect to database

**Solution:**
```bash
# Check if container is running
docker compose ps

# Check container health
docker compose exec postgres pg_isready -U postgres

# Restart container
docker compose restart postgres

# Check logs for errors
docker compose logs postgres

# Verify DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL
```

### Permission Denied on Setup Script

**Problem:** `./scripts/docker-setup.sh: Permission denied`

**Solution:**
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### Data Persistence Issues

**Problem:** Data disappears after restart

**Solution:**
- Make sure you're using `docker compose down` (not `docker compose down -v`)
- The `-v` flag removes volumes and deletes all data
- Check that volumes are created: `docker volume ls`

### Slow Performance

**Problem:** Database queries are slow

**Solution:**
1. Allocate more resources to Docker Desktop:
   - Open Docker Desktop Settings
   - Go to Resources
   - Increase CPU and Memory allocation
   - Click "Apply & Restart"

2. Check disk space:
   ```bash
   docker system df
   ```

3. Clean up unused resources:
   ```bash
   docker system prune
   ```

## Advanced Configuration

### Custom Database Configuration

Edit `docker-compose.yml` to customize PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: doon_farm_dev
      # Add custom configuration
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=256MB"
```

### Multiple Databases

To run multiple databases:

```yaml
services:
  postgres:
    environment:
      POSTGRES_MULTIPLE_DATABASES: doon_farm_dev,doon_farm_test
```

### Using PostgreSQL GUI Tools

Connect with tools like pgAdmin, DBeaver, or TablePlus:

- **Host:** localhost
- **Port:** 5432
- **Database:** doon_farm_dev
- **Username:** postgres
- **Password:** postgres

### Docker Compose Profiles

For advanced setups with multiple services:

```yaml
services:
  postgres:
    profiles: ["dev"]
  
  redis:
    profiles: ["dev", "cache"]
```

```bash
# Start only postgres
docker compose --profile dev up -d

# Start postgres and redis
docker compose --profile dev --profile cache up -d
```

## Best Practices

1. **Always use `docker compose down` (without `-v`) to preserve data**
2. **Backup your database before major changes**
3. **Keep Docker Desktop updated**
4. **Monitor disk space usage**
5. **Use `.dockerignore` to exclude unnecessary files**
6. **Don't commit `.env.local` to version control**
7. **Use volumes for data persistence**
8. **Check logs when troubleshooting**

## Useful Commands Cheat Sheet

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Access database
docker compose exec postgres psql -U postgres -d doon_farm_dev

# Backup database
docker compose exec -T postgres pg_dump -U postgres doon_farm_dev > backup.sql

# Reset everything
docker compose down -v && ./scripts/docker-setup.sh

# Clean up Docker
docker system prune -a
```

## Next Steps

- [Local Development Guide](LOCAL_DEVELOPMENT.md) - Development workflow
- [Security Documentation](SECURITY.md) - Security best practices
- [Performance Checklist](PERFORMANCE_CHECKLIST.md) - Optimization tips

## Support

If you encounter issues not covered in this guide:

1. Check Docker Desktop logs
2. Review container logs: `docker compose logs postgres`
3. Verify Docker Desktop is running and updated
4. Check system resources (CPU, RAM, disk space)
5. Try restarting Docker Desktop
6. Contact the development team

---

**Happy Coding! 🚀**
