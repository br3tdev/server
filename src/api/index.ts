import express from "express";

import { prisma } from "../../lib/db"

import type MessageResponse from "../interfaces/message-response.js";

import emojis from "./emojis.js";

const router = express.Router();

// router.get<object, MessageResponse>("/", (req, res) => {
//   res.json({
//     message: "API - 👋🌎🌍🌏",
//   });
// });

router.get("/", async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: {
      idNumber: "32518496"
    }
  })

  res.json(customer)
})

router.use("/emojis", emojis);

export default router;
