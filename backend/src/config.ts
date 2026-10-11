import "dotenv/config";
export const config = {
  port: Number(process.env.API_PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "",
  databaseUrl: process.env.DATABASE_URL || "",
};
export const frontendOrigins = [
  config.frontendOrigin,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
if (!config.jwtSecret || config.jwtSecret.length < 32)
  throw new Error("JWT_SECRET must be at least 32 characters");
