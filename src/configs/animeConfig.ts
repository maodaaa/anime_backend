import { z } from "zod";

// Environment variable validation schema
const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default("3001")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: "PORT must be a valid port number between 1 and 65535",
    }),

  OTAKUDESU_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("https://otakudesu.cloud"),

  SAMEHADAKU_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("http://v1.samehadaku.how/"),

  RESPONSE_HREF: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),

  RESPONSE_SOURCE_URL: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
});

// Configuration schema for type safety
const configSchema = z.object({
  PORT: z.number().int().positive(),
  baseUrl: z.object({
    otakudesu: z.string().url(),
    samehadaku: z.string().url(),
  }),
  response: z.object({
    href: z.boolean(),
    sourceUrl: z.boolean(),
  }),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// Validate environment variables at startup
function validateEnvironment() {
  try {
    // Use Bun.env for Bun runtime, fallback to process.env for compatibility
    const env = typeof Bun !== "undefined" ? Bun.env : process.env;

    const validatedEnv = envSchema.parse(env);

    console.log("✅ Environment variables validated successfully");

    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\nPlease check your environment variables and try again.");
    } else {
      console.error("❌ Unexpected error during environment validation:", error);
    }

    // Exit the process if validation fails
    process.exit(1);
  }
}

// Validate and get environment variables
const env = validateEnvironment();

// Create the configuration object
const animeConfig = configSchema.parse({
  PORT: env.PORT,
  baseUrl: {
    otakudesu: env.OTAKUDESU_BASE_URL,
    samehadaku: env.SAMEHADAKU_BASE_URL,
  },
  response: {
    /* ngebalikin respon href biar gampang nyari ref idnya contoh {"href": "/otakudesu/anime/animeId"} value = false akan mengurangi ukuran response <> up to 30% */
    href: env.RESPONSE_HREF,
    /* ngebalikin respon url sumber contoh {"otakudesuUrl": "https://otakudesu.cloud/anime/animeId"}                          ""                              40% */
    sourceUrl: env.RESPONSE_SOURCE_URL,
  },
  NODE_ENV: env.NODE_ENV,
});

// Export types for use in other modules
export type AnimeConfig = z.infer<typeof configSchema>;
export type EnvConfig = z.infer<typeof envSchema>;

// Log configuration in development mode
if (animeConfig.NODE_ENV === "development") {
  console.log("📋 Configuration loaded:");
  console.log(`  - PORT: ${animeConfig.PORT}`);
  console.log(`  - Otakudesu URL: ${animeConfig.baseUrl.otakudesu}`);
  console.log(`  - Samehadaku URL: ${animeConfig.baseUrl.samehadaku}`);
  console.log(`  - Response href: ${animeConfig.response.href}`);
  console.log(`  - Response sourceUrl: ${animeConfig.response.sourceUrl}`);
  console.log(`  - Environment: ${animeConfig.NODE_ENV}`);
}

export default animeConfig;
