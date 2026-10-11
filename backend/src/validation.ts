import { z } from "zod";
export const signup = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(191),
  password: z
    .string()
    .min(8)
    .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
});
export const login = z.object({
  email: z.string().trim().toLowerCase().email().max(191),
  password: z
    .string()
    .min(1)
    .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
});
export const enquiry = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d ()-]+$/)
    .refine((v) => {
      const n = v.replace(/\D/g, "").length;
      return n >= 10 && n <= 15;
    })
    .max(20),
  city: z.string().trim().min(2).max(80),
  collegeId: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().positive().max(2147483647).optional(),
  ),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
export function fields(error: z.ZodError) {
  return Object.fromEntries(
    error.issues.map((i) => [String(i.path[0]), i.message]),
  );
}
