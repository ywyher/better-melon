import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
			
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull().unique(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image').default("pfp.png"),
  isAnonymous: boolean('isAnonymous').default(false),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const userRelations = relations(user, ({ many }) => ({
  user: many(ankiPreset)
}))

export const ankiPreset = pgTable('anki_preset', {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  deck: text('deck').notNull(),
  model: text('model').notNull(),
  fields: jsonb(),
  isDefault: boolean('is_default').default(false),
  isGui: boolean('is_gui').default(false),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
})

export const ankiPresetRelations = relations(ankiPreset, ({ one }) => ({
  user: one(user, {
    fields: [ankiPreset.userId],
    references: [user.id]
  })
}))

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export type User = InferSelectModel<typeof user>;
export type AnkiPreset = Omit<InferSelectModel<typeof ankiPreset>, 'fields'> & {
  fields: Record<string, string>;
};