/* eslint-disable @typescript-eslint/no-explicit-any */

import db, { DBInstance } from "@/lib/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, emailOTP, genericOAuth, organization } from "better-auth/plugins"
import * as schema from '@/lib/db/schema/index'
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env/server";
import { generateId } from "better-auth"

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
    sendResetPassword: async ({ url, user }) => {
      try {
        const response = await fetch(
          `${env.APP_URL}/api/auth/forget/password`,
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
  user: {
    additionalFields: {
      banner: {
        type: 'string',
        required: false,
      },
      isAnonymous: {
        type: 'boolean',
        required: false
      },
    }
  },
  account: {
    accountLinking: {
      enabled: true, 
      trustedProviders: ['anilist'],
      allowDifferentEmails: true,
      allowUnlinkingAll: true,
    },
  },
  plugins: [
    organization(),
    anonymous({
      generateName: () => {
        const randomSuffix = Math.random().toString(36).substring(2, 8); // generates random alphanumeric string
        return `meloner-${randomSuffix}`;
      },      
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        // Define a generic migration function for tables with unique userId constraint
        const migrateUniqueUserTable = async (
          table: any,
          tableName: string,
          dbInstance: DBInstance
        ) => {
          // Get anonymous user's settings
          const anonymousSettings = await dbInstance.select().from(table)
            .where(eq(table.userId, anonymousUser.user.id));
    
          // Check if anonymous user has settings
          if (anonymousSettings.length > 0) {
            // Get new user's settings
            const userSettings = await dbInstance.select().from(table)
              .where(eq(table.userId, newUser.user.id));
    
            // If new user doesn't have settings yet, create them based on anonymous user's settings
            if (userSettings.length === 0) {
              // Create a new record without the id, userId, and timestamps
              const newSettings = { ...anonymousSettings[0] };
              
              // Generate a new UUID for the ID
              newSettings.id = generateId();
              
              // Update userId to the new user
              newSettings.userId = newUser.user.id;
              
              // Update timestamps
              newSettings.createdAt = new Date();
              newSettings.updatedAt = new Date();
              
              // Insert new settings
              await dbInstance.insert(table).values(newSettings);
            }
          }
        };
    
        // Define a generic migration function for tables with non-unique userId constraint
        const migrateNonUniqueUserTable = async (
          table: any,
          tableName: string,
          dbInstance: DBInstance
        ) => {
          // Get anonymous user's records
          const anonymousRecords = await dbInstance.select().from(table)
            .where(eq(table.userId, anonymousUser.user.id));
    
          // Migrate each record
          for (const record of anonymousRecords) {
            // Create a new record with a new ID and the new userId
            const newRecord = { ...record };
            newRecord.id = generateId();
            newRecord.userId = newUser.user.id;
            newRecord.createdAt = new Date();
            newRecord.updatedAt = new Date();
            
            // Insert the new record
            await dbInstance.insert(table).values(newRecord);
          }
          
          // if (anonymousRecords.length > 0) {
          //   console.log(`Migrated ${anonymousRecords.length} ${tableName} from anonymous user ${anonymousUser.user.id} to new user ${newUser.user.id}`);
          // }
        };
    
        // Migrate all tables
        try {
          // Start a transaction to ensure all migrations succeed or fail together
          await db.transaction(async (tx) => {
            // Migrate tables with unique userId constraint
            await migrateUniqueUserTable(schema.generalSettings, 'general settings', tx);
            await migrateUniqueUserTable(schema.subtitleSettings, 'subtitle settings', tx);
            await migrateUniqueUserTable(schema.playerSettings, 'player settings', tx);
            
            // Migrate tables with non-unique userId constraint
            await migrateNonUniqueUserTable(schema.subtitleStyles, 'subtitle styles', tx);
            await migrateNonUniqueUserTable(schema.ankiPreset, 'anki presets', tx);
          });
          
        } catch (error) {
          console.error(`Error migrating settings: ${error instanceof Error ? error.message : "Failed to migrate tables"}`);
        }
      }
    }),
    emailOTP({ 
      async sendVerificationOTP({ email, otp, type }) { 
        if (type === "email-verification") {
          try {
            const response = await fetch(
              `${env.APP_URL}/api/auth/otp`,
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
          clientId: env.ANILIST_ID!,
          clientSecret: env.ANILIST_SECRET!,
          authorizationUrl: "https://anilist.co/api/v2/oauth/authorize",
          tokenUrl: "https://anilist.co/api/v2/oauth/token",
          redirectURI: env.ANILIST_REDIRECT_URL!,
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
        // {
        //   providerId: "myanimelist",
        //   clientId: env.MYANIMELIST_ID!,
        //   clientSecret: env.MYANIMELIST_SECRET!,
        //   authorizationUrl: "https://myanimelist.net/v1/oauth2/authorize",
        //   tokenUrl: "https://myanimelist.net/v1/oauth2/token",
        //   redirectURI: env.MYANIMELIST_REDIRECT_URL!,
        //   pkce: true,
        // }
      ]
    }),
    nextCookies()
  ]
})