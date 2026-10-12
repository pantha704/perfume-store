import { describe, expect, it } from "vitest";
import { formatVibeRequest, parseVibeRequest } from "../../lib/vibe";

describe("vibe", () => {
  it("rejects requests without contact details or any preference", () => {
    expect(parseVibeRequest(null).ok).toBe(false);
    expect(parseVibeRequest({ name: "A", email: "not-an-email", phone: "9876543210" }).ok).toBe(false);
    expect(parseVibeRequest({ name: "Ayush", email: "a@b.co", phone: "9876543210" }).ok).toBe(false);
  });

  it("caps runaway selections", () => {
    const parsed = parseVibeRequest({
      name: "Ayush", email: "a@b.co", phone: "9876543210",
      notes: Array.from({ length: 40 }, (_, index) => `Note ${index}`),
      families: ["Fresh", "Floral", "Woody", "Smoky"]
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.request.notes).toHaveLength(12);
    expect(parsed.request.families).toHaveLength(3);
  });

  it("formats a full blend request for the studio inbox", () => {
    const parsed = parseVibeRequest({
      name: "Ayush", email: "a@b.co", phone: "9876543210",
      families: ["Woody"], notes: ["Cedar", "Oudh (Agarwood)"],
      strength: "Extrait de Parfum", size: "30 ml",
      occasions: ["Dinner"], seasons: ["Winter"], dayNight: "night",
      blendName: "Midnight", message: "less sweet"
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const text = formatVibeRequest(parsed.request);
    expect(text).toContain("Custom blend request");
    expect(text).toContain("Notes loved: Cedar; Oudh (Agarwood)");
    expect(text).toContain('Working name: "Midnight"');
    expect(text).toContain("Anything else: less sweet");
  });
});
