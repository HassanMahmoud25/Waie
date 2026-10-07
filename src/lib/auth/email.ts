/**
 * Account emails (password reset link, password-changed notice) via Resend's
 * HTTP API (https://resend.com/docs/api-reference/emails/send-email) using a
 * plain fetch() call -- no SDK dependency, the same approach this project
 * already uses for YouTube (lib/youtube/client.ts is a hand-rolled fetch
 * wrapper, not a generated client). No other email provider is configured
 * anywhere in the repository.
 *
 * Requires RESEND_API_KEY (server-only, never exposed to the client) and, for
 * any recipient other than the Resend account's own address, RESEND_FROM_EMAIL
 * on a domain verified in Resend -- the default `onboarding@resend.dev` sender
 * is Resend's sandbox and refuses every other recipient. If the key is unset,
 * this logs a clear server-side error and returns without sending -- callers
 * must still return the exact same generic response to the visitor either
 * way, so a missing configuration is never observable from the outside.
 *
 * Nothing here ever logs a recipient's reset URL or any password.
 */
import { siteConfig } from "@/config/site";
import { RESET_TOKEN_TTL_MS } from "@/lib/auth/reset-token";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "وعي <onboarding@resend.dev>";
const SEND_TIMEOUT_MS = 10_000;

type Email = { to: string; subject: string; html: string; text: string };

async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY is not configured -- "${email.subject}" email was not sent.`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...email }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API responded with ${response.status}: ${body.slice(0, 500)}`);
  }
}

const RESET_TTL_MINUTES = Math.round(RESET_TOKEN_TTL_MS / 60_000);

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "إعادة تعيين كلمة المرور — وعي",
    text: [
      "وعي",
      "",
      "وصلنا طلب لإعادة تعيين كلمة مرور حسابك في وعي.",
      "",
      `لإعادة التعيين، افتح هذا الرابط خلال ${RESET_TTL_MINUTES} دقيقة:`,
      resetUrl,
      "",
      "إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان -- لن يتغيّر شيء في حسابك.",
    ].join("\n"),
    html: layout(
      "إعادة تعيين كلمة المرور",
      `<p style="margin:0 0 20px;font-size:15px;line-height:1.9;color:#4a4a4a;">
            وصلنا طلب لإعادة تعيين كلمة مرور حسابك في وعي. اضغط الزر أدناه لاختيار كلمة مرور جديدة.
          </p>
          <p style="text-align:center;margin:0 0 24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#123b2e;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 28px;border-radius:999px;font-size:15px;">
              إعادة تعيين كلمة المرور
            </a>
          </p>
          <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:#8a8a8a;">
            هذا الرابط صالح لمدة ${RESET_TTL_MINUTES} دقيقة ولمرة واحدة فقط. إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان -- لن يتغيّر شيء في حسابك.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.8;color:#8a8a8a;word-break:break-all;">
            أو انسخ هذا الرابط والصقه في متصفحك:<br />
            <a href="${resetUrl}" style="color:#123b2e;">${resetUrl}</a>
          </p>`,
    ),
  });
}

/**
 * Sent after every successful reset or change, so an account owner learns
 * about a change they didn't make. Carries no link back into the account
 * beyond the public forgot-password page.
 */
export async function sendPasswordChangedEmail(to: string): Promise<void> {
  const forgotUrl = `${siteConfig.url}/forgot-password`;
  await sendEmail({
    to,
    subject: "تم تغيير كلمة المرور — وعي",
    text: [
      "وعي",
      "",
      "تم تغيير كلمة مرور حسابك في وعي للتو، وسُجّل خروجك من الأجهزة الأخرى.",
      "",
      "إذا لم تكن أنت من غيّرها، أعد تعيين كلمة المرور فورًا من هنا:",
      forgotUrl,
    ].join("\n"),
    html: layout(
      "تم تغيير كلمة المرور",
      `<p style="margin:0 0 20px;font-size:15px;line-height:1.9;color:#4a4a4a;">
            تم تغيير كلمة مرور حسابك في وعي للتو، وسُجّل خروجك من الأجهزة الأخرى.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.8;color:#8a8a8a;">
            إذا لم تكن أنت من غيّرها، <a href="${forgotUrl}" style="color:#123b2e;font-weight:800;">أعد تعيين كلمة المرور فورًا</a>.
          </p>`,
    ),
  });
}

function layout(heading: string, body: string): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:32px 16px;background:#f4f1ec;font-family:Tahoma,Arial,sans-serif;color:#1c1c1c;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="background:#123b2e;padding:28px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:900;color:#ffffff;">وعي</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;">${heading}</h1>
          ${body}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
