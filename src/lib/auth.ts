import db from "@/lib/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, emailOTP, genericOAuth } from "better-auth/plugins"
import * as schema from '@/lib/db/schema/index'
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: { 
    enabled: true, 
    autoSignIn: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ url, user }, request) => {
      try {
        const response = await fetch(
          `${process.env.APP_URL}/api/auth/forget/password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              url: url,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        return;
      } catch (error) {
        console.error("Failed to send reset password url:", error);
        throw error;
      }
    },
  },
  account: {
    accountLinking: {
        enabled: true, 
        trustedProviders: ['anilist'],
        allowDifferentEmails: true,
        allowUnlinkingAll: true,
    }
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
          // Fetch anonymous user data
          const anonymousAnkiPresets = await db.select().from(schema.ankiPreset)
            .where(eq(schema.ankiPreset.userId, anonymousUser.user.id));
          const anonymousSubtitleSettings = await db.select().from(schema.subtitleSettings)
            .where(eq(schema.subtitleSettings.userId, anonymousUser.user.id));
          
          // Fetch existing user data
          const userAnkiPresets = await db.select().from(schema.ankiPreset)
            .where(eq(schema.ankiPreset.userId, newUser.user.id));
          const userSubtitleSettings = await db.select().from(schema.subtitleSettings)
            .where(eq(schema.subtitleSettings.userId, newUser.user.id));
          
          // Handle ankiPresets migration
          if (anonymousAnkiPresets.length > 0) {
            // Check if user has a default preset
            const userHasDefaultPreset = userAnkiPresets.some(preset => preset.isDefault);
            
            for (const anonPreset of anonymousAnkiPresets) {
              // Find if a preset with the same name exists
              const duplicatePreset = userAnkiPresets.find(p => p.name === anonPreset.name);
              
              if (!duplicatePreset) {
                // No duplicate, migrate this preset
                // If this is a default preset and user already has one, unmark it as default
                if (anonPreset.isDefault && userHasDefaultPreset) {
                  await db.update(schema.ankiPreset)
                    .set({ 
                      userId: newUser.user.id,
                      isDefault: false 
                    })
                    .where(eq(schema.ankiPreset.id, anonPreset.id));
                } else {
                  await db.update(schema.ankiPreset)
                    .set({ userId: newUser.user.id })
                    .where(eq(schema.ankiPreset.id, anonPreset.id));
                }
              }
            }
          }
          
          // Handle subtitleSettings migration
          if (anonymousSubtitleSettings.length > 0) {
            for (const anonSetting of anonymousSubtitleSettings) {
              // Find if user has settings for this transcription type and anime (or global)
              const duplicateSetting = userSubtitleSettings.find(s => 
                s.transcription === anonSetting.transcription && 
                ((anonSetting.isGlobal && s.isGlobal) || 
                 (anonSetting.animeId === s.animeId && anonSetting.animeId !== null))
              );
              
              if (!duplicateSetting) {
                // No conflict, migrate this setting
                await db.update(schema.subtitleSettings)
                  .set({ userId: newUser.user.id })
                  .where(eq(schema.subtitleSettings.id, anonSetting.id));
              }
            }
          }
      }
    }),
    emailOTP({ 
      async sendVerificationOTP({ email, otp, type }) { 
        if (type === "email-verification") {
          try {
            const response = await fetch(
              `${process.env.APP_URL}/api/auth/otp`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
              },
            );

            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            return data;
          } catch (error) {
            console.error("Failed to send OTP:", error);
            throw error;
          }
        }
      }, 
      otpLength: 6,
    }),
    genericOAuth({
      config: [
        {
          providerId: "anilist",
          clientId: process.env.ANILIST_ID!,
          clientSecret: process.env.ANILIST_SECRET!,
          authorizationUrl: "https://anilist.co/api/v2/oauth/authorize",
          tokenUrl: "https://anilist.co/api/v2/oauth/token",
          redirectURI: process.env.ANILIST_REDIRECT_URL!,
          getUserInfo: async (tokens) => {
            const { accessToken } = tokens;
            // AniList uses GraphQL API for user data
            const query = `
              query {
                Viewer {
                  id
                  name
                  createdAt
                  updatedAt
                  avatar {
                    large
                  }
                }
              }
            `;
            
            try {
              const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ query })
              });
              
              const data = await response.json();
              const user = data.data.Viewer;
              const now = new Date()

              return {
                id: String(user.id),
                name: user.name,
                email: `${user.name.toLowerCase().replace(/\s+/g, '-')}@anilist.co`,
                emailVerified: false,
                createdAt: now,
                updatedAt: now,
                image: user.avatar?.large || null
              };
            } catch (error) {
              console.error("Error fetching AniList user:", error);
              return null;
            }
          }
        },
      ]
    }),
    nextCookies()
  ]
})