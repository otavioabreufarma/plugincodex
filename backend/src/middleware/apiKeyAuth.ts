import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function botApiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== env.botApiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function pluginApiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== env.pluginApiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
