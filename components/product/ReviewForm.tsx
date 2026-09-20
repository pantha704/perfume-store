"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TurnstileWidget } from "@/components/commerce/TurnstileWidget";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const accountsAvailable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

type Draft = { rating: number; name: string; title: string; text: string };

// The form is always visible — signed-out visitors see the fields and a
// "Sign in to post" button; their draft is kept in localStorage for the
// sign-in roundtrip. Posting itself stays signed-in only (spam control).
export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(accountsAvailable ? null : false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<{ busy: boolean; message: string; ok: boolean }>({ busy: false, message: "", ok: false });
  const draftKey = `relapse:review-draft:${productId}`;

  useEffect(() => {
    // Deferred so hydration completes first (localStorage isn't available on
    // the server) and the linter's sync-setState rule stays happy.
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(draftKey);
        if (!raw) return;
        const d = JSON.parse(raw) as Partial<Draft>;
        if (typeof d.rating === "number") setRating(d.rating);
        if (typeof d.name === "string") setName(d.name);
        if (typeof d.title === "string") setTitle(d.title);
        if (typeof d.text === "string") setText(d.text);
        localStorage.removeItem(draftKey);
      } catch { /* ignore */ }
    });
    if (!accountsAvailable) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser()
      .then(({ data }) => {
        setSignedIn(Boolean(data.user));
        const meta = (data.user?.user_metadata || {}) as Record<string, unknown>;
        if (typeof meta.display_name === "string") setName((current) => current || (meta.display_name as string));
      })
      .catch(() => setSignedIn(false));
  }, [draftKey]);

  function saveDraft() {
    try { localStorage.setItem(draftKey, JSON.stringify({ rating, name, title, text })); } catch { /* ignore */ }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true, message: "", ok: false });
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, rating, title, body: text, displayName: name, turnstileToken: token }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setState({ busy: false, message: data.error || "Could not save the review.", ok: false });
      return;
    }
    setState({ busy: false, message: "Thank you — your review is awaiting moderation.", ok: true });
    setRating(0);
    setTitle("");
    setText("");
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
  }

  return <form className="review-form" id="review-form" onSubmit={submit}>
    <p className="kicker">Write a review</p>
    <div className="review-stars-pick" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={rating === n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>★</button>)}
    </div>
    <div className="field-grid">
      <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={40} autoComplete="nickname"/></label>
      <label>Review title{" "}<span className="field-hint">optional</span><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="One line, if you like"/></label>
      <label className="wide">Your review<textarea value={text} onChange={(e) => setText(e.target.value)} required minLength={10} maxLength={800} rows={4} placeholder={`How does ${productName} wear on you?`}/></label>
    </div>
    {siteKey ? <TurnstileWidget siteKey={siteKey} onToken={setToken}/> : null}
    {state.message ? <p className={state.ok ? "form-note" : "form-error"} role="status">{state.message}</p> : null}
    {signedIn === null ? <button className="button dark-button" type="button" disabled>Checking session…</button>
      : signedIn ? <button className="button dark-button" disabled={state.busy || rating === 0}>{state.busy ? "Sending…" : "Submit review"}</button>
      : <div className="review-signin">
        <Link href="/account" className="button dark-button" onClick={saveDraft}>Sign in to post</Link>
        <p className="review-note">Posting needs an account. Your words stay in this box — you&apos;ll find them waiting after you sign in.</p>
      </div>}
  </form>;
}
