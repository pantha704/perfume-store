import type { Product } from "@/lib/types";

// Real product data reconstructed from client-supplied material (WhatsApp chat
// notes, supplied posters and the printed catalogue card). Fields the client has
// not supplied yet (prices, SKUs, sizes, performance metrics) remain clearly
// placeholder demo values — see docs/asset-placement-audit.md.
const photo = (slug: string) => `/products/relapse/${slug}.webp`;

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
      { id: "var_invictus_2", sku: "REL-INV-02", label: "2 ml sample", sizeMl: 2, pricePaise: 24900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_invictus_10", sku: "REL-INV-10", label: "10 ml travel", sizeMl: 10, pricePaise: 49900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_invictus_50", sku: "REL-INV-50", label: "50 ml", sizeMl: 50, pricePaise: 149900, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-INV50", inventorySku: "REPLACE-SELLER-SKU-INV50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-INV-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_invictus_100", sku: "REL-INV-100", label: "100 ml", sizeMl: 100, pricePaise: 229900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-INV100", inventorySku: "REPLACE-SELLER-SKU-INV100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-INV-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
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
      { id: "var_velvet_2", sku: "REL-VBL-02", label: "2 ml sample", sizeMl: 2, pricePaise: 22900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_velvet_10", sku: "REL-VBL-10", label: "10 ml travel", sizeMl: 10, pricePaise: 44900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_velvet_50", sku: "REL-VBL-50", label: "50 ml", sizeMl: 50, pricePaise: 139900, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-VBL50", inventorySku: "REPLACE-SELLER-SKU-VBL50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-VBL-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_velvet_100", sku: "REL-VBL-100", label: "100 ml", sizeMl: 100, pricePaise: 219900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-VBL100", inventorySku: "REPLACE-SELLER-SKU-VBL100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-VBL-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
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
      { id: "var_sandal_2", sku: "REL-SAN-02", label: "2 ml sample", sizeMl: 2, pricePaise: 24900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_sandal_10", sku: "REL-SAN-10", label: "10 ml travel", sizeMl: 10, pricePaise: 54900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_sandal_100", sku: "REL-SAN-100", label: "100 ml", sizeMl: 100, pricePaise: 239900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-SAN100", inventorySku: "REPLACE-SELLER-SKU-SAN100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-SAN-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
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
      { id: "var_whisky_2", sku: "REL-WHS-02", label: "2 ml sample", sizeMl: 2, pricePaise: 27900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_whisky_10", sku: "REL-WHS-10", label: "10 ml travel", sizeMl: 10, pricePaise: 64900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_whisky_50", sku: "REL-WHS-50", label: "50 ml", sizeMl: 50, pricePaise: 179900, available: true, kind: "bottle", weightGrams: 340, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-WHS50", inventorySku: "REPLACE-SELLER-SKU-WHS50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-WHS-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
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
      { id: "var_bold_2", sku: "REL-BLD-02", label: "2 ml sample", sizeMl: 2, pricePaise: 19900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_bold_10", sku: "REL-BLD-10", label: "10 ml travel", sizeMl: 10, pricePaise: 39900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_bold_50", sku: "REL-BLD-50", label: "50 ml", sizeMl: 50, pricePaise: 119900, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-BLD50", inventorySku: "REPLACE-SELLER-SKU-BLD50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-BLD-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_bold_100", sku: "REL-BLD-100", label: "100 ml", sizeMl: 100, pricePaise: 189900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-BLD100", inventorySku: "REPLACE-SELLER-SKU-BLD100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "REL-BLD-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
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
      { id: "var_discovery_10", sku: "REL-DISC-10", label: "5 × 2 ml", sizeMl: 10, pricePaise: 79900, available: true, kind: "discovery", weightGrams: 160, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] }
    ]
  }
];

export function demoProductBySlug(slug: string): Product | undefined {
  return demoProducts.find((product) => product.slug === slug);
}
