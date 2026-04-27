import type { z } from "zod";
import { env } from "../config/env.js";
import prisma from "../config/prisma.js";

export const createBook = async (data: any) => {
  return prisma.book.create({ data });
};

export const getBooks = async (query: any) => {
  const { search, minPrice, maxPrice, page = "1", limit = "10" } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { author: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      minPrice ? { price: { gte: Number(minPrice) } } : {},
      maxPrice ? { price: { lte: Number(maxPrice) } } : {},
    ],
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    data: books,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
    },
  };
};
export const getBookById = async (id: string) => {
  return prisma.book.findUnique({ where: { id } });
};

export const updateBook = async (id: string, data: any) => {
  return prisma.book.update({
    where: { id },
    data,
  });
};

export const deleteBook = async (id: string) => {
  return prisma.book.delete({ where: { id } });
};

