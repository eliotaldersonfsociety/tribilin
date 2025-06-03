import { z } from "zod";

// Base sin confirm_password
export const registerBaseSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  lastname: z.string().min(1),
  address: z.string().min(1),
  house_apt: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  phone: z.string().min(1),
  password: z.string().min(6),
  country: z.string().min(1),
});

// Para el frontend: incluye confirmación
export const registerSchema = registerBaseSchema
  .extend({
    confirm_password: z.string().min(6),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

// Para el backend: sin confirmación
export const registerSchemaForBackend = registerBaseSchema.extend({
  recaptchaToken: z.string().min(1, "El token de reCAPTCHA es requerido"),
});
