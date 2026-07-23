// lib/email/resend.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY manquant dans les variables d'environnement.",
  );
}

export const resend = new Resend(process.env.RESEND_API_KEY);
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Speak with Marc <onboarding@resend.dev>";
