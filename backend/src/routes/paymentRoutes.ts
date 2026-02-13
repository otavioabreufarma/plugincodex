import { Router } from "express";
import { createCheckoutLink, processApprovedPayment } from "../services/paymentService";
import { SupportedServerId } from "../types";
import { env } from "../config/env";

export const paymentRoutes = Router();

paymentRoutes.post("/checkout-link", async (req, res) => {
  const { discordId, serverId, vipType } = req.body as {
    discordId: string;
    serverId: SupportedServerId;
    vipType: "vip" | "vip+";
  };

  if (!discordId || !["server1", "server2"].includes(serverId) || !["vip", "vip+"].includes(vipType)) {
    res.status(400).json({ error: "discordId, serverId(server1|server2) and vipType(vip|vip+) are required." });
    return;
  }

  try {
    const result = await createCheckoutLink({ discordId, serverId, vipType });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout link.";
    res.status(500).json({ error: message });
  }
});

paymentRoutes.post("/webhooks/infinitepay", (req, res) => {
  const secretHeader = req.header("x-webhook-secret") ?? "";
  if (env.infinitepayWebhookSecret && secretHeader !== env.infinitepayWebhookSecret) {
    res.status(401).json({ error: "Invalid webhook secret." });
    return;
  }

  const orderNsu = String(req.body?.order_nsu ?? "");
  const transactionNsu = String(req.body?.transaction_nsu ?? "");
  const status = String(req.body?.status ?? "").toLowerCase();

  if (!orderNsu || !transactionNsu) {
    res.status(400).json({ error: "order_nsu and transaction_nsu are required." });
    return;
  }

  if (!["approved", "paid", "completed"].includes(status)) {
    res.status(200).json({ message: "Webhook ignored for non-approved status." });
    return;
  }

  try {
    processApprovedPayment(orderNsu, transactionNsu);
    res.json({ message: "Payment confirmed and VIP applied." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    res.status(400).json({ error: message });
  }
});
