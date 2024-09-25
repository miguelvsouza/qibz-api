import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number(),
  JWT_SECRET: z.string(),
  SENDGRID_API_KEY: z.string(),
  INTEGRA_CONTADOR_CONSUMER_KEY: z.string(),
  INTEGRA_CONTADOR_CONSUMER_SECRET: z.string(),
  CERT_PATH: z.string().url(),
  CERT_PASS: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error(
    "The following environment variables are invalid:",
    _env.error.flatten().fieldErrors
  )

  throw new Error("Invalid environment variables")
}

export const env = _env.data
