import fs from "node:fs";
import path from "node:path";
import { PendingBotEvent, PaymentOrder, SupportedServerId, VipRecord } from "../types";

const root = path.resolve(__dirname, "..");
const dataDir = path.resolve(root, "data");
const eventsDir = path.resolve(root, "events");

const serverPaths: Record<SupportedServerId, string> = {
  server1: path.join(dataDir, "server1.json"),
  server2: path.join(dataDir, "server2.json")
};

const paymentOrdersPath = path.join(dataDir, "payment_orders.json");
const pendingEventsPath = path.join(eventsDir, "pending_bot_events.json");

function ensureFile<T>(filePath: string, defaultValue: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
  }
}

export function initializeStorage(): void {
  ensureFile(serverPaths.server1, [] as VipRecord[]);
  ensureFile(serverPaths.server2, [] as VipRecord[]);
  ensureFile(paymentOrdersPath, [] as PaymentOrder[]);
  ensureFile(pendingEventsPath, [] as PendingBotEvent[]);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJson<T>(filePath: string, payload: T): void {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
}

export function readServerRecords(serverId: SupportedServerId): VipRecord[] {
  return readJson<VipRecord[]>(serverPaths[serverId]);
}

export function writeServerRecords(serverId: SupportedServerId, records: VipRecord[]): void {
  writeJson(serverPaths[serverId], records);
}

export function readPaymentOrders(): PaymentOrder[] {
  return readJson<PaymentOrder[]>(paymentOrdersPath);
}

export function writePaymentOrders(orders: PaymentOrder[]): void {
  writeJson(paymentOrdersPath, orders);
}

export function readPendingEvents(): PendingBotEvent[] {
  return readJson<PendingBotEvent[]>(pendingEventsPath);
}

export function writePendingEvents(events: PendingBotEvent[]): void {
  writeJson(pendingEventsPath, events);
}
