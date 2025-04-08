import db from "@/lib/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, genericOAuth } from "better-auth/plugins"
import * as schema from '@/lib/db/schema/index'

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
  plugins: [
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
    })
  ]
})