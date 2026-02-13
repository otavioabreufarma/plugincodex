import { Router } from "express";
import { env } from "../config/env";
import { buildSteamLoginUrl, extractSteamIdFromClaimedId } from "../services/steamService";
import { getOrCreateLinkRecord } from "../services/vipService";
import { SupportedServerId } from "../types";

export const authRoutes = Router();

authRoutes.get("/steam/link", (req, res) => {
  const discordId = String(req.query.discordId ?? "");
  const serverId = String(req.query.serverId ?? "") as SupportedServerId;
  if (!discordId || !["server1", "server2"].includes(serverId)) {
    res.status(400).json({ error: "discordId and valid serverId are required." });
    return;
  }

  const url = buildSteamLoginUrl(env.baseUrl, discordId, serverId);
  res.json({ url });
});

authRoutes.get("/steam/callback", (req, res) => {
  const claimedId = String(req.query["openid.claimed_id"] ?? "");
  const discordId = String(req.query.discordId ?? "");
  const serverId = String(req.query.serverId ?? "") as SupportedServerId;

  if (!claimedId || !discordId || !["server1", "server2"].includes(serverId)) {
    res.status(400).send("Invalid callback payload.");
    return;
  }

  try {
    const steamId = extractSteamIdFromClaimedId(claimedId);
    getOrCreateLinkRecord(serverId, discordId, steamId);
    res.send("Steam account linked successfully. You can return to Discord.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Steam callback failed.";
    res.status(400).send(message);
  }
});
