// lib/email/templates.ts
import { formatSlotInTimezone } from "@/lib/utils/availability";

function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:15px;font-weight:600;color:#0f172a;">Speak with Marc</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function bookingConfirmationTemplate({
  studentName,
  sessionStartUtc,
  timezone,
}: {
  studentName: string;
  sessionStartUtc: string;
  timezone: string;
}) {
  const formattedDate = formatSlotInTimezone(sessionStartUtc, timezone);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const html = emailShell(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Session confirmée ✅</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">
      Bonjour ${studentName || ""},<br /><br />
      Ta session est confirmée pour le <strong>${formattedDate}</strong>. On se retrouve à cette heure-là !
    </p>
    <div style="background-color:#f1f5f9;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#64748b;">Date et heure</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${formattedDate}</p>
    </div>
    <a href="${siteUrl}/dashboard"
       style="display:inline-block;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">
      Voir mon tableau de bord
    </a>
  `);

  const text = `Session confirmée pour le ${formattedDate}. Voir ton tableau de bord : ${siteUrl}/dashboard`;

  return { subject: "Ta session est confirmée", html, text };
}

export function sessionReminderTemplate({
  studentName,
  sessionStartUtc,
  timezone,
}: {
  studentName: string;
  sessionStartUtc: string;
  timezone: string;
}) {
  const formattedDate = formatSlotInTimezone(sessionStartUtc, timezone);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const html = emailShell(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Rappel : session demain 🗓️</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">
      Bonjour ${studentName || ""},<br /><br />
      Petit rappel : ta session est prévue pour le <strong>${formattedDate}</strong> — dans environ 24h.
    </p>
    <div style="background-color:#fef3c7;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;">Date et heure</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#78350f;">${formattedDate}</p>
    </div>
    <a href="${siteUrl}/dashboard"
       style="display:inline-block;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">
      Voir ma réservation
    </a>
  `);

  const text = `Rappel : ta session est prévue pour le ${formattedDate}. Voir ton tableau de bord : ${siteUrl}/dashboard`;

  return { subject: "Rappel : ta session est demain", html, text };
}
