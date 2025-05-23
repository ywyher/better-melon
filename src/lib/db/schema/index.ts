import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
			
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

export const userRelations = relations(user, ({ many, one }) => ({
  ankiPresets: many(ankiPreset),
  subtitleSettings: one(subtitleSettings, {
    fields: [user.id],
    references: [subtitleSettings.userId]
  }),
  subtitleStyles: one(subtitleStyles, {
    fields: [user.id],
    references: [subtitleStyles.userId]
  }),
  playerSettings: one(playerSettings, {
    fields: [user.id],
    references: [playerSettings.userId]
  }),
  generalSettings: one(generalSettings, {
    fields: [user.id],
    references: [generalSettings.userId]
  }),
}));

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


export const syncStrategyEnum = pgEnum("sync_strategy", [
  "always",
  "never",
  "ask"
]);

export const screenshotFormatEnum = pgEnum('screenshot_format', ['png', 'jpeg', 'webp']);

export const generalSettings = pgTable("general_settings", {
  id: text("id").primaryKey(),

  hideSpoilers: boolean('hide_spoilers').notNull().default(false),
  syncPlayerSettings: syncStrategyEnum('sync_player_settings').default('ask').notNull(),

  screenshotNamingDialog: boolean('screenshotNamingDialog').notNull().default(true),
  screenshotNamingPattern: text('screenshotNamingPattern').notNull().default('better_melon_{title}_{counter}_{random}'),
  screenshotFormat: screenshotFormatEnum('screenshot_format').notNull().default('png'),

  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const generalSettingsRelations = relations(generalSettings, ({ one }) => ({
  user: one(user, {
    fields: [generalSettings.userId],
    references: [user.id]
  })
}))

export const subtitleFormatEnum = pgEnum("subtitle_format", [
  "srt",
  "vtt",
  "ass"
]);

export const definitionTriggerEnum = pgEnum("definition_trigger", [
  'click',
  'hover'
])

export const subtitleSettings = pgTable("subtitle_settings", {
  id: text("id").primaryKey(),
  
  preferredFormat: subtitleFormatEnum('preferred_format'),
  matchPattern: text("match_pattern"), // fileNameMatchPattern
  transcriptionOrder: text('transcription_order').array(),
  // .default(["hiragana","katakana","romaji","japanese","english"])

  definitionTrigger: definitionTriggerEnum('definition_trigger').notNull().default('click'),

  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const subtitleSettingsRelations = relations(subtitleSettings, ({ one }) => ({
  user: one(user, {
    fields: [subtitleSettings.userId],
    references: [user.id]
  })
}))

export const textShadowEnum = pgEnum("text_shadow_enum", [
  "none",
  "drop-shadow",
  "raised",
  "depressed",
  "outline"
]);

export const subtitleTranscriptionEnum = pgEnum("subtitle_transcription", [
  "all",
  "japanese",
  "hiragana",
  "katakana",
  "romaji",
  "english",
]);

export const fontWeightEnum = pgEnum("font_weight_enum", [
  'normal',
  'bold',
  'bolder',
  'lighter'
])

export const subtitleStateEnum = pgEnum('subtitle_state', ['default', 'active']);

export const subtitleStyles = pgTable("subtitle_styles", {
  id: text("id").primaryKey(),
  
  fontSize: real("font_size").notNull().default(35),
  fontFamily: text("font_family").notNull().default('Arial'),
  fontWeight: fontWeightEnum('font_weight').notNull().default('bold'),
  
  textColor: text("text_color").notNull().default('#FFFFFF'),
  textOpacity: real("text_opacity").notNull().default(1),
  textShadow: textShadowEnum("text_shadow").notNull().default('outline'),

  backgroundColor: text("background_color").notNull().default('#000000'),
  backgroundOpacity: real("background_opacity").notNull().default(0.5),
  backgroundBlur: real("background_blur").notNull().default(0),
  backgroundRadius: real("background_radius").notNull().default(6),

  margin: real('margin').notNull().default(0.5),
  
  state: subtitleStateEnum('state').notNull().default('default'),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  transcription: subtitleTranscriptionEnum("transcription").notNull().default('all'),
  createdAt: timestamp("created_at").default(new Date()),
  updatedAt: timestamp("updated_at").default(new Date())
});

export const subtitleStylesRelations = relations(subtitleStyles, ({ one }) => ({
  user: one(user, {
    fields: [subtitleStyles.userId],
    references: [user.id]
  })
}))

export const transcriptionEnum = pgEnum("transcription_enum", [
  "japanese",
  "hiragana",
  "katakana",
  "romaji",
  "english",
])

export const playerSettings = pgTable("player_settings", {
  id: text("id").primaryKey(),

  autoPlay: boolean('auto_play').notNull().default(false),
  autoNext: boolean('auto_next').notNull().default(false),
  autoSkip: boolean('auto_skip').notNull().default(false),

  pauseOnCue: boolean('pause_on_cue').notNull().default(false),
  cuePauseDuration: real('cue_pause_duration'), // in seconds

  enabledTranscriptions: transcriptionEnum('enabled_transcriptions').array().notNull().default(["japanese", "english"]),

  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const playerSettingsRelations = relations(subtitleStyles, ({ one }) => ({
  user: one(user, {
    fields: [subtitleStyles.userId],
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
export type SubtitleStyles = InferSelectModel<typeof subtitleStyles>
export type SubtitleSettings = InferSelectModel<typeof subtitleSettings>
export type PlayerSettings = InferSelectModel<typeof playerSettings>
export type GeneralSettings = InferSelectModel<typeof generalSettings>