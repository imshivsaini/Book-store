import type { Request, Response } from "express";
import * as service from "../service/book.service.js";
import {
  createBookSchema,
  CreateOrderSchema,
  querySchema,
  verifyPaymentSchema,
} from "../validations.js";
import prisma from "../config/prisma.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import {env} from "../config/env.js"
import { process } from "zod/v4/core";
export const create = async (req: Request, res: Response) => {
  try {
    const parsed = createBookSchema.parse(req.body);

    const book = await service.createBook(parsed);

    res.status(201).json({ status: "success", data: book });
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const query = querySchema.parse(req.query);

    const result = await service.getBooks(query);

    res.json({ status: "success", ...result });
  } catch (e: any) {
    res.status(400).json({ status: "error", message: e.message });
  }
};

export const getOne = async (req: Request<{ id: string }>, res: Response) => {
  const book = await service.getBookById(req.params.id);

  if (!book) {
    return res.status(404).json({ status: "error", message: "Not found" });
  }

  res.json({ status: "success", data: book });
};

export const update = async (req: Request<{ id: string }>, res: Response) => {
  const book = await service.updateBook(req.params.id, req.body);

  res.json({ status: "success", data: book });
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
  await service.deleteBook(req.params.id);

  res.json({ status: "success", message: "Deleted" });
};

export const createOrder = async (req: Request, res: Response) => {
  try {

    const { data, success, error } = CreateOrderSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        status: "error",
        errors: error.flatten(),
      });
    }

    const userId = req.user.id;

    const bookIds = data.items.map((item) => item.bookId);

    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    if (books.length !== bookIds.length) {
      return res.status(404).json({
        status: "error",
        message: "One or more books not found",
      });
    }

    const priceMap = new Map(
      books.map((b: { id: string; price: number }) => [b.id, b.price])
    );

    let total = 0;

    const validatedItems = data.items.map((item) => {
      const actualPrice = priceMap.get(item.bookId);

      if (actualPrice === undefined) {
        throw new Error("Invalid book");
      }

      const itemTotal = Number(actualPrice) * item.quantity;
      total += itemTotal;

      return {
        bookId: item.bookId,
        quantity: item.quantity,
        price: actualPrice,
      };
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: validatedItems,
        },
      },
      include: {
        items: true,
      },
    });
    const razorpay_order_id  = razorpayOrder.id;
const razorpay_payment_id = "pay_test123";
const secret = env.RAZORPAY_KEY_SECRET;
const body = razorpay_order_id + "|" + razorpay_payment_id;

const signature = crypto
  .createHmac("sha256", secret)
  .update(body)
  .digest("hex");

console.log(signature);

    return res.status(200).json({
      status: "success",
      data: razorpayOrder,
      signature
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Failed to create order",
    });
  }
  
};

export const verifyOrder = async (req: Request, res: Response) => {
  
  try {
    const { data, success, error } = verifyPaymentSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        status: "error",
        errors: error.flatten(),
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        status: "error",
        message: "Invalid signature",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    if (order.status === "PAID") {
      return res.status(200).json({
        status: "success",
        message: "Order already verified",
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Failed to verify payment",
    });
  }
};