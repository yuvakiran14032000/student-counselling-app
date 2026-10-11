import { NextResponse } from "next/server";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function success<T>(data: T, status = 200) {
  return NextResponse.json(
    { data },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export function failure(
  message: string,
  status: number,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    { error: { message, ...(fields ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export function handleError(error: unknown) {
  if (error instanceof HttpError) return failure(error.message, error.status);
  // Log only the error category: database exceptions may include credentials or SQL.
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return failure(
    "We couldn’t complete that request. Please try again shortly.",
    503,
  );
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = process.env.APP_ORIGIN || new URL(request.url).origin;
  if (
    origin !== allowed ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new HttpError(403, "This request is not allowed.");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Send JSON data.");
}
export async function readJson(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length") || 0) > 8192)
    throw new HttpError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Enter the required details.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) {
      await reader.cancel();
      throw new HttpError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Send valid JSON data.");
  }
}
