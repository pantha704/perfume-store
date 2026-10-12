// Get Your Vibe — bespoke blend requests.
// Option lists mirror the live collection (families, the full note library,
// occasions, seasons) plus the studio's attar line. Shared by the builder UI,
// the API route and the unit tests.

export const VIBE_FAMILIES = ["Fresh", "Floral", "Woody", "Smoky"] as const;
export const VIBE_STRENGTHS = ["Eau de Parfum", "Extrait de Parfum", "Attar (oil)"] as const;
export const VIBE_SIZES = ["8 ml", "30 ml", "50 ml", "Not sure — advise me"] as const;
export const VIBE_OCCASIONS = ["Everyday", "Office", "Dinner", "Evening", "Night out", "Celebrations", "Travel", "Daily wear", "Occasions", "Discovery", "Gifting"] as const;
export const VIBE_SEASONS = ["All year", "Spring", "Summer", "Monsoon", "Autumn", "Winter", "Cool evenings", "Cool nights", "Hot days"] as const;
export const VIBE_DAYNIGHT = [["day", "Day"], ["night", "Night"], ["both", "Day + night"]] as const;

export interface VibeRequest {
  families: string[];
  notes: string[];
  strength: string;
  size: string;
  occasions: string[];
  seasons: string[];
  dayNight: string;
  blendName: string;
  message: string;
  name: string;
  email: string;
  phone: string;
}

const list = (value: unknown, max: number, itemMax = 90): string[] =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, max).map((item) => item.slice(0, itemMax))
    : [];

export function parseVibeRequest(body: Record<string, unknown> | null | undefined): { ok: true; request: VibeRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().slice(0, 120);
  const phone = String(body.phone || "").trim().slice(0, 24);
  const families = list(body.families, 3, 40);
  const notes = list(body.notes, 12);
  const occasions = list(body.occasions, 6, 40);
  const seasons = list(body.seasons, 6, 40);
  const strength = String(body.strength || "").trim().slice(0, 60);
  const size = String(body.size || "").trim().slice(0, 60);
  const dayNight = String(body.dayNight || "").trim().slice(0, 20);
  const blendName = String(body.blendName || "").trim().slice(0, 60);
  const message = String(body.message || "").trim().slice(0, 800);
  if (name.length < 2) return { ok: false, error: "Add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Add a valid email." };
  if (phone.length < 6) return { ok: false, error: "Add a phone number so the studio can reach you." };
  if (!families.length && !notes.length && !message) return { ok: false, error: "Pick a vibe, some notes, or tell us what you're after." };
  return { ok: true, request: { families, notes, strength, size, occasions, seasons, dayNight, blendName, message, name, email, phone } };
}

export function formatVibeRequest(request: VibeRequest): string {
  const lines = [
    "Custom blend request — Get Your Vibe",
    `Vibe: ${request.families.join(", ") || "—"}`,
    `Notes loved: ${request.notes.join("; ") || "—"}`,
    `Strength: ${request.strength || "—"}`,
    `Size: ${request.size || "—"}`,
    `Occasion: ${request.occasions.join(", ") || "—"}`,
    `Season: ${request.seasons.join(", ") || "—"}`,
    `Day or night: ${request.dayNight || "—"}`
  ];
  if (request.blendName) lines.push(`Working name: "${request.blendName}"`);
  if (request.message) lines.push(`Anything else: ${request.message}`);
  return lines.join("\n");
}
