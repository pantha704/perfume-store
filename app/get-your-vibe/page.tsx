import type { Metadata } from "next";
import { getAllNotes } from "@/lib/catalogue";
import { VibeBuilder } from "@/components/vibe/VibeBuilder";

export const metadata: Metadata = {
  title: { absolute: "Get Your Vibe — Relapse Perfumes" },
  description: "Build your own fragrance or attar: pick the vibe, the notes, the strength and the size — the studio blends it for you."
};

export default async function GetYourVibePage() {
  const notes = await getAllNotes();
  return <div className="vibe-page section-shell">
    <header data-reveal="up">
      <p className="kicker">Bespoke · blended to order</p>
      <h1>Get your vibe,<br/><em>built around you.</em></h1>
      <p>Pick the air you want to live in — the vibe, the notes, the strength, the size. The studio reads every request and replies with the details for your blend. No account needed.</p>
    </header>
    <VibeBuilder notes={notes.map((note) => note.name)} />
  </div>;
}
