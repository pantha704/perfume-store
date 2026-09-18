import type { FulfillmentMapping, Product } from "@/lib/types";

// Real product data reconstructed from client-supplied material (WhatsApp chat
// notes, supplied posters and the printed catalogue card).
//
// PRICES (2026-09-18): sell prices are CLIENT-SUPPLIED — 8 ml ₹99 · 30 ml ₹299 ·
// 50 ml ₹449 · Set of 5 ₹399. Compare-at (MRP) values are realistic DEMO
// ASSUMPTIONS (consistent ~33% off) pending the client's final MRP list.
// Everything else not yet supplied (SKUs, weights, performance metrics) stays a
// clearly-placeholder demo value — see docs/asset-placement-audit.md.
const photo = (slug: string) => `/products/relapse/${slug}.webp`;

const manualOnly: FulfillmentMapping[] = [{ provider: "manual", enabled: true, priority: 100 }];
const bottleMappings = (sku: string): FulfillmentMapping[] => [
  { provider: "amazon_mcf", providerSku: `REPLACE-AMAZON-SKU-${sku}`, inventorySku: `REPLACE-SELLER-SKU-${sku}`, enabled: false, priority: 10 },
  { provider: "shiprocket", providerSku: sku, enabled: false, priority: 20 },
  { provider: "manual", enabled: true, priority: 100 },
];

export const demoProducts: Product[] = [
  {
    id: "prod_invictus",
    slug: "invictus",
    name: "Invictus",
    eyebrow: "The scent of luxury",
    shortDescription: "Powerful, fresh, oceanic. Sea notes, grapefruit and mandarin orange.",
    description: "Sea notes, grapefruit and mandarin orange open bright and oceanic. Bay leaf and jasmine carry the middle, before ambergris, guaiac wood, oakmoss and patchouli settle the base.",
    family: "Fresh",
    concentration: "Eau de Parfum",
    image: photo("invictus"),
    imageAlt: "Invictus by Relapse Perfumes — supplied poster artwork",
    accent: "#8d6c4f",
    featured: true,
    notes: { top: ["Sea notes", "Grapefruit", "Mandarin orange"], heart: ["Bay leaf", "Jasmine"], base: ["Ambergris", "Guaiac wood", "Oakmoss", "Patchouli"] },
    performance: { longevityHours: [7, 9], sillage: "noticeable", seasons: ["Summer", "Monsoon", "All year"], occasions: ["Everyday", "Office", "Evening"], dayNight: "both", wearsLike: "sea air, bright citrus and warm ambergris" },
    variants: [
      { id: "var_invictus_08", sku: "REL-INV-08", label: "8 ml", sizeMl: 8, pricePaise: 9900, compareAtPaise: 14900, available: true, kind: "travel", weightGrams: 60, preferredFulfillmentProvider: "manual", fulfillmentMappings: [...manualOnly] },
      { id: "var_invictus_30", sku: "REL-INV-30", label: "30 ml", sizeMl: 30, pricePaise: 29900, compareAtPaise: 44900, available: true, kind: "bottle", weightGrams: 180, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-INV-30") },
      { id: "var_invictus_50", sku: "REL-INV-50", label: "50 ml", sizeMl: 50, pricePaise: 44900, compareAtPaise: 67500, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-INV-50") }
    ]
  },
  {
    id: "prod_velvet",
    slug: "velvet-bloom",
    name: "Velvet Bloom",
    eyebrow: "Soft · luxurious · floral",
    shortDescription: "Soft, luxurious, floral. Jasmine bud, tuberose and Rangoon creeper.",
    description: "Jasmine bud extract opens fresh, green and petal-rich. Tuberose brings a rich, creamy floral heart, and Rangoon creeper — a South Indian flower that changes colour as it blooms — adds a powdery, sweet-fruited edge.",
    family: "Floral",
    concentration: "Eau de Parfum",
    image: photo("velvet-bloom"),
    imageAlt: "Velvet Bloom by Relapse Perfumes — supplied poster artwork",
    accent: "#a96d72",
    featured: true,
    notes: { top: ["Jasmine bud extract"], heart: ["Tuberose"], base: ["Rangoon Creeper"] },
    performance: { longevityHours: [6, 8], sillage: "noticeable", seasons: ["Spring", "Autumn", "Cool evenings"], occasions: ["Dinner", "Celebrations", "Everyday"], dayNight: "both", wearsLike: "fresh petals, tuberose cream and a powdery floral close" },
    variants: [
      { id: "var_velvet_08", sku: "REL-VBL-08", label: "8 ml", sizeMl: 8, pricePaise: 9900, compareAtPaise: 14900, available: true, kind: "travel", weightGrams: 60, preferredFulfillmentProvider: "manual", fulfillmentMappings: [...manualOnly] },
      { id: "var_velvet_30", sku: "REL-VBL-30", label: "30 ml", sizeMl: 30, pricePaise: 29900, compareAtPaise: 44900, available: true, kind: "bottle", weightGrams: 180, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-VBL-30") },
      { id: "var_velvet_50", sku: "REL-VBL-50", label: "50 ml", sizeMl: 50, pricePaise: 44900, compareAtPaise: 67500, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-VBL-50") }
    ]
  },
  {
    id: "prod_sandal",
    slug: "sandalwood",
    name: "Sandalwood",
    eyebrow: "Earthy · smooth · timeless",
    shortDescription: "Earthy, smooth, timeless. Mysore sandalwood and cedar, rich and creamy.",
    description: "A rich, warm and creamy sandalwood profile built on Mysore sandalwood and cedar — long-lasting, velvety depth.",
    family: "Woody",
    concentration: "Eau de Parfum",
    image: photo("sandalwood"),
    imageAlt: "Sandalwood by Relapse Perfumes — supplied poster artwork",
    accent: "#9a7c56",
    featured: true,
    notes: { top: ["Mysore sandalwood"], heart: ["Cedar"], base: ["Creamy woods"] },
    performance: { longevityHours: [7, 10], sillage: "close", seasons: ["All year", "Monsoon", "Winter"], occasions: ["Office", "Travel", "Dinner"], dayNight: "both", wearsLike: "creamy sandalwood and dry cedar" },
    variants: [
      { id: "var_sandal_08", sku: "REL-SAN-08", label: "8 ml", sizeMl: 8, pricePaise: 9900, compareAtPaise: 14900, available: true, kind: "travel", weightGrams: 60, preferredFulfillmentProvider: "manual", fulfillmentMappings: [...manualOnly] },
      { id: "var_sandal_30", sku: "REL-SAN-30", label: "30 ml", sizeMl: 30, pricePaise: 29900, compareAtPaise: 44900, available: true, kind: "bottle", weightGrams: 180, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-SAN-30") },
      { id: "var_sandal_50", sku: "REL-SAN-50", label: "50 ml", sizeMl: 50, pricePaise: 44900, compareAtPaise: 67500, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-SAN-50") }
    ]
  },
  {
    id: "prod_whisky",
    slug: "whisky-smoke",
    name: "Whisky Smoke",
    eyebrow: "Rich · warm · sophisticated",
    shortDescription: "Rich, warm, sophisticated. Whisky, cinnamon and vanilla with oudh, sandalwood and leather.",
    description: "Whisky, tobacco and a sharp peppery kick open warm and boozy. Cinnamon, coriander and sweet vanilla soften the middle, and oudh, sandalwood, patchouli and rich leather leave a deep, smoky trail.",
    family: "Smoky",
    concentration: "Extrait de Parfum",
    image: photo("whisky-smoke"),
    imageAlt: "Whisky Smoke by Relapse Perfumes — supplied poster artwork",
    accent: "#6f5139",
    featured: false,
    notes: { top: ["Whisky", "Tobacco", "Sharp spice"], heart: ["Cinnamon", "Coriander", "Sweet vanilla"], base: ["Oudh (Agarwood)", "Sandalwood", "Patchouli", "Rich leather"] },
    performance: { longevityHours: [9, 12], sillage: "room-filling", seasons: ["Winter", "Autumn", "Cool nights"], occasions: ["Night out", "Occasions", "Dinner"], dayNight: "night", wearsLike: "boozy warmth, spice and smoky leather" },
    variants: [
      { id: "var_whisky_08", sku: "REL-WHS-08", label: "8 ml", sizeMl: 8, pricePaise: 9900, compareAtPaise: 14900, available: true, kind: "travel", weightGrams: 60, preferredFulfillmentProvider: "manual", fulfillmentMappings: [...manualOnly] },
      { id: "var_whisky_30", sku: "REL-WHS-30", label: "30 ml", sizeMl: 30, pricePaise: 29900, compareAtPaise: 44900, available: true, kind: "bottle", weightGrams: 180, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-WHS-30") },
      { id: "var_whisky_50", sku: "REL-WHS-50", label: "50 ml", sizeMl: 50, pricePaise: 44900, compareAtPaise: 67500, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-WHS-50") }
    ]
  },
  {
    id: "prod_bold",
    slug: "bold-move",
    name: "Bold Move",
    eyebrow: "Sharp · confident · energetic",
    shortDescription: "Sharp, confident, energetic. Seawater, mint and green herbs over ambergris.",
    description: "Seawater, mint and lavender open sharp and fresh with green nuances, rosemary and coriander. Sandalwood, neroli, geranium and jasmine carry the heart, and musk, oakmoss, cedar, tobacco and ambergris ground the base.",
    family: "Fresh",
    concentration: "Eau de Parfum",
    image: photo("bold-move"),
    imageAlt: "Bold Move by Relapse Perfumes — supplied poster artwork",
    accent: "#53796f",
    featured: false,
    notes: { top: ["Seawater", "Mint", "Lavender", "Green nuances", "Rosemary", "Calone", "Coriander"], heart: ["Sandalwood", "Neroli", "Geranium", "Jasmine"], base: ["Musk", "Oakmoss", "Cedar", "Tobacco", "Ambergris"] },
    performance: { longevityHours: [5, 7], sillage: "close", seasons: ["Summer", "Spring", "Hot days"], occasions: ["Daily wear", "Office", "Travel"], dayNight: "day", wearsLike: "cold seawater, crushed green herbs and musk" },
    variants: [
      { id: "var_bold_08", sku: "REL-BLD-08", label: "8 ml", sizeMl: 8, pricePaise: 9900, compareAtPaise: 14900, available: true, kind: "travel", weightGrams: 60, preferredFulfillmentProvider: "manual", fulfillmentMappings: [...manualOnly] },
      { id: "var_bold_30", sku: "REL-BLD-30", label: "30 ml", sizeMl: 30, pricePaise: 29900, compareAtPaise: 44900, available: true, kind: "bottle", weightGrams: 180, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-BLD-30") },
      { id: "var_bold_50", sku: "REL-BLD-50", label: "50 ml", sizeMl: 50, pricePaise: 44900, compareAtPaise: 67500, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: bottleMappings("REL-BLD-50") }
    ]
  },
  {
    id: "prod_discovery",
    slug: "discovery-set",
    name: "Discovery Set",
    eyebrow: "Five scents · one case",
    shortDescription: "Five scents from the collection in one case — the guided first wear.",
    description: "Wear each fragrance on skin before committing to a bottle. The discovery set carries five scents from the collection as the safest way in.",
    family: "Fresh",
    concentration: "Mixed concentrations",
    image: photo("discovery-set"),
    imageAlt: "Relapse Perfumes discovery set — supplied photograph of the five-spray case",
    accent: "#7e766b",
    featured: false,
    isDiscoverySet: true,
    notes: { top: ["Five openings"], heart: ["Five signatures"], base: ["Five drydowns"] },
    performance: { longevityHours: [5, 12], sillage: "noticeable", seasons: ["All year"], occasions: ["Discovery", "Gifting"], dayNight: "both", wearsLike: "the entire collection in one box" },
    variants: [
      { id: "var_discovery_40", sku: "REL-DISC-40", label: "Set of 5 · 5 × 8 ml", sizeMl: 40, pricePaise: 39900, compareAtPaise: 59900, available: true, kind: "discovery", weightGrams: 400, preferredFulfillmentProvider: "manual", fulfillmentMappings: [...manualOnly] }
    ]
  }
];

export function demoProductBySlug(slug: string): Product | undefined {
  return demoProducts.find((product) => product.slug === slug);
}
