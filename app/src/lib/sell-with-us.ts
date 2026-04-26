import { z } from "zod";

export const sellWithUsSchema = z.object({
  fullName: z.string().trim().min(2, { message: "validation.fullName" }).max(120, { message: "validation.fullName" }),
  phone: z
    .string()
    .trim()
    .regex(/^(?:07\d{8}|7\d{8})$/, { message: "validation.phone" }),
  companyName: z.string().trim().min(2, { message: "validation.companyName" }).max(160, { message: "validation.companyName" }),
});

export type SellWithUsFormData = z.infer<typeof sellWithUsSchema>;