"use client";
import Link from "next/link";
import { useState } from "react";
import { TurnstileWidget } from "@/components/commerce/TurnstileWidget";
import { VIBE_DAYNIGHT, VIBE_FAMILIES, VIBE_OCCASIONS, VIBE_SEASONS, VIBE_SIZES, VIBE_STRENGTHS } from "@/lib/vibe";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function VibeBuilder({ notes }: { notes: string[] }) {
  const [families, setFamilies] = useState<string[]>([]);
  const [pickedNotes, setPickedNotes] = useState<string[]>([]);
  const [strength, setStrength] = useState("");
  const [size, setSize] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [dayNight, setDayNight] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const toggle = (current: string[], set: (value: string[]) => void, value: string) =>
    set(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/vibe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          families,
          notes: pickedNotes,
          strength,
          size,
          occasions,
          seasons,
          dayNight,
          blendName: form.get("blendName"),
          message: form.get("message"),
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          company: form.get("company"),
          turnstileToken: token
        })
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(result.error || "Could not send the request.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Could not send the request. Check your connection and try again.");
      setBusy(false);
    }
  }

  if (done) return <div className="vibe-done" data-reveal="up">
    <p className="kicker">Request received</p>
    <h2>Your blend is with<br/><em>the studio.</em></h2>
    <p>We reply to the email you gave us with the next steps for your blend — the notes to confirm, then how it will be made.</p>
    <Link className="inline-arrow" href="/shop">Browse the collection meanwhile</Link>
  </div>;

  const summaryRows: Array<[string, string]> = [
    ["Vibe", families.join(", ")],
    ["Notes", pickedNotes.length ? pickedNotes.slice(0, 3).join(", ") + (pickedNotes.length > 3 ? ` +${pickedNotes.length - 3}` : "") : ""],
    ["Strength", strength],
    ["Size", size],
    ["Occasion", occasions.join(", ")],
    ["Season", seasons.join(", ")],
    ["Day or night", VIBE_DAYNIGHT.find(([value]) => value === dayNight)?.[1] || ""]
  ];

  return <form className="vibe-form" onSubmit={submit}>
    <div className="vibe-layout">
      <div className="vibe-fields">
        <fieldset>
          <legend><span>01</span>Your vibe</legend>
          <div className="vibe-chips">{VIBE_FAMILIES.map((family) => <label key={family}><input type="checkbox" checked={families.includes(family)} onChange={() => toggle(families, setFamilies, family)}/><span>{family}</span></label>)}</div>
          <p className="vibe-hint">Pick one or two — or skip it and describe below.</p>
        </fieldset>
        <fieldset>
          <legend><span>02</span>Notes you love</legend>
          <div className="vibe-chips vibe-chips-notes">{notes.map((note) => <label key={note}><input type="checkbox" checked={pickedNotes.includes(note)} onChange={() => toggle(pickedNotes, setPickedNotes, note)}/><span>{note}</span></label>)}</div>
          <p className="vibe-hint">The full library from the collection — pick as many as you like.</p>
        </fieldset>
        <fieldset>
          <legend><span>03</span>Strength</legend>
          <div className="vibe-chips">{VIBE_STRENGTHS.map((option) => <label key={option}><input type="radio" name="strength" value={option} checked={strength === option} onChange={() => setStrength(option)}/><span>{option}</span></label>)}</div>
        </fieldset>
        <fieldset>
          <legend><span>04</span>Size</legend>
          <div className="vibe-chips">{VIBE_SIZES.map((option) => <label key={option}><input type="radio" name="size" value={option} checked={size === option} onChange={() => setSize(option)}/><span>{option}</span></label>)}</div>
        </fieldset>
        <fieldset>
          <legend><span>05</span>When will you wear it?</legend>
          <div className="vibe-chips">{VIBE_OCCASIONS.map((option) => <label key={option}><input type="checkbox" checked={occasions.includes(option)} onChange={() => toggle(occasions, setOccasions, option)}/><span>{option}</span></label>)}</div>
          <p className="vibe-hint">Occasions — pick any that fit.</p>
        </fieldset>
        <fieldset>
          <legend><span>06</span>Which weather?</legend>
          <div className="vibe-chips">{VIBE_SEASONS.map((option) => <label key={option}><input type="checkbox" checked={seasons.includes(option)} onChange={() => toggle(seasons, setSeasons, option)}/><span>{option}</span></label>)}</div>
        </fieldset>
        <fieldset>
          <legend><span>07</span>Day or night</legend>
          <div className="vibe-chips">{VIBE_DAYNIGHT.map(([value, label]) => <label key={value}><input type="radio" name="dayNight" value={value} checked={dayNight === value} onChange={() => setDayNight(value)}/><span>{label}</span></label>)}</div>
        </fieldset>
        <fieldset>
          <legend><span>08</span>Finish it</legend>
          <div className="field-grid">
            <label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label>
            <label>Email<input name="email" type="email" required maxLength={120} autoComplete="email"/></label>
            <label>Phone / WhatsApp<input name="phone" type="tel" required minLength={6} maxLength={24} autoComplete="tel"/></label>
            <label>Working name for your blend <span>optional</span><input name="blendName" maxLength={60} placeholder="e.g. Midnight Oud"/></label>
            <label className="wide">Anything else<textarea name="message" rows={4} maxLength={800} placeholder="A scent memory, notes to avoid, how you want it to feel — anything that helps the studio."/></label>
          </div>
          <label className="visually-hidden">Company<input name="company" tabIndex={-1} autoComplete="off"/></label>
          {siteKey ? <TurnstileWidget siteKey={siteKey} onToken={setToken}/> : null}
        </fieldset>
      </div>
      <aside className="vibe-summary">
        <p className="kicker">Your blend</p>
        <div className="vibe-summary-rows">{summaryRows.map(([label, value]) => <div key={label}><span>{label}</span><b>{value || "—"}</b></div>)}</div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button dark-button full-button" disabled={busy}>{busy ? "Sending…" : "Send to the studio"}</button>
        <p className="vibe-fine">The studio replies by email to confirm the blend and its price before anything is made.</p>
      </aside>
    </div>
  </form>;
}
