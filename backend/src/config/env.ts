import dotenv from "dotenv";

dotenv.config();

const required = [
  "BASE_URL",
  "INFINITEPAY_HANDLE",
  "BOT_API_KEY",
  "PLUGIN_API_KEY",
  "INFINITEPAY_REDIRECT_URL"
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  baseUrl: process.env.BASE_URL as string,
  steamApiKey: process.env.STEAM_API_KEY ?? "",
  infinitepayHandle: process.env.INFINITEPAY_HANDLE as string,
  infinitepayWebhookSecret: process.env.INFINITEPAY_WEBHOOK_SECRET ?? "",
  vipPrice: Number(process.env.VIP_PRICE ?? "19.9"),
  vipPlusPrice: Number(process.env.VIP_PLUS_PRICE ?? "39.9"),
  botApiKey: process.env.BOT_API_KEY as string,
  pluginApiKey: process.env.PLUGIN_API_KEY as string,
  vipDurationDays: Number(process.env.VIP_DURATION_DAYS ?? "30"),
  vipPlusDurationDays: Number(process.env.VIP_PLUS_DURATION_DAYS ?? "30"),
  expirationCheckIntervalMs: Number(process.env.EXPIRATION_CHECK_INTERVAL_MS ?? "60000"),
  redirectUrl: process.env.INFINITEPAY_REDIRECT_URL as string
};
