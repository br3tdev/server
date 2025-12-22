import 'module-alias/register';
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import type MessageResponse from "./interfaces/message-response.js";

import { prisma } from "../lib/db";
import api from "./api/index.js";
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "USSD api",
  });
});

app.get<object, unknown>("/health", async (req, res) => {
  const start = Date.now();

  let db = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch (_) {}

  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    db
  });
})

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
