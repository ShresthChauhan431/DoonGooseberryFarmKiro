#!/bin/bash

# Doon Gooseberry Farm - Local Development Setup Script
# This script automates the setup process for local development

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Generate random secret
generate_secret() {
    openssl rand -base64 32
}

print_header "Doon Gooseberry Farm - Local Setup"

echo "This script will help you set up the development environment."
echo "Press Ctrl+C at any time to cancel."
echo ""

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required"
        exit 1
    fi
else
    print_error "Node.js is not installed"
    print_info "Please install Node.js 18 or later from https://nodejs.org/"
    exit 1
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm is installed: $PNPM_VERSION"
else
    print_error "pnpm is not installed"
    print_info "Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed successfully"
fi

# Check PostgreSQL
if command_exists psql; then
    POSTGRES_VERSION=$(psql --version | awk '{print $3}')
    print_success "PostgreSQL is installed: $POSTGRES_VERSION"
else
    print_error "PostgreSQL is not installed"
    print_info "Please install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi

# Check if PostgreSQL is running
if pg_isready >/dev/null 2>&1; then
    print_success "PostgreSQL is running"
else
    print_warning "PostgreSQL is not running"
    print_info "Attempting to start PostgreSQL..."
    
    # Try to start PostgreSQL (macOS with Homebrew)
    if command_exists brew; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        sleep 2
        
        if pg_isready >/dev/null 2>&1; then
            print_success "PostgreSQL started successfully"
        else
            print_error "Could not start PostgreSQL automatically"
            print_info "Please start PostgreSQL manually and run this script again"
            exit 1
        fi
    else
        print_error "Could not start PostgreSQL automatically"
        print_info "Please start PostgreSQL manually and run this script again"
        exit 1
    fi
fi

# Step 2: Database setup
print_header "Step 2: Database Setup"

echo "Enter PostgreSQL connection details:"
read -p "PostgreSQL host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "PostgreSQL port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "PostgreSQL user [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Database name [doon_farm_dev]: " DB_NAME
DB_NAME=${DB_NAME:-doon_farm_dev}

# Test database connection
print_info "Testing database connection..."
export PGPASSWORD=$DB_PASSWORD

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw template1; then
    print_success "Database connection successful"
else
    print_error "Could not connect to PostgreSQL"
    print_info "Please check your credentials and try again"
    exit 1
fi

# Check if database exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " DROP_DB
    
    if [[ $DROP_DB =~ ^[Yy]$ ]]; then
        print_info "Dropping existing database..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" >/dev/null 2>&1
        print_success "Database dropped"
        
        print_info "Creating database..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" >/dev/null 2>&1
        print_success "Database created: $DB_NAME"
    else
        print_info "Using existing database"
    fi
else
    print_info "Creating database..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" >/dev/null 2>&1
    print_success "Database created: $DB_NAME"
fi

unset PGPASSWORD

# Step 3: Environment variables
print_header "Step 3: Environment Configuration"

if [ -f ".env.local" ]; then
    print_warning ".env.local already exists"
    read -p "Do you want to overwrite it? (y/N): " OVERWRITE_ENV
    
    if [[ ! $OVERWRITE_ENV =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env.local"
        ENV_EXISTS=true
    fi
fi

if [ "$ENV_EXISTS" != true ]; then
    print_info "Creating .env.local from .env.example..."
    
    if [ ! -f ".env.example" ]; then
        print_error ".env.example not found"
        exit 1
    fi
    
    cp .env.example .env.local
    print_success ".env.local created"
    
    # Generate AUTH_SECRET
    print_info "Generating authentication secret..."
    AUTH_SECRET=$(generate_secret)
    
    # Build DATABASE_URL
    if [ -n "$DB_PASSWORD" ]; then
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    else
        DATABASE_URL="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    fi
    
    # Update .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env.local
        sed -i '' "s|BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=\"${AUTH_SECRET}\"|" .env.local
    else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env.local
        sed -i "s|BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=\"${AUTH_SECRET}\"|" .env.local
    fi
    
    print_success "Database URL configured"
    print_success "Authentication secret generated"
fi

# Step 4: Optional services
print_header "Step 4: Optional Services Configuration"

echo "The following services are optional but recommended for full functionality:"
echo ""

# Razorpay
read -p "Do you want to configure Razorpay (payment gateway)? (y/N): " SETUP_RAZORPAY
if [[ $SETUP_RAZORPAY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Get your test keys from: https://dashboard.razorpay.com/app/website-app-settings/api-keys"
    read -p "Razorpay Test Key ID (rzp_test_...): " RAZORPAY_KEY_ID
    read -p "Razorpay Test Key Secret: " RAZORPAY_KEY_SECRET
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|RAZORPAY_KEY_ID=.*|RAZORPAY_KEY_ID=\"${RAZORPAY_KEY_ID}\"|" .env.local
        sed -i '' "s|RAZORPAY_KEY_SECRET=.*|RAZORPAY_KEY_SECRET=\"${RAZORPAY_KEY_SECRET}\"|" .env.local
        sed -i '' "s|NEXT_PUBLIC_RAZORPAY_KEY_ID=.*|NEXT_PUBLIC_RAZORPAY_KEY_ID=\"${RAZORPAY_KEY_ID}\"|" .env.local
    else
        sed -i "s|RAZORPAY_KEY_ID=.*|RAZORPAY_KEY_ID=\"${RAZORPAY_KEY_ID}\"|" .env.local
        sed -i "s|RAZORPAY_KEY_SECRET=.*|RAZORPAY_KEY_SECRET=\"${RAZORPAY_KEY_SECRET}\"|" .env.local
        sed -i "s|NEXT_PUBLIC_RAZORPAY_KEY_ID=.*|NEXT_PUBLIC_RAZORPAY_KEY_ID=\"${RAZORPAY_KEY_ID}\"|" .env.local
    fi
    
    print_success "Razorpay configured"
else
    print_info "Skipping Razorpay setup (you can configure it later in .env.local)"
fi

echo ""

# Resend
read -p "Do you want to configure Resend (email service)? (y/N): " SETUP_RESEND
if [[ $SETUP_RESEND =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Get your API key from: https://resend.com/api-keys"
    read -p "Resend API Key: " RESEND_API_KEY
    read -p "From Email Address: " RESEND_FROM_EMAIL
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|RESEND_API_KEY=.*|RESEND_API_KEY=\"${RESEND_API_KEY}\"|" .env.local
        sed -i '' "s|RESEND_FROM_EMAIL=.*|RESEND_FROM_EMAIL=\"${RESEND_FROM_EMAIL}\"|" .env.local
    else
        sed -i "s|RESEND_API_KEY=.*|RESEND_API_KEY=\"${RESEND_API_KEY}\"|" .env.local
        sed -i "s|RESEND_FROM_EMAIL=.*|RESEND_FROM_EMAIL=\"${RESEND_FROM_EMAIL}\"|" .env.local
    fi
    
    print_success "Resend configured"
else
    print_info "Skipping Resend setup (you can configure it later in .env.local)"
fi

echo ""

# Storage
read -p "Do you want to configure cloud storage (Cloudflare R2 or Vercel Blob)? (y/N): " SETUP_STORAGE
if [[ $SETUP_STORAGE =~ ^[Yy]$ ]]; then
    echo ""
    echo "Choose storage provider:"
    echo "1) Cloudflare R2"
    echo "2) Vercel Blob"
    read -p "Enter choice (1 or 2): " STORAGE_CHOICE
    
    if [ "$STORAGE_CHOICE" = "1" ]; then
        print_info "Cloudflare R2 setup"
        read -p "R2 Account ID: " R2_ACCOUNT_ID
        read -p "R2 Access Key ID: " R2_ACCESS_KEY_ID
        read -p "R2 Secret Access Key: " R2_SECRET_ACCESS_KEY
        read -p "R2 Bucket Name: " R2_BUCKET_NAME
        read -p "R2 Public URL: " R2_PUBLIC_URL
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|R2_ACCOUNT_ID=.*|R2_ACCOUNT_ID=\"${R2_ACCOUNT_ID}\"|" .env.local
            sed -i '' "s|R2_ACCESS_KEY_ID=.*|R2_ACCESS_KEY_ID=\"${R2_ACCESS_KEY_ID}\"|" .env.local
            sed -i '' "s|R2_SECRET_ACCESS_KEY=.*|R2_SECRET_ACCESS_KEY=\"${R2_SECRET_ACCESS_KEY}\"|" .env.local
            sed -i '' "s|R2_BUCKET_NAME=.*|R2_BUCKET_NAME=\"${R2_BUCKET_NAME}\"|" .env.local
            sed -i '' "s|R2_PUBLIC_URL=.*|R2_PUBLIC_URL=\"${R2_PUBLIC_URL}\"|" .env.local
        else
            sed -i "s|R2_ACCOUNT_ID=.*|R2_ACCOUNT_ID=\"${R2_ACCOUNT_ID}\"|" .env.local
            sed -i "s|R2_ACCESS_KEY_ID=.*|R2_ACCESS_KEY_ID=\"${R2_ACCESS_KEY_ID}\"|" .env.local
            sed -i "s|R2_SECRET_ACCESS_KEY=.*|R2_SECRET_ACCESS_KEY=\"${R2_SECRET_ACCESS_KEY}\"|" .env.local
            sed -i "s|R2_BUCKET_NAME=.*|R2_BUCKET_NAME=\"${R2_BUCKET_NAME}\"|" .env.local
            sed -i "s|R2_PUBLIC_URL=.*|R2_PUBLIC_URL=\"${R2_PUBLIC_URL}\"|" .env.local
        fi
        
        print_success "Cloudflare R2 configured"
    elif [ "$STORAGE_CHOICE" = "2" ]; then
        print_info "Vercel Blob setup"
        read -p "Vercel Blob Read/Write Token: " BLOB_TOKEN
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|BLOB_READ_WRITE_TOKEN=.*|BLOB_READ_WRITE_TOKEN=\"${BLOB_TOKEN}\"|" .env.local
        else
            sed -i "s|BLOB_READ_WRITE_TOKEN=.*|BLOB_READ_WRITE_TOKEN=\"${BLOB_TOKEN}\"|" .env.local
        fi
        
        print_success "Vercel Blob configured"
    fi
else
    print_info "Skipping storage setup (you can configure it later in .env.local)"
fi

# Step 5: Install dependencies
print_header "Step 5: Installing Dependencies"

print_info "Running pnpm install..."
pnpm install

print_success "Dependencies installed"

# Step 6: Database migrations
print_header "Step 6: Database Setup"

print_info "Pushing database schema..."
pnpm db:push

print_success "Database schema created"

# Step 7: Seed database
print_header "Step 7: Seeding Database"

read -p "Do you want to seed the database with sample data? (Y/n): " SEED_DB
SEED_DB=${SEED_DB:-Y}

if [[ $SEED_DB =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    pnpm db:seed
    print_success "Database seeded with sample data"
else
    print_info "Skipping database seeding"
fi

# Step 8: Success message
print_header "Setup Complete! 🎉"

echo ""
print_success "Your development environment is ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Admin Credentials:"
echo "   Email:    admin@doonfarm.com"
echo "   Password: Admin@123"
echo ""
echo "💳 Test Payment (Razorpay Test Mode):"
echo "   Card:     4111 1111 1111 1111"
echo "   CVV:      Any 3 digits"
echo "   Expiry:   Any future date"
echo "   OTP:      123456"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "   1. Start the development server:"
echo "      ${GREEN}pnpm dev${NC}"
echo ""
echo "   2. Open your browser:"
echo "      ${BLUE}http://localhost:3000${NC}"
echo ""
echo "   3. Access admin panel:"
echo "      ${BLUE}http://localhost:3000/admin${NC}"
echo ""
echo "   4. View database (optional):"
echo "      ${GREEN}pnpm db:studio${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - docs/LOCAL_DEVELOPMENT.md - Development guide"
echo "   - docs/SECURITY.md - Security features"
echo ""
echo "💡 Useful Commands:"
echo "   ${GREEN}pnpm test${NC}           - Run tests"
echo "   ${GREEN}pnpm lint${NC}           - Run linter"
echo "   ${GREEN}pnpm db:studio${NC}      - Open database GUI"
echo ""
print_success "Happy coding! 🚀"
echo ""
