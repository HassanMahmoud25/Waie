/**
 * Password reset email delivery via Resend's HTTP API
 * (https://resend.com/docs/api-reference/emails/send-email) using a plain
 * fetch() call -- no SDK dependency, the same approach this project already
 * uses for YouTube (lib/youtube/client.ts is a hand-rolled fetch wrapper,
 * not a generated client). No other email provider was configured anywhere
 * in the repository before this.
 *
 * Requires RESEND_API_KEY (server-only, never exposed to the client). If
 * it's unset, this logs a clear server-side error and returns without
 * sending -- callers (requestPasswordResetAction) must still return the
 * exact same generic response to the visitor either way, so a missing
 * configuration is never observable from the outside.
 */
const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "وعي <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not configured -- password reset email was not sent. Add it to .env.local to enable real delivery.",
    );
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "إعادة تعيين كلمة المرور — وعي",
      html: resetEmailHtml(resetUrl),
      text: resetEmailText(resetUrl),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API responded with ${response.status}: ${body}`);
  }
}

function resetEmailText(resetUrl: string): string {
  return [
    "وعي",
    "",
    "وصلنا طلب لإعادة تعيين كلمة مرور حسابك في وعي.",
    "",
    "لإعادة التعيين، افتح هذا الرابط خلال 30 دقيقة:",
    resetUrl,
    "",
    "إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان -- لن يتغيّر شيء في حسابك.",
  ].join("\n");
}

function resetEmailHtml(resetUrl: string): string {
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
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;">إعادة تعيين كلمة المرور</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.9;color:#4a4a4a;">
            وصلنا طلب لإعادة تعيين كلمة مرور حسابك في وعي. اضغط الزر أدناه لاختيار كلمة مرور جديدة.
          </p>
          <p style="text-align:center;margin:0 0 24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#123b2e;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 28px;border-radius:999px;font-size:15px;">
              إعادة تعيين كلمة المرور
            </a>
          </p>
          <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:#8a8a8a;">
            هذا الرابط صالح لمدة 30 دقيقة فقط. إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان -- لن يتغيّر شيء في حسابك.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.8;color:#8a8a8a;word-break:break-all;">
            أو انسخ هذا الرابط والصقه في متصفحك:<br />
            <a href="${resetUrl}" style="color:#123b2e;">${resetUrl}</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
