import { z } from "zod";

export const sellWithUsSchema = z.object({
  fullName: z.string().trim().min(2, { message: "validation.fullName" }).max(120, { message: "validation.fullName" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s()-]{7,19}$/, { message: "validation.phone" }),
  companyName: z.string().trim().min(2, { message: "validation.companyName" }).max(160, { message: "validation.companyName" }),
});

export type SellWithUsFormData = z.infer<typeof sellWithUsSchema>;

export type SellWithUsSubmission = SellWithUsFormData & {
  id: string;
  createdAt: string;
  source: "header-cta";
};