// lib/email/booking-emails.ts
import { resend, EMAIL_FROM } from "./resend";
import {
  bookingConfirmationTemplate,
  sessionReminderTemplate,
} from "./templates";

export async function sendBookingConfirmationEmail(params: {
  to: string;
  studentName: string;
  sessionStartUtc: string;
  timezone: string;
}) {
  const { subject, html, text } = bookingConfirmationTemplate(params);
  return resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject,
    html,
    text,
  });
}

export async function sendSessionReminderEmail(params: {
  to: string;
  studentName: string;
  sessionStartUtc: string;
  timezone: string;
}) {
  const { subject, html, text } = sessionReminderTemplate(params);
  return resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject,
    html,
    text,
  });
}
