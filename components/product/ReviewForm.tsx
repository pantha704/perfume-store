"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TurnstileWidget } from "@/components/commerce/TurnstileWidget";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const accountsAvailable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(accountsAvailable ? null : false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<{ busy: boolean; message: string; ok: boolean }>({ busy: false, message: "", ok: false });

  useEffect(() => {
    if (!accountsAvailable) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser()
      .then(({ data }) => {
        setSignedIn(Boolean(data.user));
        const meta = (data.user?.user_metadata || {}) as Record<string, unknown>;
        if (typeof meta.display_name === "string") setName(meta.display_name);
      })
      .catch(() => setSignedIn(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true, message: "", ok: false });
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, rating, body: text, displayName: name, turnstileToken: token }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setState({ busy: false, message: data.error || "Could not save the review.", ok: false });
      return;
    }
    setState({ busy: false, message: "Thank you — your review is awaiting moderation.", ok: true });
    setRating(0);
    setText("");
  }

  if (signedIn === null) return <div className="review-form"><p className="review-note">Checking your session…</p></div>;
  if (!signedIn) return <div className="review-form">
    <p className="review-note">Wore {productName}? <Link href="/account" className="inline-arrow">Sign in to write a review</Link>.</p>
  </div>;

  return <form className="review-form" onSubmit={submit}>
    <p className="kicker">Write a review</p>
    <div className="review-stars-pick" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={rating === n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>★</button>)}
    </div>
    <div className="field-grid">
      <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={40} autoComplete="nickname"/></label>
      <label className="wide">Your review<textarea value={text} onChange={(e) => setText(e.target.value)} required minLength={10} maxLength={800} rows={4} placeholder={`How does ${productName} wear on you?`}/></label>
    </div>
    {siteKey ? <TurnstileWidget siteKey={siteKey} onToken={setToken}/> : null}
    {state.message ? <p className={state.ok ? "form-note" : "form-error"} role="status">{state.message}</p> : null}
    <button className="button dark-button" disabled={state.busy || rating === 0}>{state.busy ? "Sending…" : "Submit review"}</button>
  </form>;
}
