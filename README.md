# Doon Gooseberry Farm - E-Commerce Platform

A modern, full-featured e-commerce platform for Doon Gooseberry Farm, specializing in authentic Himalayan pickles, chutneys, jams, and spices.

## ✨ Features

### Customer Features
- 🛍️ Product browsing with advanced filtering and search
- 🛒 Shopping cart with guest and authenticated user support
- ❤️ Wishlist management
- 👤 User authentication and profile management
- 📍 Multiple delivery addresses
- 💳 Secure payment processing with Razorpay
- 📦 Order tracking and history
- ⭐ Product reviews and ratings
- 🎟️ Coupon and discount system
- 📧 Email notifications for orders
- 📱 Fully responsive mobile-first design
- ♿ WCAG 2.1 AA accessibility compliant

### Admin Features
- 📊 Dashboard with sales analytics
- 📦 Product management (CRUD operations)
- 🏷️ Category management
- 🎫 Coupon management
- 📋 Order management and status updates
- 👥 Customer management
- 📧 Newsletter subscriber management
- 🖼️ Image upload and management

### Technical Features
- ⚡ Server-side rendering with Next.js 16
- 🔐 Secure authentication with Better Auth
- 🗄️ PostgreSQL database with Drizzle ORM
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 📧 Transactional emails with Resend
- 💾 Cloud storage with Cloudflare R2 or Vercel Blob
- 🔒 Security features (CSRF protection, rate limiting, input validation)
- 📈 Performance optimized (image optimization, code splitting)
- 🧪 Comprehensive test coverage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop)) - **Recommended for easy setup**
- **Git** ([Download](https://git-scm.com/downloads))

**Note:** You can use either Docker (recommended) or local PostgreSQL installation.

## 🚀 Quick Start (Docker - Recommended)

The easiest way to get started is using Docker for the database:

```bash
# Clone the repository
git clone <repository-url>
cd doon-farm-ecommerce

# Run the automated Docker setup script
./scripts/docker-setup.sh

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🐳 Docker Setup (Recommended)

### Why Docker?
- No need to install PostgreSQL locally
- Consistent database environment across all machines
- Easy to reset and start fresh
- Isolated from your system

### Prerequisites
- Docker Desktop installed and running

### Setup Steps

1. **Clone the repository:**
```bash
git clone <repository-url>
cd doon-farm-ecommerce
```

2. **Run the setup script:**
```bash
./scripts/docker-setup.sh
```

This script will:
- Start PostgreSQL in a Docker container
- Create the database
- Generate environment variables
- Install dependencies
- Run migrations
- Seed the database with sample data

3. **Start the development server:**
```bash
npm run dev
```

### Docker Commands

```bash
# Start the database
docker compose up -d

# Stop the database
docker compose down

# View database logs
docker compose logs -f postgres

# Reset database (removes all data)
docker compose down -v
./scripts/docker-setup.sh

# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d doon_farm_dev
```

For detailed Docker instructions, see [Docker Setup Guide](docs/DOCKER_SETUP.md).

## 🖥️ Alternative: Local PostgreSQL Setup

If you prefer to use a local PostgreSQL installation instead of Docker:

```bash
# Run the local setup script
./scripts/local-setup.sh

# Start the development server
npm run dev
```

See [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) for detailed instructions.

## � Default Credentialsr

### Admin Account
- **Email:** admin@doonfarm.com
- **Password:** Admin@123

### Test Payment (Razorpay Test Mode)
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **OTP:** 123456 (for test mode)

## 📜 Available Scripts

```bash
# Development
npm run dev            # Start development server
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run linter
npm run lint:fix       # Fix linting issues
npm run format         # Format code

# Database
npm run db:generate    # Generate Drizzle migrations
npm run db:push        # Push schema changes to database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database with initial data
npm run db:studio      # Open Drizzle Studio (database GUI)

# Testing
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report

# Performance & Accessibility
npm run lighthouse     # Run Lighthouse audit
```

## 📁 Project Structure

```
doon-farm-ecommerce/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (shop)/              # Customer-facing pages
│   ├── account/             # User account pages
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   ├── product/             # Product-related components
│   ├── cart/                # Cart components
│   ├── checkout/            # Checkout components
│   ├── account/             # Account components
│   └── admin/               # Admin components
├── lib/                     # Utility libraries
│   ├── actions/             # Server actions
│   ├── queries/             # Database queries
│   ├── db/                  # Database configuration
│   ├── auth/                # Authentication setup
│   ├── payment/             # Payment integration
│   ├── email/               # Email templates
│   ├── storage/             # File storage
│   ├── security/            # Security utilities
│   └── utils/               # Helper functions
├── __tests__/               # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── public/                  # Static assets
└── drizzle/                 # Database migrations
```

## 🧪 Testing

### Quick Test Commands
```bash
# Run all automated tests
pnpm test

# Test checkout flow components
tsx scripts/test-checkout.ts

# Test cart functionality
tsx scripts/test-cart.ts

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Manual Testing Guides

**🛒 Testing Cart & Checkout**
- See [How to Test Guide](docs/HOW_TO_TEST.md) - Complete step-by-step instructions
- See [Quick Reference](docs/QUICK_TEST_REFERENCE.md) - Quick lookup for common tasks
- See [Testing Guide](docs/TESTING_GUIDE.md) - Detailed testing scenarios

**Key Features to Test:**
1. **Cart**: Add items, update quantities, verify cart badge
2. **Delivery Charges**: < ₹500 = ₹50 shipping, ≥ ₹500 = FREE
3. **Address Form**: Validate pincode (6 digits), phone (10 digits)
4. **Payment**: Use Razorpay test cards (4111 1111 1111 1111)

### Test Coverage
The project includes comprehensive tests for:
- Server actions (cart, orders, products, reviews, etc.)
- Database queries
- Utility functions
- Integration flows (checkout, cart merge, order status)

## 🔧 Troubleshooting

### Docker Issues

**Problem:** Docker container won't start

**Solution:**
```bash
# Check if Docker Desktop is running
docker ps

# View container logs
docker compose logs postgres

# Restart containers
docker compose down
docker compose up -d

# Check container status
docker compose ps
```

**Problem:** Port 5432 already in use

**Solution:**
```bash
# Stop local PostgreSQL if running
# macOS with Homebrew:
brew services stop postgresql@14

# Or change the port in docker-compose.yml:
# ports:
#   - "5433:5432"
# Then update DATABASE_URL to use port 5433
```

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solution:**
```bash
# For Docker setup:
# Check if container is running
docker compose ps

# Restart container
docker compose restart postgres

# For local PostgreSQL:
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@14

# Check connection
psql -U postgres -d doon_farm_dev
```

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

### Migration Issues

**Problem:** Database schema out of sync

**Solution:**
```bash
# Reset database (WARNING: This will delete all data)
pnpm db:push --force

# Re-seed database
pnpm db:seed
```

### Environment Variables Not Loading

**Problem:** Environment variables are undefined

**Solution:**
- Ensure `.env.local` exists in the root directory
- Restart the development server after changing environment variables
- Check that variable names match exactly (case-sensitive)
- For client-side variables, ensure they start with `NEXT_PUBLIC_`

### Image Upload Issues

**Problem:** Images not uploading

**Solution:**
- Verify storage credentials in `.env.local`
- Check that the storage bucket exists and is accessible
- Ensure proper CORS configuration for R2/Blob storage
- Check file size limits (default: 5MB)

### Payment Integration Issues

**Problem:** Razorpay payment not working

**Solution:**
- Verify you're using test mode keys (starting with `rzp_test_`)
- Check that both `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are set
- Ensure webhook URL is configured in Razorpay dashboard (for production)
- Use test card: 4111 1111 1111 1111

### Email Not Sending

**Problem:** Transactional emails not being sent

**Solution:**
- Verify Resend API key is valid
- Check that `RESEND_FROM_EMAIL` is a verified domain
- In development, emails may be logged to console instead
- Check Resend dashboard for delivery status

## 📚 Documentation

- [Docker Setup Guide](docs/DOCKER_SETUP.md) - Complete Docker setup and management
- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) - Detailed development workflow
- [Security Documentation](docs/SECURITY.md) - Security features and best practices
- [Image Storage Setup](docs/IMAGE_STORAGE_SETUP.md) - Configure Cloudflare R2 or Vercel Blob
- [Performance Checklist](docs/PERFORMANCE_CHECKLIST.md) - Optimization guidelines
- [Accessibility Audit](docs/ACCESSIBILITY_AUDIT.md) - Accessibility compliance

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **Payment:** Razorpay
- **Email:** Resend
- **Storage:** Cloudflare R2 / Vercel Blob
- **Testing:** Jest, React Testing Library
- **Validation:** Zod
- **State Management:** React Hooks, Server Actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review [Documentation](docs/)
- Contact the development team

---

Made with ❤️ for Doon Gooseberry Farm
