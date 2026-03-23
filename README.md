d# Doon Gooseberry Farm - E-Commerce Platform

A modern, full-featured e-commerce platform for Doon Gooseberry Farm, specializing in authentic Himalayan pickles, chutneys, jams, and spices.

## ✨ Features

### Customer Features
-  Product browsing with advanced filtering and search
-  Shopping cart with guest and authenticated user support
-  Wishlist management
-  User authentication and profile management
-  Email verification on signup
-  Multiple delivery addresses
-  Secure payment processing with Razorpay
-  Order tracking and history
-  Product reviews and ratings
-  Coupon and discount system
-  Email notifications for orders (confirmation, shipped, delivered)
-  Fully responsive mobile-first design
-  WCAG 2.1 AA accessibility compliant

### Admin Features
-  Dashboard with sales analytics
-  Product management (CRUD operations)
-  Category management
-  Coupon management
-  Order management and status updates
-  Customer management
-  Newsletter subscriber management
-  Image upload and management

### Technical Features
-  Server-side rendering with Next.js 16 (App Router)
-  Secure authentication with Better Auth (email/password + email verification)
-  PostgreSQL database with Drizzle ORM
-  Beautiful UI with Tailwind CSS and shadcn/ui
-  Transactional emails with Resend + React Email templates
-  Cloud storage with Cloudflare R2 or Vercel Blob
-  Security features (CSRF protection, Upstash Redis rate limiting, Zod input validation)
-  Performance optimized (image caching, code splitting, N+1 query elimination)
-  Comprehensive test coverage with Vitest
-  Server-side checkout session persistence (no client-side sessionStorage)

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **pnpm** (recommended) or **npm**
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop)) — **Recommended for easy setup**
- **Git** ([Download](https://git-scm.com/downloads))

**Note:** You can use either Docker (recommended) or a local PostgreSQL installation.

##  Quick Start (Docker — Recommended)

The easiest way to get started is using Docker for the database:

```bash
# Clone the repository
git clone <repository-url>
cd doon-farm-ecommerce

# Run the automated Docker setup script
./scripts/docker-setup.sh

# Start the development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

##  Docker Setup (Recommended)

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
pnpm dev
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
pnpm dev
```

See [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) for detailed instructions.

##  Environment Variables

Create a `.env.local` file in the project root. Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth sessions |
| `BETTER_AUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`) |
| `RAZORPAY_KEY_ID` | Razorpay API key (test or live) |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same Razorpay key, exposed to the client |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `FROM_EMAIL` | Verified sender email for Resend |

**Optional (recommended for production):**

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |

> **Note:** If Upstash Redis credentials are not configured, rate limiting is disabled and a warning is logged at startup.

##  Default Credentials

### Admin Account
- **Email:** admin@doonfarm.com
- **Password:** Admin@123

### Test Payment (Razorpay Test Mode)
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **OTP:** 123456 (for test mode)

##  Available Scripts

```bash
# Development
pnpm dev               # Start development server
pnpm build             # Build for production
pnpm start             # Start production server
pnpm lint              # Lint with Biome
pnpm lint:fix          # Auto-fix lint issues with Biome
pnpm format            # Format code with Biome

# Database
pnpm db:generate       # Generate Drizzle migrations
pnpm db:push           # Push schema changes directly (dev only)
pnpm db:migrate        # Run pending migrations
pnpm db:seed           # Seed database with initial data
pnpm db:studio         # Open Drizzle Studio (database GUI)

# Testing
pnpm test              # Run all tests (Vitest)
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

##  Project Structure

```
doon-farm-ecommerce/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── (shop)/              # Customer-facing pages (shop, checkout)
│   ├── account/             # User account pages
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes (auth, webhooks)
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── layout/              # Layout components (header, footer)
│   ├── product/             # Product-related components
│   ├── cart/                # Cart components
│   ├── checkout/            # Checkout components (address, review, payment)
│   ├── account/             # Account components
│   └── admin/               # Admin components
├── lib/                     # Utility libraries
│   ├── actions/             # Server Actions (mutations)
│   ├── queries/             # Database queries (reads)
│   ├── db/                  # Database config & schema
│   ├── auth/                # Better Auth configuration
│   ├── payment/             # Razorpay integration
│   ├── email/               # Email templates (React Email)
│   ├── storage/             # File storage (R2 / Vercel Blob)
│   ├── security/            # Rate limiting, CSRF
│   ├── utils/               # Pure helpers (cart, price, shipping)
│   └── types.ts             # Shared types (ActionResult<T>)
├── __tests__/               # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── public/                  # Static assets
└── drizzle/                 # Database migrations
```

##  Database Schema

Key tables managed by Drizzle ORM:

| Table | Purpose |
|---|---|
| `users` | User accounts (Better Auth compatible) |
| `sessions` | Auth sessions |
| `accounts` | OAuth / credential accounts |
| `verifications` | Email verification tokens |
| `products` | Product catalog |
| `categories` | Product categories |
| `carts` / `cart_items` | Shopping carts |
| `orders` / `order_items` | Orders with human-readable order numbers (DGF-YYYYMMDD-{id}) |
| `addresses` | Saved delivery addresses |
| `coupons` | Discount coupons |
| `reviews` | Product reviews & ratings |
| `wishlist` | User wishlists |
| `checkout_sessions` | Server-side checkout state (address, coupon) with TTL |
| `subscribers` | Newsletter subscribers |
| `site_settings` | Configurable site settings (delivery charges, etc.) |

### Migrations

Migrations live in the `drizzle/` directory and are generated by Drizzle Kit:

```bash
# After changing lib/db/schema.ts, generate a migration:
pnpm db:generate

# Apply pending migrations:
pnpm db:migrate
```

## 🛒 Checkout Flow

The checkout flow is a three-step process with **server-side state persistence**:

1. **Step 1 — Address** (`/checkout?step=1`)
   - User fills or selects a shipping address
   - Pincode serviceability is validated
   - Address is persisted to the `checkout_sessions` table via a Server Action

2. **Step 2 — Review** (`/checkout?step=2`)
   - Address and cart items are displayed (loaded server-side)
   - Coupon codes can be applied/removed (persisted server-side)
   - Shipping cost is computed authoritatively on the server from delivery settings

3. **Step 3 — Payment** (`/checkout?step=3`)
   - Payment summary displayed from server-provided data
   - Razorpay payment modal handles the transaction
   - On success: order is created, stock decremented, cart cleared, checkout session cleared, confirmation email sent

> **No `sessionStorage` is used.** All checkout state survives page refreshes, new tabs, and device changes. Checkout sessions expire automatically after 2 hours.

##  Testing

### Quick Test Commands
```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Manual Testing Guides

**🛒 Testing Cart & Checkout**
- See [How to Test Guide](docs/HOW_TO_TEST.md) — Complete step-by-step instructions
- See [Quick Reference](docs/QUICK_TEST_REFERENCE.md) — Quick lookup for common tasks
- See [Testing Guide](docs/TESTING_GUIDE.md) — Detailed testing scenarios

**Key Features to Test:**
1. **Cart**: Add items, update quantities, verify cart badge
2. **Delivery Charges**: < ₹500 = ₹50 shipping, ≥ ₹500 = FREE (configurable via admin settings)
3. **Address Form**: Validate pincode (6 digits), phone (10 digits), serviceability check
4. **Payment**: Use Razorpay test cards (4111 1111 1111 1111)
5. **Email Verification**: Sign up → receive email → click verification link
6. **Checkout Persistence**: Fill address → refresh page → address should be preserved

### Test Coverage
The project includes comprehensive tests (Vitest) for:
- Server Actions (cart, orders, products, reviews, addresses, coupons, etc.)
- Database queries (products, orders, categories, wishlist, etc.)
- Utility functions (cart calculations, price formatting, validation)
- Integration flows (checkout, cart merge, order status transitions)

Current status: **424 tests passing, 1 skipped (425 total)**

##  Troubleshooting

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
docker compose ps         # Check if container is running
docker compose restart postgres

# For local PostgreSQL:
pg_isready                # Check if PostgreSQL is running
brew services start postgresql@14   # macOS with Homebrew

# Test connection
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
# Generate any missing migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Nuclear option — push schema directly (WARNING: may lose data)
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
- Verify `RESEND_API_KEY` is valid
- Check that `FROM_EMAIL` is a verified domain in Resend
- In development, emails may be logged to console instead
- Check Resend dashboard for delivery status

### Rate Limiting Not Active

**Problem:** Rate limiting is disabled

**Solution:**
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`
- A startup warning (`console.error`) is logged when these are missing
- Rate limiting is automatically enabled once credentials are configured

## 📚 Documentation

- [Docker Setup Guide](docs/DOCKER_SETUP.md) — Complete Docker setup and management
- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) — Detailed development workflow
- [Cart, Payment & Delivery Summary](docs/CART_PAYMENT_SUMMARY.md) — Complete checkout flow reference
- [Security Documentation](docs/SECURITY.md) — Security features and best practices
- [Image Storage Setup](docs/IMAGE_STORAGE_SETUP.md) — Configure Cloudflare R2 or Vercel Blob
- [Performance Checklist](docs/PERFORMANCE_CHECKLIST.md) — Optimization guidelines
- [Accessibility Audit](docs/ACCESSIBILITY_AUDIT.md) — Accessibility compliance

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Authentication** | Better Auth (email/password + email verification) |
| **Payment** | Razorpay |
| **Email** | Resend + React Email |
| **Storage** | Cloudflare R2 / Vercel Blob |
| **Rate Limiting** | Upstash Redis |
| **Testing** | Vitest, React Testing Library |
| **Linting/Formatting** | Biome |
| **Validation** | Zod |
| **State Management** | React Hooks, Server Actions, Server-side checkout sessions |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Before submitting a PR, ensure:**
```bash
pnpm lint          # No lint errors
npx tsc --noEmit   # No TypeScript errors
pnpm test          # All tests pass
```

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review [Documentation](docs/)
- Contact the development team

---

Made with ❤️ for Doon Gooseberry Farm



DATABASE_URL="postgresql://neondb_owner:npg_UlKGx8pHLZS0@ep-dark-pine-aib0snew-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx drizzle-kit migrate