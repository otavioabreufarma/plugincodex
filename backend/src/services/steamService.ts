import { SupportedServerId } from "../types";

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

export function buildSteamLoginUrl(baseUrl: string, discordId: string, serverId: SupportedServerId): string {
  const callbackUrl = `${baseUrl}/auth/steam/callback`;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${callbackUrl}?discordId=${encodeURIComponent(discordId)}&serverId=${encodeURIComponent(serverId)}`,
    "openid.realm": baseUrl,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });

  return `${STEAM_OPENID}?${params.toString()}`;
}

export function extractSteamIdFromClaimedId(claimedId: string): string {
  const match = claimedId.match(/\/id\/(\d+)$/) || claimedId.match(/\/openid\/id\/(\d+)$/);
  if (!match) {
    throw new Error("Invalid claimed id response from Steam.");
  }
  return match[1];
}
