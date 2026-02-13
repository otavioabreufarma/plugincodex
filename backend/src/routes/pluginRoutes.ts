import { Router } from "express";
import { pluginApiKeyAuth } from "../middleware/apiKeyAuth";
import { applyVip, getVipStatus, removeVip } from "../services/vipService";
import { SupportedServerId } from "../types";

export const pluginRoutes = Router();
pluginRoutes.use(pluginApiKeyAuth);

pluginRoutes.post("/vip/apply", (req, res) => {
  const { serverId, discordId, vipType } = req.body as {
    serverId: SupportedServerId;
    discordId: string;
    vipType: "vip" | "vip+";
  };

  if (!discordId || !["server1", "server2"].includes(serverId) || !["vip", "vip+"].includes(vipType)) {
    res.status(400).json({ error: "serverId, discordId and vipType are required." });
    return;
  }

  try {
    const record = applyVip(serverId, discordId, vipType);
    res.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply VIP.";
    res.status(400).json({ error: message });
  }
});

pluginRoutes.post("/vip/remove", (req, res) => {
  const { serverId, discordId } = req.body as { serverId: SupportedServerId; discordId: string };

  if (!discordId || !["server1", "server2"].includes(serverId)) {
    res.status(400).json({ error: "serverId and discordId are required." });
    return;
  }

  try {
    const record = removeVip(serverId, discordId);
    res.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove VIP.";
    res.status(400).json({ error: message });
  }
});

pluginRoutes.get("/vip/status", (req, res) => {
  const serverId = String(req.query.serverId ?? "") as SupportedServerId;
  const discordId = String(req.query.discordId ?? "");

  if (!discordId || !["server1", "server2"].includes(serverId)) {
    res.status(400).json({ error: "serverId and discordId are required." });
    return;
  }

  const record = getVipStatus(serverId, discordId);
  if (!record) {
    res.status(404).json({ error: "Record not found." });
    return;
  }

  res.json({ record });
});
