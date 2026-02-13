import { v4 as uuidv4 } from "uuid";
import { PendingBotEvent, SupportedServerId } from "../types";
import { readPendingEvents, writePendingEvents } from "../utils/fileDb";

export function enqueueBotEvent(input: Omit<PendingBotEvent, "eventId" | "createdAt" | "processed">): PendingBotEvent {
  const current = readPendingEvents();
  const event: PendingBotEvent = {
    eventId: uuidv4(),
    createdAt: new Date().toISOString(),
    processed: false,
    ...input
  };
  current.push(event);
  writePendingEvents(current);
  return event;
}

export function listPendingEvents(serverId?: SupportedServerId): PendingBotEvent[] {
  return readPendingEvents().filter((evt) => !evt.processed && (!serverId || evt.serverId === serverId));
}

export function ackEvent(eventId: string): boolean {
  const events = readPendingEvents();
  const target = events.find((evt) => evt.eventId === eventId);
  if (!target) return false;
  target.processed = true;
  writePendingEvents(events);
  return true;
}
