import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]).default("development"),
	DATABASE_URL: z.url("Invalid database URL format"),
	PORT: z.coerce.number().int().positive().default(3000),
	JWT_SECRET: z.string(),
	RAZORPAY_KEY_ID:z.string(),
	RAZORPAY_KEY_SECRET:z.string()

});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error(" Invalid environment variables:");
	console.error(z.prettifyError(_env.error));
	process.exit(1);
}

export const env = _env.data;
