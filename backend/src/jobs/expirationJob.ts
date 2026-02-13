import { env } from "../config/env";
import { runExpirationCheck } from "../services/vipService";

export function startExpirationJob(): void {
  setInterval(() => {
    runExpirationCheck();
  }, env.expirationCheckIntervalMs);
}
