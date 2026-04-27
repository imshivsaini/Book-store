import * as z from "zod";
import { ROLE } from "./config/constants.js";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(24),
});

export const cookiesSchema = z.object({
  accessToken: z.string(),
});

export const jwtPayloadSchema = z.object({
  id: z.uuid(),
  role: z.enum([ROLE.ADMIN, ROLE.USER]),
});
export const RegisterSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(ROLE).optional(),
});
export const createBookSchema = z.object({
  title: z.string().min(2),
  author: z.string().min(2),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  description: z.string().optional(),
});

export const querySchema = z.object({
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const OrderItemSchema = z.object({
  bookId: z.uuid({ message: "Invalid bookId" }),
  quantity: z.number().int().positive({ message: "Quantity must be > 0" })
});

export const CreateOrderSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, { message: "At least one item is required" }),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),

  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),

  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});
