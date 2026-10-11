import { HttpError } from "./http";
const buckets = new Map<string, { count: number; until: number }>();
export function limit(key: string, maximum = 20, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.until <= now) buckets.delete(k);
  const bucket = buckets.get(key) || { count: 0, until: now + windowMs };
  if (bucket.count >= maximum)
    throw new HttpError(
      429,
      "Too many attempts. Please try again in 15 minutes.",
    );
  bucket.count++;
  buckets.set(key, bucket);
}
