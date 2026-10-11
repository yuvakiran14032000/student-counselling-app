import { z } from "zod";
const name = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(80, "Use 80 characters or fewer.");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(191, "Email is too long.");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "Use a password of 72 bytes or fewer.",
  );
export const signupSchema = z.object({ name, email, password: passwordSchema });
export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, "Enter your password.")
    .refine(
      (v) => new TextEncoder().encode(v).length <= 72,
      "Password is too long.",
    ),
});
export const enquirySchema = z.object({
  name,
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number.")
    .regex(/^\+?[\d ()-]+$/, "Use a valid phone number.")
    .max(20, "Phone number is too long.")
    .refine((v) => {
      const n = v.replace(/\D/g, "").length;
      return n >= 10 && n <= 15;
    }, "Use 10–15 digits, including the country code if needed."),
  city: z
    .string()
    .trim()
    .min(2, "Enter your city.")
    .max(80, "Use 80 characters or fewer."),
  collegeId: z
    .preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().int().positive().max(2147483647).optional(),
    ),
  consent: z.literal(true, {
    error: "Please agree to be contacted about this enquiry.",
  }),
  website: z.string().max(0).optional(),
});
export const querySchema = z.object({
  search: z
    .string()
    .trim()
    .max(80, "Search must be 80 characters or fewer.")
    .default(""),
  city: z.string().trim().max(80, "City is too long.").default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
export function fieldErrors(error: z.ZodError) {
  return Object.fromEntries(
    error.issues.map((i) => [String(i.path[0]), i.message]),
  );
}
