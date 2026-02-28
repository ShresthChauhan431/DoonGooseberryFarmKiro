#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Doon Gooseberry Farm - Docker Setup${NC}"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    echo "Please install Docker Desktop which includes Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Stop any existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker compose down 2>/dev/null || true
echo ""

# Start PostgreSQL with Docker Compose
echo -e "${BLUE}Starting PostgreSQL container...${NC}"
docker compose up -d

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        echo "Check logs with: docker compose logs postgres"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""

# Create .env.local file
echo -e "${BLUE}Creating .env.local file...${NC}"
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠ .env.local already exists, backing up to .env.local.backup${NC}"
    cp .env.local .env.local.backup
fi

# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

cat > .env.local << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doon_farm_dev

# Authentication (Better Auth)
AUTH_SECRET=${AUTH_SECRET}
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Google OAuth (optional - configure if needed)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay Payment Gateway (optional - configure for production)
# RAZORPAY_KEY_ID=your-razorpay-key-id
# RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# Email Service (optional - configure for production)
# RESEND_API_KEY=your-resend-api-key
# FROM_EMAIL=orders@doonfarm.com

# Storage (optional - configure for production)
# R2_ACCOUNT_ID=your-cloudflare-account-id
# R2_ACCESS_KEY_ID=your-r2-access-key
# R2_SECRET_ACCESS_KEY=your-r2-secret-key
# R2_BUCKET_NAME=doon-farm-images

# Rate Limiting (optional - configure for production)
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Monitoring (optional - configure for production)
# SENTRY_DSN=your-sentry-dsn
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Node Environment
NODE_ENV=development
EOF

echo -e "${GREEN}✓ .env.local created${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
npm run db:push
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Seed database
echo -e "${BLUE}Seeding database...${NC}"
npm run db:seed
echo -e "${GREEN}✓ Database seeded${NC}"
echo ""

# Success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start the development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Open your browser:"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Useful Docker commands:${NC}"
echo "• View logs:        docker compose logs -f postgres"
echo "• Stop database:    docker compose down"
echo "• Start database:   docker compose up -d"
echo "• Reset database:   docker compose down -v && ./scripts/docker-setup.sh"
echo ""
echo -e "${BLUE}Admin credentials:${NC}"
echo "• Email:    admin@doonfarm.com"
echo "• Password: admin123"
echo ""
