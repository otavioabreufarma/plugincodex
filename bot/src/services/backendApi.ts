import axios from "axios";
import { env } from "../config/env";
import { BotEvent, SupportedServerId } from "../types";

const api = axios.create({
  baseURL: env.backendUrl,
  timeout: 15000,
  headers: {
    "x-api-key": env.botApiKey,
    "Content-Type": "application/json"
  }
});

export async function requestSteamLink(discordId: string, serverId: SupportedServerId): Promise<string> {
  const res = await api.get("/auth/steam/link", { params: { discordId, serverId } });
  return res.data.url as string;
}

export async function requestCheckoutLink(discordId: string, serverId: SupportedServerId, vipType: "vip" | "vip+"): Promise<string> {
  const res = await api.post("/payments/checkout-link", { discordId, serverId, vipType });
  return res.data.checkoutUrl as string;
}

export async function fetchBotEvents(): Promise<BotEvent[]> {
  const res = await api.get("/bot/events");
  return res.data.events as BotEvent[];
}

export async function ackBotEvent(eventId: string): Promise<void> {
  await api.post(`/bot/events/${eventId}/ack`);
}
