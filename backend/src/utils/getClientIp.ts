import { Request } from "express";

export function getClientIp(req: Request) {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || (req.socket as any)?.remoteAddress
      || null;
}
