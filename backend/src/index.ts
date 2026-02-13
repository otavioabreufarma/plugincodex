import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { initializeStorage } from "./utils/fileDb";
import { authRoutes } from "./routes/authRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { botRoutes } from "./routes/botRoutes";
import { pluginRoutes } from "./routes/pluginRoutes";
import { startExpirationJob } from "./jobs/expirationJob";

initializeStorage();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/payments", paymentRoutes);
app.use("/bot", botRoutes);
app.use("/plugin", pluginRoutes);

app.listen(env.port, () => {
  startExpirationJob();
  // Startup log intentionally concise for production log streams.
  console.log(`Backend running on port ${env.port}`);
});
