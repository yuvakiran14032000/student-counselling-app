import mysql from "mysql2/promise";
import { config } from "./config.js";
const url = new URL(config.databaseUrl);
export const pool = mysql.createPool({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z",
  enableKeepAlive: true,
});
