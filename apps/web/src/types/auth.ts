import { z } from "zod";

export const usernameSchema = z.string().min(3, "Username should at least be 3 characters.");
export const emailSchema = z.string().email().min(2, "Email should at least be 2 characters.");
export const passwordSchema = z.string().min(8, "Password should at least be 8 characters.");
export const identifierSchema = z.string().min(3, "Identifier should at least be 3 characters.");

export const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

export interface OAuth2Tokens {
  tokenType?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scopes?: string[];
  idToken?: string;
}