"use client";
import { useState } from "react";
import { TurnstileWidget } from "@/components/commerce/TurnstileWidget";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function ContactForm({ productId, productName }: { productId?: string; productName?: string }) {
  const [token, setToken] = useState("");
  const [state, setState] = useState<{ busy: boolean; message: string; ok: boolean }>({ busy: false, message: "", ok: false });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState({ busy: true, message: "", ok: false });
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
        company: data.get("company"),
        productId,
        turnstileToken: token,
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setState({ busy: false, message: result.error || "Could not send the message.", ok: false });
      return;
    }
    setState({ busy: false, message: "Thank you — we will reply to your email.", ok: true });
    form.reset();
  }

  return <form className="contact-form" onSubmit={submit}>
    {productName ? <p className="review-note">About: <b>{productName}</b></p> : null}
    <div className="field-grid">
      <label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label>
      <label>Email<input name="email" type="email" required maxLength={120} autoComplete="email"/></label>
      <label>Phone <span>optional</span><input name="phone" maxLength={24} autoComplete="tel"/></label>
      <label className="wide">Message<textarea name="message" required minLength={10} maxLength={1200} rows={5} placeholder="Include your order id if the question is about an order."/></label>
    </div>
    <label className="visually-hidden">Company<input name="company" tabIndex={-1} autoComplete="off"/></label>
    {siteKey ? <TurnstileWidget siteKey={siteKey} onToken={setToken}/> : null}
    {state.message ? <p className={state.ok ? "form-note" : "form-error"} role="status">{state.message}</p> : null}
    <button className="button dark-button" disabled={state.busy}>{state.busy ? "Sending…" : "Send message"}</button>
  </form>;
}
