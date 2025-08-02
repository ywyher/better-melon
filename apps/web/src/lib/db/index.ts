import 'dotenv/config';
import { env } from '@/lib/env/server';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import * as schema from "./schema"; // getting the schema

const db = drizzle(env.DATABASE_URL!, {
  schema,
  logger: true
});

export default db;
export type DBInstance = PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>