import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';
import * as schema from './schema';

// Create PostgreSQL connection with connection pooling
const client = postgres(env.DATABASE_URL, {
  max: 10, // Maximum 10 connections in the pool
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });
