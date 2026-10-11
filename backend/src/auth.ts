import { Request, Response, NextFunction } from "express";
import { SignJWT, jwtVerify } from "jose";
import { config } from "./config.js";
export const COOKIE_NAME = "pathway_session";
const secret = () => new TextEncoder().encode(config.jwtSecret);
export async function signUser(id: number) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(id))
    .setIssuer("pathway-api")
    .setAudience("pathway-web")
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret());
}
export async function verifyUser(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "pathway-api",
      audience: "pathway-web",
    });
    const id = Number(payload.sub);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
export function setSession(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400000,
    path: "/",
  });
}
export function clearSession(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = await verifyUser(req.cookies?.[COOKIE_NAME]);
  if (!id)
    return res
      .status(401)
      .json({ error: { message: "Please log in to continue." } });
  const [rows] = await import("./db.js").then((m) =>
    m.pool.execute("SELECT id, name, email FROM users WHERE id = ?", [id]),
  );
  const user = (rows as { id: number; name: string; email: string }[])[0];
  if (!user)
    return res
      .status(401)
      .json({ error: { message: "Please log in to continue." } });
  res.locals.user = user;
  return next();
}
