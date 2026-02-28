import crypto from 'crypto';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

const { categories, products, users, accounts } = schema;

async function seed() {
  console.log('Seeding database...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // Seed categories
    console.log('Seeding categories...');
    const categoryData = [
      {
        name: 'Pickles',
        slug: 'pickles',
        description: 'Traditional homemade pickles made with fresh ingredients',
      },
      {
        name: 'Chutneys',
        slug: 'chutneys',
        description: 'Delicious chutneys to complement your meals',
      },
      {
        name: 'Jams',
        slug: 'jams',
        description: 'Sweet and fruity jams made from farm-fresh fruits',
      },
      {
        name: 'Juices',
        slug: 'juices',
        description: 'Fresh and natural fruit juices',
      },
      {
        name: 'Candies',
        slug: 'candies',
        description: 'Handmade candies with natural flavors',
      },
      {
        name: 'Spices',
        slug: 'spices',
        description: 'Premium quality spices for your kitchen',
      },
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✓ Seeded ${insertedCategories.length} categories`);

    // Create a map of category slugs to IDs
    const categoryMap = insertedCategories.reduce(
      (acc, cat) => {
        acc[cat.slug] = cat.id;
        return acc;
      },
      {} as Record<string, string>
    );

    // Seed products
    console.log('Seeding products...');
    const productData = [
      // Pickles (3 products)
      {
        name: 'Mango Pickle',
        slug: 'mango-pickle',
        description:
          'Traditional mango pickle made with raw mangoes, mustard oil, and aromatic spices. A perfect accompaniment to any meal.',
        price: 25000, // ₹250 in paise
        categoryId: categoryMap.pickles,
        stock: 50,
        images: ['/images/products/mango-pickle.jpg'],
        isActive: true,
      },
      {
        name: 'Mixed Vegetable Pickle',
        slug: 'mixed-vegetable-pickle',
        description:
          'A delightful mix of carrots, cauliflower, and green chilies pickled in mustard oil with traditional spices.',
        price: 22000, // ₹220
        categoryId: categoryMap.pickles,
        stock: 40,
        images: ['/images/products/mixed-pickle.jpg'],
        isActive: true,
      },
      {
        name: 'Lemon Pickle',
        slug: 'lemon-pickle',
        description:
          'Tangy lemon pickle made with fresh lemons, salt, and spices. A classic favorite.',
        price: 18000, // ₹180
        categoryId: categoryMap.pickles,
        stock: 60,
        images: ['/images/products/lemon-pickle.jpg'],
        isActive: true,
      },

      // Chutneys (3 products)
      {
        name: 'Mint Chutney',
        slug: 'mint-chutney',
        description:
          'Fresh mint chutney with coriander, green chilies, and lemon. Perfect for snacks and appetizers.',
        price: 15000, // ₹150
        categoryId: categoryMap.chutneys,
        stock: 35,
        images: ['/images/products/mint-chutney.jpg'],
        isActive: true,
      },
      {
        name: 'Tamarind Chutney',
        slug: 'tamarind-chutney',
        description:
          'Sweet and tangy tamarind chutney with jaggery and spices. Great with samosas and pakoras.',
        price: 16000, // ₹160
        categoryId: categoryMap.chutneys,
        stock: 30,
        images: ['/images/products/tamarind-chutney.jpg'],
        isActive: true,
      },
      {
        name: 'Tomato Chutney',
        slug: 'tomato-chutney',
        description: 'Spicy tomato chutney made with ripe tomatoes, garlic, and red chilies.',
        price: 14000, // ₹140
        categoryId: categoryMap.chutneys,
        stock: 45,
        images: ['/images/products/tomato-chutney.jpg'],
        isActive: true,
      },

      // Jams (3 products)
      {
        name: 'Strawberry Jam',
        slug: 'strawberry-jam',
        description:
          'Homemade strawberry jam made with fresh strawberries and natural sweeteners. No artificial preservatives.',
        price: 28000, // ₹280
        categoryId: categoryMap.jams,
        stock: 25,
        images: ['/images/products/strawberry-jam.jpg'],
        isActive: true,
      },
      {
        name: 'Mixed Fruit Jam',
        slug: 'mixed-fruit-jam',
        description:
          'A delicious blend of seasonal fruits in a sweet jam. Perfect for breakfast toast.',
        price: 30000, // ₹300
        categoryId: categoryMap.jams,
        stock: 20,
        images: ['/images/products/mixed-fruit-jam.jpg'],
        isActive: true,
      },
      {
        name: 'Orange Marmalade',
        slug: 'orange-marmalade',
        description: 'Classic orange marmalade with bits of orange peel. A breakfast favorite.',
        price: 32000, // ₹320
        categoryId: categoryMap.jams,
        stock: 18,
        images: ['/images/products/orange-marmalade.jpg'],
        isActive: true,
      },

      // Juices (3 products)
      {
        name: 'Gooseberry Juice',
        slug: 'gooseberry-juice',
        description: 'Fresh gooseberry juice rich in Vitamin C. Naturally tangy and healthy.',
        price: 12000, // ₹120
        categoryId: categoryMap.juices,
        stock: 55,
        images: ['/images/products/gooseberry-juice.jpg'],
        isActive: true,
      },
      {
        name: 'Apple Juice',
        slug: 'apple-juice',
        description:
          'Pure apple juice made from farm-fresh apples. No added sugar or preservatives.',
        price: 15000, // ₹150
        categoryId: categoryMap.juices,
        stock: 40,
        images: ['/images/products/apple-juice.jpg'],
        isActive: true,
      },
      {
        name: 'Mixed Fruit Juice',
        slug: 'mixed-fruit-juice',
        description: 'A refreshing blend of seasonal fruits. Packed with natural vitamins.',
        price: 18000, // ₹180
        categoryId: categoryMap.juices,
        stock: 35,
        images: ['/images/products/mixed-fruit-juice.jpg'],
        isActive: true,
      },

      // Candies (3 products)
      {
        name: 'Gooseberry Candy',
        slug: 'gooseberry-candy',
        description: 'Sweet and tangy gooseberry candies. A healthy treat for kids and adults.',
        price: 10000, // ₹100
        categoryId: categoryMap.candies,
        stock: 70,
        images: ['/images/products/gooseberry-candy.jpg'],
        isActive: true,
      },
      {
        name: 'Ginger Candy',
        slug: 'ginger-candy',
        description: 'Spicy ginger candies with natural ginger extract. Good for digestion.',
        price: 9000, // ₹90
        categoryId: categoryMap.candies,
        stock: 65,
        images: ['/images/products/ginger-candy.jpg'],
        isActive: true,
      },
      {
        name: 'Honey Lemon Candy',
        slug: 'honey-lemon-candy',
        description: 'Soothing honey lemon candies. Perfect for sore throats and colds.',
        price: 11000, // ₹110
        categoryId: categoryMap.candies,
        stock: 60,
        images: ['/images/products/honey-lemon-candy.jpg'],
        isActive: true,
      },

      // Spices (2 products)
      {
        name: 'Turmeric Powder',
        slug: 'turmeric-powder',
        description: 'Pure turmeric powder from organic farms. Rich in curcumin and antioxidants.',
        price: 8000, // ₹80
        categoryId: categoryMap.spices,
        stock: 80,
        images: ['/images/products/turmeric-powder.jpg'],
        isActive: true,
      },
      {
        name: 'Red Chili Powder',
        slug: 'red-chili-powder',
        description:
          'Premium quality red chili powder. Adds perfect heat and color to your dishes.',
        price: 7000, // ₹70
        categoryId: categoryMap.spices,
        stock: 90,
        images: ['/images/products/red-chili-powder.jpg'],
        isActive: true,
      },
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✓ Seeded ${insertedProducts.length} products`);

    // Seed admin user
    console.log('Seeding admin user...');

    // Hash password using scrypt (same format as Better Auth)
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync('admin123', salt, 32).toString('hex');
    const passwordHash = `${salt}:${derivedKey}`;

    const adminData = {
      email: 'admin@doonfarm.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
    };

    const insertedUsers = await db.insert(users).values(adminData).returning();
    const adminUser = insertedUsers[0];

    // Create account record for Better Auth credential login
    await db.insert(accounts).values({
      userId: adminUser.id,
      accountId: adminUser.id,
      providerId: 'credential',
      password: passwordHash,
    });

    console.log(`✓ Seeded admin user: ${adminUser.email}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@doonfarm.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Remember to change the admin password in production!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
