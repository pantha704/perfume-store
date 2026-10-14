import { runtimeEnv } from "@/lib/runtime-env";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends via Resend when RESEND_API_KEY is configured (worker secret).
 * No-ops safely when the key is missing — callers never fail on email.
 * Until a sending domain is verified in Resend, only the account owner's
 * inbox accepts these (Resend test mode).
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const key = runtimeEnv("RESEND_API_KEY");
  if (!key) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: runtimeEnv("EMAIL_FROM", "Relapse Perfumes <onboarding@resend.dev>"),
        to: [message.to],
        subject: message.subject,
        html: message.html
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
