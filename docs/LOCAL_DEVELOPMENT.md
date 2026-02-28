# Local Development Guide

This guide provides detailed information for developing the Doon Gooseberry Farm e-commerce platform locally.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [Testing Guide](#testing-guide)
- [Debugging Tips](#debugging-tips)
- [Common Development Tasks](#common-development-tasks)
- [Environment Variables Reference](#environment-variables-reference)
- [API Endpoints](#api-endpoints)
- [Admin Panel](#admin-panel)

## Development Workflow

### Starting Development

1. **Start the development server:**
   ```bash
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

2. **Open database GUI (optional):**
   ```bash
   pnpm db:studio
   ```
   Drizzle Studio will open at [https://local.drizzle.studio](https://local.drizzle.studio)

3. **Run tests in watch mode (optional):**
   ```bash
   pnpm test:watch
   ```

### Development Server Features

- **Hot Module Replacement (HMR):** Changes to code are reflected instantly
- **Fast Refresh:** React components update without losing state
- **Error Overlay:** Detailed error messages in the browser
- **TypeScript Checking:** Real-time type checking in your IDE

### Code Quality Tools

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues automatically
pnpm lint --fix

# Check TypeScript types
pnpm type-check

# Format code with Prettier
pnpm format

# Check formatting without changes
pnpm format:check
```

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## Database Management

### Schema Changes

When you modify the database schema in `lib/db/schema.ts`:

1. **Generate migration:**
   ```bash
   pnpm db:generate
   ```
   This creates a new migration file in `drizzle/` directory.

2. **Apply migration:**
   ```bash
   pnpm db:migrate
   ```
   Or for development, push directly:
   ```bash
   pnpm db:push
   ```

3. **Verify changes:**
   ```bash
   pnpm db:studio
   ```

### Database Commands

```bash
# Push schema changes (development)
pnpm db:push

# Generate migration files
pnpm db:generate

# Run migrations (production)
pnpm db:migrate

# Seed database with sample data
pnpm db:seed

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Drizzle Studio

Drizzle Studio provides a visual interface for your database:

- **Browse tables:** View all tables and their data
- **Edit records:** Add, update, or delete records
- **Run queries:** Execute custom SQL queries
- **View relationships:** See foreign key relationships

Access at: [https://local.drizzle.studio](https://local.drizzle.studio)

### Database Seeding

The seed script (`lib/db/seed.ts`) creates:

- **Admin user:** admin@doonfarm.com / Admin@123
- **Product categories:** Pickles, Chutneys, Jams, Spices
- **Sample products:** 20+ products with images and descriptions
- **Sample coupons:** WELCOME10, SAVE20, etc.

Run seeding:
```bash
pnpm db:seed
```

### Resetting Database

To completely reset your database:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE doon_farm_dev;"
psql -U postgres -c "CREATE DATABASE doon_farm_dev;"

# Push schema
pnpm db:push

# Seed data
pnpm db:seed
```

### Database Backup

```bash
# Backup database
pg_dump -U postgres doon_farm_dev > backup.sql

# Restore database
psql -U postgres doon_farm_dev < backup.sql
```

## Testing Guide

### Test Structure

```
__tests__/
├── unit/                    # Unit tests
│   ├── lib/
│   │   ├── actions/        # Server action tests
│   │   ├── queries/        # Database query tests
│   │   └── utils/          # Utility function tests
│   └── components/         # Component tests
└── integration/            # Integration tests
    ├── checkout-flow.test.ts
    ├── cart-order-conversion.test.ts
    └── guest-cart-merge.test.ts
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test cart.test.ts

# Run tests with coverage
pnpm test:coverage

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration
```

### Writing Tests

#### Unit Test Example

```typescript
import { calculateCartTotal } from '@/lib/utils/cart';

describe('calculateCartTotal', () => {
  it('should calculate total correctly', () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ];
    
    expect(calculateCartTotal(items)).toBe(250);
  });
});
```

#### Integration Test Example

```typescript
import { createOrder } from '@/lib/actions/orders';

describe('Order Creation', () => {
  it('should create order and clear cart', async () => {
    const result = await createOrder({
      userId: 'test-user',
      items: [...],
      address: {...},
    });
    
    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
  });
});
```

### Test Coverage

View coverage report:
```bash
pnpm test:coverage
```

Coverage reports are generated in `coverage/` directory.

Target coverage: 80%+ for critical paths

## Debugging Tips

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Console Logging

```typescript
// Server-side (shows in terminal)
console.log('Server:', data);

// Client-side (shows in browser console)
console.log('Client:', data);
```

### React DevTools

Install React DevTools browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Network Debugging

Use browser DevTools Network tab to:
- Monitor API requests
- Check request/response payloads
- Identify slow requests
- Debug CORS issues

### Database Debugging

```typescript
// Enable Drizzle query logging
import { drizzle } from 'drizzle-orm/postgres-js';

const db = drizzle(client, {
  logger: true, // Logs all SQL queries
});
```

### Error Tracking

Errors are logged to:
- **Browser console:** Client-side errors
- **Terminal:** Server-side errors
- **Sentry (production):** All errors with context

## Common Development Tasks

### Adding a New Page

1. Create page file in `app/` directory:
   ```typescript
   // app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. Add navigation link:
   ```typescript
   // components/layout/header.tsx
   <Link href="/new-page">New Page</Link>
   ```

### Adding a New API Route

1. Create route handler:
   ```typescript
   // app/api/new-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   
   export async function GET(request: NextRequest) {
     return NextResponse.json({ message: 'Hello' });
   }
   ```

2. Call from client:
   ```typescript
   const response = await fetch('/api/new-endpoint');
   const data = await response.json();
   ```

### Adding a Server Action

1. Create action file:
   ```typescript
   // lib/actions/new-action.ts
   'use server';
   
   export async function newAction(data: FormData) {
     // Process data
     return { success: true };
   }
   ```

2. Use in component:
   ```typescript
   import { newAction } from '@/lib/actions/new-action';
   
   <form action={newAction}>
     {/* form fields */}
   </form>
   ```

### Adding a Database Table

1. Define schema:
   ```typescript
   // lib/db/schema.ts
   export const newTable = pgTable('new_table', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
     createdAt: timestamp('created_at').defaultNow(),
   });
   ```

2. Generate migration:
   ```bash
   pnpm db:generate
   ```

3. Apply migration:
   ```bash
   pnpm db:push
   ```

### Adding a UI Component

1. Create component:
   ```typescript
   // components/new-component.tsx
   export function NewComponent() {
     return <div>Component</div>;
   }
   ```

2. Add tests:
   ```typescript
   // components/__tests__/new-component.test.tsx
   import { render } from '@testing-library/react';
   import { NewComponent } from '../new-component';
   
   describe('NewComponent', () => {
     it('renders correctly', () => {
       const { getByText } = render(<NewComponent />);
       expect(getByText('Component')).toBeInTheDocument();
     });
   });
   ```

### Working with Images

1. **Upload via admin panel:**
   - Navigate to Admin > Products
   - Click "Add Product" or edit existing
   - Use image upload component

2. **Programmatic upload:**
   ```typescript
   import { uploadImage } from '@/lib/storage/upload';
   
   const url = await uploadImage(file, 'products');
   ```

3. **Display images:**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src={imageUrl}
     alt="Product"
     width={400}
     height={400}
     className="object-cover"
   />
   ```

### Working with Forms

1. **Using Server Actions:**
   ```typescript
   'use client';
   
   import { useActionState } from 'react';
   import { submitForm } from '@/lib/actions/form';
   
   export function MyForm() {
     const [state, formAction] = useActionState(submitForm, null);
     
     return (
       <form action={formAction}>
         <input name="field" />
         <button type="submit">Submit</button>
       </form>
     );
   }
   ```

2. **With validation:**
   ```typescript
   import { z } from 'zod';
   
   const schema = z.object({
     email: z.string().email(),
     name: z.string().min(2),
   });
   
   export async function submitForm(formData: FormData) {
     const data = schema.parse({
       email: formData.get('email'),
       name: formData.get('name'),
     });
     
     // Process validated data
   }
   ```

## Environment Variables Reference

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Optional Variables

```env
# Payment (Razorpay)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@example.com"

# Storage - Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="https://..."

# Storage - Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# Monitoring (Sentry)
SENTRY_DSN="..."
NEXT_PUBLIC_SENTRY_DSN="..."
```

### Variable Naming Rules

- **Server-only:** Regular names (e.g., `DATABASE_URL`)
- **Client-accessible:** Prefix with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_APP_URL`)
- **Secrets:** Never prefix with `NEXT_PUBLIC_`

## API Endpoints

### Public Endpoints

```
GET  /api/products              # List products
GET  /api/products/[slug]       # Get product details
GET  /api/categories            # List categories
POST /api/newsletter            # Subscribe to newsletter
POST /api/upload                # Upload images (authenticated)
```

### Authenticated Endpoints

```
GET  /api/cart                  # Get user cart
POST /api/cart                  # Add to cart
PUT  /api/cart/[id]            # Update cart item
DEL  /api/cart/[id]            # Remove from cart

GET  /api/orders                # List user orders
GET  /api/orders/[id]          # Get order details
POST /api/orders                # Create order

GET  /api/wishlist              # Get wishlist
POST /api/wishlist              # Add to wishlist
DEL  /api/wishlist/[id]        # Remove from wishlist

GET  /api/addresses             # List addresses
POST /api/addresses             # Create address
PUT  /api/addresses/[id]       # Update address
DEL  /api/addresses/[id]       # Delete address

POST /api/reviews               # Create review
PUT  /api/reviews/[id]         # Update review
DEL  /api/reviews/[id]         # Delete review
```

### Admin Endpoints

```
GET  /api/admin/products        # List all products
POST /api/admin/products        # Create product
PUT  /api/admin/products/[id]  # Update product
DEL  /api/admin/products/[id]  # Delete product

GET  /api/admin/orders          # List all orders
PUT  /api/admin/orders/[id]    # Update order status

GET  /api/admin/coupons         # List coupons
POST /api/admin/coupons         # Create coupon
PUT  /api/admin/coupons/[id]   # Update coupon
DEL  /api/admin/coupons/[id]   # Delete coupon

GET  /api/admin/users           # List users
GET  /api/admin/analytics       # Get analytics data
```

## Admin Panel

### Accessing Admin Panel

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with admin credentials:
   - Email: admin@doonfarm.com
   - Password: Admin@123

### Admin Features

#### Dashboard
- Sales overview
- Recent orders
- Top products
- Revenue charts

#### Products Management
- Add/edit/delete products
- Upload product images
- Manage inventory
- Set pricing and discounts

#### Orders Management
- View all orders
- Update order status
- Process refunds
- Print invoices

#### Coupons Management
- Create discount coupons
- Set expiry dates
- Usage limits
- Coupon analytics

#### Customers Management
- View customer list
- Customer order history
- Customer analytics

#### Newsletter Management
- View subscribers
- Export subscriber list
- Send newsletters (future)

### Admin Permissions

Admin users have access to:
- All admin routes (`/admin/*`)
- All admin API endpoints
- Product management
- Order management
- User management

Regular users cannot access admin features.

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

// Automatic optimization
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold images
/>
```

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <p>Loading...</p>,
});
```

### Caching

```typescript
// Cache API responses
export const revalidate = 3600; // 1 hour

// Cache database queries
import { unstable_cache } from 'next/cache';

const getCachedProducts = unstable_cache(
  async () => getProducts(),
  ['products'],
  { revalidate: 3600 }
);
```

## Security Best Practices

1. **Never commit secrets:** Use `.env.local` for sensitive data
2. **Validate all inputs:** Use Zod schemas for validation
3. **Sanitize user content:** Prevent XSS attacks
4. **Use CSRF protection:** Enabled by default in Server Actions
5. **Rate limit APIs:** Implement rate limiting for public endpoints
6. **Secure authentication:** Use Better Auth with secure sessions
7. **HTTPS only:** Use HTTPS in production

## Troubleshooting

### Common Issues

**Issue:** Port 3000 already in use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

**Issue:** Database connection failed
```bash
# Check PostgreSQL status
pg_isready

# Restart PostgreSQL
brew services restart postgresql
```

**Issue:** Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

**Issue:** Type errors
```bash
# Regenerate types
pnpm db:generate
pnpm type-check
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better Auth Documentation](https://better-auth.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Getting Help

- Check the [README.md](../README.md) for setup instructions
- Review [SECURITY.md](./SECURITY.md) for security guidelines
- Contact the development team for support

---

Happy coding! 🚀
