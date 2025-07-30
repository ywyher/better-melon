import { t } from 'elysia';
import { TSchema } from '@sinclair/typebox';

export function createMeilisearchIndexSchema<T extends TSchema>(hitSchema: T) {
  return t.Object({
    indexUid: t.String(),
    hits: t.Array(hitSchema),
    query: t.String(),
    processingTimeMs: t.Number(),
    limit: t.Number(),
    offset: t.Number(),
    estimatedTotalHits: t.Number(),
  });
}