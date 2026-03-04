import { z } from "zod";

const url = z.string().url({ message: "Must be a valid URL" });

const envSchema = z.object({
  DATABASE_URL: url,
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: url,
  NEXT_PUBLIC_BASE_URL: url.optional(),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  UPSTASH_REDIS_REST_URL: url,
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  UPSTASH_VECTOR_REST_URL: url.optional(),
  UPSTASH_VECTOR_REST_TOKEN: z.string().min(1).optional(),

  META_APP_ID: z.string().min(1).optional(),
  META_APP_SECRET: z.string().min(1).optional(),
  TWITTER_CLIENT_ID: z.string().min(1).optional(),
  TWITTER_CLIENT_SECRET: z.string().min(1).optional(),
  LINKEDIN_CLIENT_ID: z.string().min(1).optional(),
  LINKEDIN_CLIENT_SECRET: z.string().min(1).optional(),

  EMAIL_SERVER: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  GA4_MEASUREMENT_ID: z.string().min(1).optional(),
  GA4_API_SECRET: z.string().min(1).optional(),
  BITLY_TOKEN: z.string().min(1).optional(),
  BRAVE_SEARCH_API_KEY: z.string().min(1).optional()
}).superRefine((values, ctx) => {
  if (!values.OPENAI_API_KEY && !values.ANTHROPIC_API_KEY) {
    ctx.addIssue({
      code: "custom",
      message: "Set either OPENAI_API_KEY or ANTHROPIC_API_KEY",
      path: ["OPENAI_API_KEY"]
    });
  }

  const oauthPairs: Array<[keyof typeof values, keyof typeof values]> = [
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    ["META_APP_ID", "META_APP_SECRET"],
    ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
    ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"]
  ];

  for (const [idKey, secretKey] of oauthPairs) {
    const id = values[idKey];
    const secret = values[secretKey];
    if ((id && !secret) || (!id && secret)) {
      ctx.addIssue({
        code: "custom",
        message: `${String(idKey)} and ${String(secretKey)} must both be provided`,
        path: [id ? secretKey : idKey]
      });
    }
  }
});

export const env = envSchema.parse(process.env);
