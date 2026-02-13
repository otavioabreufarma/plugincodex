import { SupportedServerId, VipRecord } from "../types";
import { enqueueBotEvent } from "./eventQueueService";
import { readServerRecords, writeServerRecords } from "../utils/fileDb";
import { env } from "../config/env";

export function getOrCreateLinkRecord(serverId: SupportedServerId, discordId: string, steamId: string): VipRecord {
  const records = readServerRecords(serverId);
  const found = records.find((record) => record.discordId === discordId);

  if (found) {
    found.steamId = steamId;
    writeServerRecords(serverId, records);
    return found;
  }

  const created: VipRecord = {
    discordId,
    steamId,
    vipType: null,
    vipExpiresAt: null,
    serverId
  };

  records.push(created);
  writeServerRecords(serverId, records);
  return created;
}

export function applyVip(serverId: SupportedServerId, discordId: string, vipType: "vip" | "vip+"): VipRecord {
  const records = readServerRecords(serverId);
  const record = records.find((item) => item.discordId === discordId);
  if (!record) {
    throw new Error("Discord account not linked to Steam on this server.");
  }

  const days = vipType === "vip" ? env.vipDurationDays : env.vipPlusDurationDays;
  const now = new Date();
  const currentExpiry = record.vipExpiresAt ? new Date(record.vipExpiresAt) : now;
  const baseDate = currentExpiry > now ? currentExpiry : now;
  baseDate.setDate(baseDate.getDate() + days);

  record.vipType = vipType;
  record.vipExpiresAt = baseDate.toISOString();
  writeServerRecords(serverId, records);

  enqueueBotEvent({
    type: "PAYMENT_CONFIRMED",
    discordId,
    serverId,
    vipType
  });

  return record;
}

export function removeVip(serverId: SupportedServerId, discordId: string): VipRecord {
  const records = readServerRecords(serverId);
  const record = records.find((item) => item.discordId === discordId);
  if (!record) throw new Error("Record not found.");

  record.vipType = null;
  record.vipExpiresAt = null;
  writeServerRecords(serverId, records);
  return record;
}

export function getVipStatus(serverId: SupportedServerId, discordId: string): VipRecord | undefined {
  return readServerRecords(serverId).find((record) => record.discordId === discordId);
}

export function runExpirationCheck(): void {
  const now = new Date();
  (["server1", "server2"] as SupportedServerId[]).forEach((serverId) => {
    const records = readServerRecords(serverId);
    let changed = false;

    records.forEach((record) => {
      if (record.vipType && record.vipExpiresAt && new Date(record.vipExpiresAt) <= now) {
        const expiredType = record.vipType;
        record.vipType = null;
        record.vipExpiresAt = null;
        changed = true;

        enqueueBotEvent({
          type: "VIP_EXPIRED",
          discordId: record.discordId,
          serverId,
          vipType: expiredType
        });
      }
    });

    if (changed) writeServerRecords(serverId, records);
  });
}
