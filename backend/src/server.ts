import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import { config, frontendOrigins } from "./config.js";
import { clearSession, requireUser, setSession, signUser } from "./auth.js";
import { enquiry, fields, login, signup } from "./validation.js";
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: frontendOrigins, credentials: true }));
app.use(express.json({ limit: "8kb" }));
app.use(cookieParser());
const ok = (res: express.Response, data: unknown, status = 200) =>
  res.status(status).set("Cache-Control", "no-store").json({ data });
const fail = (
  res: express.Response,
  message: string,
  status: number,
  fieldErrors?: Record<string, string>,
) =>
  res
    .status(status)
    .set("Cache-Control", "no-store")
    .json({
      error: { message, ...(fieldErrors ? { fields: fieldErrors } : {}) },
    });
const cityCase = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\p{L}/gu, (x) => x.toUpperCase());
const cleanQuery = (value: unknown, max = 80) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
const pageNumber = (value: unknown) =>
  Math.max(1, Math.min(100000, Number(value || 1) || 1));
const pageLimit = (value: unknown, fallback = 8, max = 25) =>
  Math.max(1, Math.min(max, Number(value || fallback) || fallback));

app.get("/health", (_req, res) =>
  ok(res, { service: "pathway-api", status: "ok" }),
);
app.post("/api/auth/signup", async (req, res) => {
  try {
    const parsed = signup.safeParse(req.body);
    if (!parsed.success)
      return fail(
        res,
        "Check the highlighted fields.",
        400,
        fields(parsed.error),
      );
    const { name, email, password } = parsed.data;
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    if ((existing as unknown[]).length)
      return fail(
        res,
        "An account with this email already exists. Please log in.",
        409,
        { email: "This email is already registered." },
      );
    const hash = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash],
    );
    return ok(res, { name, email }, 201);
  } catch (e) {
    console.error("signup", e instanceof Error ? e.name : "error");
    return fail(res, "We couldn’t complete that request.", 503);
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const parsed = login.safeParse(req.body);
    if (!parsed.success)
      return fail(
        res,
        "Check the highlighted fields.",
        400,
        fields(parsed.error),
      );
    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [parsed.data.email],
    );
    const user = (
      rows as {
        id: number;
        name: string;
        email: string;
        password_hash: string;
      }[]
    )[0];
    const match = await bcrypt.compare(
      parsed.data.password,
      user?.password_hash ||
        "$2b$12$C6UzMDM.H6dfI/f/IKcEe.aFakeHashForTimingOnly",
    );
    if (!user || !match)
      return fail(res, "Email or password is incorrect.", 401);
    setSession(res, await signUser(user.id));
    return ok(res, { id: user.id, name: user.name, email: user.email });
  } catch (e) {
    console.error("login", e instanceof Error ? e.name : "error");
    return fail(res, "We couldn’t complete that request.", 503);
  }
});
app.post("/api/auth/logout", (req, res) => {
  clearSession(res);
  return ok(res, { message: "Logged out." });
});
app.get("/api/auth/me", requireUser, (req, res) => ok(res, res.locals.user));
app.get("/api/colleges", async (req, res) => {
  try {
    const search = cleanQuery(req.query.search);
    const page = pageNumber(req.query.page);
    const pageSize = pageLimit(req.query.pageSize);
    const offset = (page - 1) * pageSize;
    const where = search
      ? "WHERE name LIKE ? OR city LIKE ? OR slug LIKE ?"
      : "";
    const term = `%${search}%`;
    const params = search ? [term, term, term] : [];
    const order = search
      ? "ORDER BY CASE WHEN name LIKE ? THEN 0 WHEN city LIKE ? THEN 1 WHEN slug LIKE ? THEN 2 ELSE 3 END, name ASC, id ASC"
      : "ORDER BY name ASC, id ASC";
    const orderParams = search
      ? [`${search}%`, `${search}%`, `${search}%`]
      : [];
    const [rows] = await pool.execute(
      `SELECT id, slug, name, city FROM colleges ${where} ${order} LIMIT ${pageSize} OFFSET ${offset}`,
      [...params, ...orderParams],
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM colleges ${where}`,
      params,
    );
    const total = Number((countRows as { total: number }[])[0].total);
    return ok(res, {
      colleges: rows,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (e) {
    console.error("colleges", e instanceof Error ? e.name : "error");
    return fail(res, "We couldn’t load colleges.", 503);
  }
});
app.post("/api/enquiries", async (req, res) => {
  try {
    const parsed = enquiry.safeParse(req.body);
    if (!parsed.success)
      return fail(
        res,
        "Check the highlighted fields.",
        400,
        fields(parsed.error),
      );
    const { name, phone, city, collegeId: selectedCollegeId } = parsed.data;
    let collegeId: number | null = null;
    if (selectedCollegeId) {
      const [rows] = await pool.execute(
        "SELECT id FROM colleges WHERE id = ? LIMIT 1",
        [selectedCollegeId],
      );
      collegeId = (rows as { id: number }[])[0]?.id ?? null;
      if (!collegeId)
        return fail(res, "This college is unavailable.", 400, {
          collegeId: "Select an available college.",
        });
    }
    const [result] = await pool.execute(
      "INSERT INTO leads (name, phone, city, college_id) VALUES (?, ?, ?, ?)",
      [name, phone.replace(/[^\d+]/g, ""), cityCase(city), collegeId],
    );
    return ok(
      res,
      {
        reference: (result as { insertId: number }).insertId,
        message: "Your enquiry has been saved.",
      },
      201,
    );
  } catch (e) {
    console.error("enquiry", e instanceof Error ? e.name : "error");
    return fail(res, "We couldn’t save that enquiry.", 503);
  }
});
app.get("/api/leads", requireUser, async (req, res) => {
  try {
    const search = cleanQuery(req.query.search);
    const city = cleanQuery(req.query.city);
    const page = pageNumber(req.query.page);
    const params: (string | number)[] = [];
    const where: string[] = [];
    if (city) {
      where.push("city = ?");
      params.push(city);
    }
    if (search) {
      where.push("(name LIKE ? OR phone LIKE ? OR city LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * 10;
    const [rows] = await pool.execute(
      `SELECT id, name, phone, city, created_at AS createdAt FROM leads ${clause} ORDER BY created_at DESC, id DESC LIMIT 10 OFFSET ${offset}`,
      params,
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM leads ${clause}`,
      params,
    );
    const [cityRows] = await pool.execute(
      "SELECT DISTINCT city FROM leads ORDER BY city ASC",
    );
    return ok(res, {
      leads: rows,
      total: Number((countRows as { total: number }[])[0].total),
      page,
      pageSize: 10,
      cities: (cityRows as { city: string }[]).map((x) => x.city),
    });
  } catch (e) {
    console.error("leads", e instanceof Error ? e.name : "error");
    return fail(res, "We couldn’t load your leads.", 503);
  }
});
app.get("/api/dashboard/summary", requireUser, async (_req, res) => {
  try {
    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM leads",
    );
    const [weekRows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM leads WHERE created_at >= UTC_DATE() - INTERVAL ((WEEKDAY(UTC_DATE()))) DAY",
    );
    const [topRows] = await pool.execute(
      "SELECT city, COUNT(*) AS count FROM leads GROUP BY city ORDER BY count DESC, city ASC LIMIT 1",
    );
    const top = (topRows as { city: string; count: number }[])[0];
    return ok(res, {
      total: Number((totalRows as { total: number }[])[0].total),
      thisWeek: Number((weekRows as { total: number }[])[0].total),
      topCity: top?.city || null,
      topCityCount: Number(top?.count || 0),
    });
  } catch (e) {
    console.error("summary", e instanceof Error ? e.name : "error");
    return fail(res, "We couldn’t load your summary.", 503);
  }
});
app.use(
  (
    _err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => fail(res, "We couldn’t complete that request.", 503),
);
app.listen(config.port, "127.0.0.1", () =>
  console.log(`Pathway API listening on http://127.0.0.1:${config.port}`),
);
