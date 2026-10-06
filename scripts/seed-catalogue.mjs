#!/usr/bin/env node
/**
 * seed-catalogue.mjs — mirror the client catalogue into the live Supabase
 * tables (products / variants / variant_fulfillment_mappings).
 *
 * Source of truth: data/demo-products.ts (client-supplied content: WhatsApp
 * notes + supplied posters + printed catalogue card). Keep the two in sync if
 * the catalogue ever changes before the site reads fully from the database.
 *
 * Idempotent: upserts on products.slug, variants.sku and
 * (variant_id, provider). Re-runs are safe.
 *
 * Run:   node scripts/seed-catalogue.mjs
 * Creds: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the environment,
 *        falling back to ~/.config/velora/deploy.env (never committed).
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function loadEnv() {
  const env = { ...process.env };
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return env;
  try {
    const raw = readFileSync(join(homedir(), ".config/velora/deploy.env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* ignore — env vars are the happy path */ }
  return env;
}

const env = loadEnv();
const URL = env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const photo = (slug) => `/products/relapse/${slug}.webp`;
const manualOnly = [{ provider: "manual", enabled: true, priority: 100 }];
const bottleMappings = (sku) => [
  { provider: "amazon_mcf", provider_sku: `REPLACE-AMAZON-SKU-${sku}`, inventory_sku: `REPLACE-SELLER-SKU-${sku}`, enabled: false, priority: 10 },
  { provider: "shiprocket", provider_sku: sku, enabled: false, priority: 20 },
  { provider: "manual", enabled: true, priority: 100 }
];
const v8 = (sku) => ({ sku, label: "8 ml", sizeMl: 8, pricePaise: 9900, compareAtPaise: 14900, weightGrams: 60, kind: "travel", preferred: "manual", mappings: [...manualOnly] });
const v30 = (sku) => ({ sku, label: "30 ml", sizeMl: 30, pricePaise: 29900, compareAtPaise: 44900, weightGrams: 180, kind: "bottle", preferred: "amazon_mcf", mappings: bottleMappings(sku) });
const v50 = (sku) => ({ sku, label: "50 ml", sizeMl: 50, pricePaise: 44900, compareAtPaise: 67500, weightGrams: 320, kind: "bottle", preferred: "amazon_mcf", mappings: bottleMappings(sku) });

const PRODUCTS = [
  {
    slug: "invictus", sortOrder: 10, name: "Invictus", eyebrow: "The scent of luxury",
    shortDescription: "Powerful, fresh, oceanic. Sea notes, grapefruit and mandarin orange.",
    description: "Sea notes, grapefruit and mandarin orange open bright and oceanic. Bay leaf and jasmine carry the middle, before ambergris, guaiac wood, oakmoss and patchouli settle the base.",
    family: "Fresh", concentration: "Eau de Parfum", image: photo("invictus"),
    imageAlt: "Invictus by Relapse Perfumes — supplied poster artwork", accent: "#8d6c4f", featured: true,
    notes: { top: ["Sea notes", "Grapefruit", "Mandarin orange"], heart: ["Bay leaf", "Jasmine"], base: ["Ambergris", "Guaiac wood", "Oakmoss", "Patchouli"] },
    performance: { longevityHours: [7, 9], sillage: "noticeable", seasons: ["Summer", "Monsoon", "All year"], occasions: ["Everyday", "Office", "Evening"], dayNight: "both", wearsLike: "sea air, bright citrus and warm ambergris" },
    gallery: [photo("invictus-bottle")],
    variants: [v8("REL-INV-08"), v30("REL-INV-30"), v50("REL-INV-50")]
  },
  {
    slug: "velvet-bloom", sortOrder: 20, name: "Velvet Bloom", eyebrow: "Soft · luxurious · floral",
    shortDescription: "Soft, luxurious, floral. Jasmine bud, tuberose and Rangoon creeper.",
    description: "Jasmine bud extract opens fresh, green and petal-rich. Tuberose brings a rich, creamy floral heart, and Rangoon creeper — a South Indian flower that changes colour as it blooms — adds a powdery, sweet-fruited edge.",
    family: "Floral", concentration: "Eau de Parfum", image: photo("velvet-bloom"),
    imageAlt: "Velvet Bloom by Relapse Perfumes — supplied poster artwork", accent: "#a96d72", featured: true,
    notes: { top: ["Jasmine bud extract"], heart: ["Tuberose"], base: ["Rangoon Creeper"] },
    performance: { longevityHours: [6, 8], sillage: "noticeable", seasons: ["Spring", "Autumn", "Cool evenings"], occasions: ["Dinner", "Celebrations", "Everyday"], dayNight: "both", wearsLike: "fresh petals, tuberose cream and a powdery floral close" },
    gallery: [photo("velvet-bloom-bottle")],
    variants: [v8("REL-VBL-08"), v30("REL-VBL-30"), v50("REL-VBL-50")]
  },
  {
    slug: "sandalwood", sortOrder: 30, name: "Sandalwood", eyebrow: "Earthy · smooth · timeless",
    shortDescription: "Earthy, smooth, timeless. Mysore sandalwood and cedar, rich and creamy.",
    description: "Sandalwood is a rich, warm and creamy base note, driven by alpha-santalol and beta-santalol — long-lasting, velvety depth.",
    family: "Woody", concentration: "Eau de Parfum", image: photo("sandalwood"),
    imageAlt: "Sandalwood by Relapse Perfumes — supplied poster artwork", accent: "#9a7c56", featured: true,
    notes: { top: ["a smooth, warm, creamy, and milky-wood"], heart: ["Cedar"], base: ["Mysore sandalwood"] },
    performance: { longevityHours: [7, 10], sillage: "close", seasons: ["All year", "Monsoon", "Winter"], occasions: ["Office", "Travel", "Dinner"], dayNight: "both", wearsLike: "creamy sandalwood and dry cedar" },
    gallery: [photo("sandalwood-bottle")],
    variants: [v8("REL-SAN-08"), v30("REL-SAN-30"), v50("REL-SAN-50")]
  },
  {
    slug: "whisky-smoke", sortOrder: 40, name: "Whisky Smoke", eyebrow: "Rich · warm · sophisticated",
    shortDescription: "Rich, warm, sophisticated. Whisky, cinnamon and vanilla with oudh, sandalwood and leather.",
    description: "Whisky, tobacco and a sharp peppery kick open warm and boozy. Cinnamon, coriander and sweet vanilla soften the middle, and oudh, sandalwood, patchouli and rich leather leave a deep, smoky trail.",
    family: "Smoky", concentration: "Extrait de Parfum", image: photo("whisky-smoke"),
    imageAlt: "Whisky Smoke by Relapse Perfumes — supplied poster artwork", accent: "#6f5139", featured: false,
    notes: { top: ["Whisky", "Tobacco", "Sharp spice"], heart: ["Cinnamon", "Coriander", "Sweet vanilla"], base: ["Oudh (Agarwood)", "Sandalwood", "Patchouli", "Rich leather"] },
    performance: { longevityHours: [9, 12], sillage: "room-filling", seasons: ["Winter", "Autumn", "Cool nights"], occasions: ["Night out", "Occasions", "Dinner"], dayNight: "night", wearsLike: "boozy warmth, spice and smoky leather" },
    gallery: [photo("whisky-smoke-bottle")],
    variants: [v8("REL-WHS-08"), v30("REL-WHS-30"), v50("REL-WHS-50")]
  },
  {
    slug: "bold-move", sortOrder: 50, name: "Bold Move", eyebrow: "Sharp · confident · energetic",
    shortDescription: "Sharp, confident, energetic. Seawater, mint and green herbs over ambergris.",
    description: "Seawater, mint and lavender open sharp and fresh with green nuances, rosemary and coriander. Sandalwood, neroli, geranium and jasmine carry the heart, and musk, oakmoss, cedar, tobacco and ambergris ground the base.",
    family: "Fresh", concentration: "Eau de Parfum", image: photo("bold-move"),
    imageAlt: "Bold Move by Relapse Perfumes — supplied poster artwork", accent: "#53796f", featured: false,
    notes: { top: ["Seawater", "Mint", "Lavender", "Green nuances", "Rosemary", "Calone", "Coriander"], heart: ["Sandalwood", "Neroli", "Geranium", "Jasmine"], base: ["Musk", "Oakmoss", "Cedar", "Tobacco", "Ambergris"] },
    performance: { longevityHours: [5, 7], sillage: "close", seasons: ["Summer", "Spring", "Hot days"], occasions: ["Daily wear", "Office", "Travel"], dayNight: "day", wearsLike: "cold seawater, crushed green herbs and musk" },
    gallery: [photo("bold-move-bottle")],
    variants: [v8("REL-BLD-08"), v30("REL-BLD-30"), v50("REL-BLD-50")]
  },
  {
    slug: "discovery-set", sortOrder: 60, name: "Discovery Set", eyebrow: "Five scents · one case",
    shortDescription: "Five scents from the collection in one case — the guided first wear.",
    description: "Wear each fragrance on skin before committing to a bottle. The discovery set carries five scents from the collection as the safest way in.",
    family: "Fresh", concentration: "Mixed concentrations", image: photo("set-of-five-card"),
    imageAlt: "Relapse Perfumes discovery set — the five 8 ml sprays in their box", accent: "#7e766b", featured: false,
    isDiscoverySet: true,
    notes: { top: ["Five openings"], heart: ["Five signatures"], base: ["Five drydowns"] },
    performance: { longevityHours: [5, 12], sillage: "noticeable", seasons: ["All year"], occasions: ["Discovery", "Gifting"], dayNight: "both", wearsLike: "the entire collection in one box" },
    variants: [{ sku: "REL-DISC-40", label: "Set of 5 · 5 × 8 ml", sizeMl: 40, pricePaise: 39900, compareAtPaise: 59900, weightGrams: 400, kind: "discovery", preferred: "manual", mappings: [...manualOnly] }]
  }
];

async function rest(path, { method = "GET", body, prefer } = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: KEY, authorization: `Bearer ${KEY}`, "content-type": "application/json", ...(prefer ? { prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const metaFor = (p) => ({
  performance: p.performance,
  ...(p.gallery ? { gallery: p.gallery } : {}),
  ...(p.isDiscoverySet ? { isDiscoverySet: true } : {})
});

let variantTotal = 0, mappingTotal = 0;
for (const p of PRODUCTS) {
  const [product] = await rest("products?on_conflict=slug", {
    method: "POST", prefer: "resolution=merge-duplicates,return=representation",
    body: [{
      slug: p.slug, name: p.name, eyebrow: p.eyebrow, short_description: p.shortDescription,
      description: p.description, family: p.family, concentration: p.concentration,
      image_url: p.image, image_alt: p.imageAlt, accent: p.accent, notes: p.notes,
      featured: p.featured, is_active: true, sort_order: p.sortOrder, metadata: metaFor(p)
    }]
  });
  for (const v of p.variants) {
    const [variant] = await rest("variants?on_conflict=sku", {
      method: "POST", prefer: "resolution=merge-duplicates,return=representation",
      body: [{
        product_id: product.id, sku: v.sku, label: v.label, size_ml: v.sizeMl,
        price_paise: v.pricePaise, compare_at_paise: v.compareAtPaise, weight_grams: v.weightGrams,
        preferred_fulfillment_provider: v.preferred, kind: v.kind, is_active: true
      }]
    });
    variantTotal++;
    for (const m of v.mappings) {
      await rest("variant_fulfillment_mappings?on_conflict=variant_id,provider", {
        method: "POST", prefer: "resolution=merge-duplicates,return=representation",
        body: [{ variant_id: variant.id, provider: m.provider, provider_sku: m.provider_sku ?? null, inventory_sku: m.inventory_sku ?? null, enabled: m.enabled, priority: m.priority }]
      });
      mappingTotal++;
    }
  }
  console.log(`✓ ${p.slug} — ${p.variants.length} variants`);
}

const products = await rest("products?select=slug,is_active&order=sort_order");
const variants = await rest("variants?select=sku");
console.log(`\nSeeded: ${products.length} products · ${variantTotal} variants upserted (${variants.length} rows) · ${mappingTotal} mappings`);
console.log(products.map((p) => `${p.slug}${p.is_active ? "" : " (INACTIVE)"}`).join(", "));
