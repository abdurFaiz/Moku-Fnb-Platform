import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .min(3, "Nama lengkap minimal 3 karakter"),

  phone: z
    .string()
    .min(1, "Nomor WhatsApp wajib diisi")
    .regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh berisi angka")
    .min(8, "Nomor WhatsApp minimal 8 digit")
    .max(13, "Nomor WhatsApp maksimal 12 digit"),

  date_birth: z
    .string()
    .optional(),

  gender: z
    .string()
    .optional(),

  job: z.string().optional(),

  avatar: z
    .instanceof(File)
    .optional()
    .or(z.string().optional()),
});

const emailSchema = z.object({
  email: z
    .string("Email wajib diisi")
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
})

type FormValues = z.infer<typeof formSchema>;
export { formSchema, emailSchema, type FormValues };
