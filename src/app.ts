import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import {env} from "./config/env.js"
import prisma from "./config/prisma.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import authRouter from "./route/auth.route.js";
import bookRoute from "./route/book.route.js";
const app = express();
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(authMiddleware);
app.use(express.json());
app.use("/v1/auth",authRouter);
app.use("/v1/product",bookRoute);
const server = app.listen(env.PORT, async () => {
  console.log(`Server is running on port ${env.PORT}`);
});
const gracefulShutdown = async (signal: "SIGTERM" | "SIGINT") => {
  console.log(`Received ${signal}. Starting graeful shutdown...`);

  server.close(async (err) => {
    if (err) {
      console.error("Error during server shutdown", err);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();

      console.log("Prisma Client disconnected");
      console.log("Server shutdown complete");

      process.exit(0);
    } catch (e) {
      console.error("Error during server shutdown", e);

      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
