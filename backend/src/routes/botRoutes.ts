import { Router } from "express";
import { botApiKeyAuth } from "../middleware/apiKeyAuth";
import { ackEvent, listPendingEvents } from "../services/eventQueueService";
import { SupportedServerId } from "../types";

export const botRoutes = Router();
botRoutes.use(botApiKeyAuth);

botRoutes.get("/events", (req, res) => {
  const serverIdRaw = req.query.serverId ? String(req.query.serverId) : undefined;
  const serverId = serverIdRaw && ["server1", "server2"].includes(serverIdRaw)
    ? (serverIdRaw as SupportedServerId)
    : undefined;

  res.json({ events: listPendingEvents(serverId) });
});

botRoutes.post("/events/:eventId/ack", (req, res) => {
  const success = ackEvent(req.params.eventId);
  if (!success) {
    res.status(404).json({ error: "Event not found." });
    return;
  }
  res.json({ ok: true });
});
