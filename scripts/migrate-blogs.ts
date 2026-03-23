import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { db } from '../lib/db';
import { blogs } from '../lib/db/schema';

async function migrateBlogs() {
  console.log('Starting blog migration...');
  const contentDirectory = path.join(process.cwd(), 'content/blog');

  if (!fs.existsSync(contentDirectory)) {
    console.log('No blog content directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(contentDirectory);
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

  console.log(`Found ${mdxFiles.length} MDX files to migrate.`);

  for (const file of mdxFiles) {
    const slug = file.replace(/\.mdx$/, '');
    const filePath = path.join(contentDirectory, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    console.log(`Migrating: ${slug}`);

    try {
      await db
        .insert(blogs)
        .values({
          title: data.title || slug,
          slug,
          excerpt: data.excerpt || '',
          content,
          featuredImage: data.featuredImage || '',
          author: data.author || null,
          category: data.category || null,
          createdAt: data.date ? new Date(data.date) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: blogs.slug,
          set: {
            title: data.title || slug,
            excerpt: data.excerpt || '',
            content,
            featuredImage: data.featuredImage || '',
            author: data.author || null,
            category: data.category || null,
          },
        });
      console.log(`Successfully migrated ${slug}`);
    } catch (error) {
      console.error(`Error migrating ${slug}:`, error);
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrateBlogs();
