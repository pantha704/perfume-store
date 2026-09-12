import type { Product } from "@/lib/types";

const bottle = (slug: string) => `/products/${slug}.svg`;

export const demoProducts: Product[] = [
  {
    id: "prod_nocturne",
    slug: "nocturne-01",
    name: "Nocturne 01",
    eyebrow: "After dark",
    shortDescription: "Black pepper and cold iris folding into suede, smoked cedar and amber.",
    description: "Nocturne 01 starts mineral and bright, then slows into tactile suede and dry cedar smoke. Amber appears late and close to skin rather than shouting across a room.",
    story: "Built for evenings when the air cools and the city finally becomes quiet.",
    family: "Smoky",
    concentration: "Eau de Parfum",
    image: bottle("nocturne"),
    imageAlt: "Placeholder bottle artwork for Nocturne 01 perfume",
    accent: "#8d6c4f",
    featured: true,
    notes: { top: ["Black pepper", "Bergamot", "Elemi"], heart: ["Suede", "Iris", "Cedar"], base: ["Amber", "Vetiver", "Smoke"] },
    performance: { longevityHours: [7, 9], sillage: "noticeable", seasons: ["Autumn", "Winter", "Monsoon evenings"], occasions: ["Dinner", "Evening events", "Date night"], dayNight: "night", wearsLike: "dry woods, soft leather and warm skin" },
    variants: [
      { id: "var_nocturne_2", sku: "VEL-NOC-02", label: "2 ml sample", sizeMl: 2, pricePaise: 24900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_nocturne_10", sku: "VEL-NOC-10", label: "10 ml travel", sizeMl: 10, pricePaise: 49900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_nocturne_50", sku: "VEL-NOC-50", label: "50 ml", sizeMl: 50, pricePaise: 149900, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-NOC50", inventorySku: "REPLACE-SELLER-SKU-NOC50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-NOC-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_nocturne_100", sku: "VEL-NOC-100", label: "100 ml", sizeMl: 100, pricePaise: 229900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-NOC100", inventorySku: "REPLACE-SELLER-SKU-NOC100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-NOC-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
    ]
  },
  {
    id: "prod_velvet",
    slug: "velvet-bloom",
    name: "Velvet Bloom",
    eyebrow: "Soft power",
    shortDescription: "Saffron, rose and violet wrapped in vanilla and clean white musk.",
    description: "Velvet Bloom keeps its flowers translucent rather than syrupy. Saffron and pear lift the opening; rose and violet carry the middle; vanilla-musk warms slowly against skin.",
    story: "A floral made to feel textured, not decorative.",
    family: "Floral",
    concentration: "Eau de Parfum",
    image: bottle("velvet"),
    imageAlt: "Placeholder bottle artwork for Velvet Bloom perfume",
    accent: "#a96d72",
    featured: true,
    notes: { top: ["Saffron", "Pink pepper", "Pear"], heart: ["Rose", "Jasmine", "Violet"], base: ["Vanilla", "White musk", "Sandalwood"] },
    performance: { longevityHours: [6, 8], sillage: "noticeable", seasons: ["Spring", "Autumn", "Cool evenings"], occasions: ["Dinner", "Celebrations", "Everyday"], dayNight: "both", wearsLike: "petals, saffron and warm musky fabric" },
    variants: [
      { id: "var_velvet_2", sku: "VEL-VBL-02", label: "2 ml sample", sizeMl: 2, pricePaise: 22900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_velvet_10", sku: "VEL-VBL-10", label: "10 ml travel", sizeMl: 10, pricePaise: 44900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_velvet_50", sku: "VEL-VBL-50", label: "50 ml", sizeMl: 50, pricePaise: 139900, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-VBL50", inventorySku: "REPLACE-SELLER-SKU-VBL50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-VBL-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_velvet_100", sku: "VEL-VBL-100", label: "100 ml", sizeMl: 100, pricePaise: 219900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-VBL100", inventorySku: "REPLACE-SELLER-SKU-VBL100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-VBL-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
    ]
  },
  {
    id: "prod_sandal",
    slug: "sandalwood-atelier",
    name: "Sandalwood Atelier",
    eyebrow: "Quiet woods",
    shortDescription: "Cardamom and iris sharpen creamy sandalwood, cedar and pale musk.",
    description: "Sandalwood Atelier is polished rather than sweet: cardamom and citrus open cleanly, iris cools the centre, and sandalwood settles into dry cedar and musk.",
    story: "The smell of planed wood, linen and a room with the windows open.",
    family: "Woody",
    concentration: "Eau de Parfum",
    image: bottle("sandalwood"),
    imageAlt: "Placeholder bottle artwork for Sandalwood Atelier perfume",
    accent: "#9a7c56",
    featured: true,
    notes: { top: ["Cardamom", "Lemon peel", "Juniper"], heart: ["Sandalwood", "Cypress", "Iris"], base: ["Cedar", "Musk", "Amberwood"] },
    performance: { longevityHours: [7, 10], sillage: "close", seasons: ["All year", "Monsoon", "Winter"], occasions: ["Office", "Travel", "Dinner"], dayNight: "both", wearsLike: "creamy wood cut with dry spice and clean air" },
    variants: [
      { id: "var_sandal_2", sku: "VEL-SAN-02", label: "2 ml sample", sizeMl: 2, pricePaise: 24900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_sandal_10", sku: "VEL-SAN-10", label: "10 ml travel", sizeMl: 10, pricePaise: 54900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_sandal_100", sku: "VEL-SAN-100", label: "100 ml", sizeMl: 100, pricePaise: 239900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-SAN100", inventorySku: "REPLACE-SELLER-SKU-SAN100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-SAN-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
    ]
  },
  {
    id: "prod_whiskey",
    slug: "whiskey-smoke",
    name: "Whiskey Smoke",
    eyebrow: "Barrel room",
    shortDescription: "Dried plum, toasted oak and labdanum with tobacco leaf and patchouli.",
    description: "Whiskey Smoke is warm and resinous without smelling literal. Dried fruit and spice move into toasted oak, labdanum and tobacco leaf before the base becomes earthy and soft.",
    story: "A dark room, an old wooden bar and the last light of the day.",
    family: "Amber",
    concentration: "Extrait de Parfum",
    image: bottle("whiskey"),
    imageAlt: "Placeholder bottle artwork for Whiskey Smoke perfume",
    accent: "#6f5139",
    featured: false,
    notes: { top: ["Dried plum", "Cinnamon", "Orange"], heart: ["Toasted oak", "Labdanum", "Tobacco leaf"], base: ["Patchouli", "Amber", "Vanilla"] },
    performance: { longevityHours: [9, 12], sillage: "room-filling", seasons: ["Winter", "Autumn", "Cool nights"], occasions: ["Night out", "Occasions", "Dinner"], dayNight: "night", wearsLike: "toasted wood, dried fruit and warm resin" },
    variants: [
      { id: "var_whiskey_2", sku: "VEL-WHS-02", label: "2 ml sample", sizeMl: 2, pricePaise: 27900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_whiskey_10", sku: "VEL-WHS-10", label: "10 ml travel", sizeMl: 10, pricePaise: 64900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_whiskey_50", sku: "VEL-WHS-50", label: "50 ml", sizeMl: 50, pricePaise: 179900, available: true, kind: "bottle", weightGrams: 340, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-WHS50", inventorySku: "REPLACE-SELLER-SKU-WHS50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-WHS-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
    ]
  },
  {
    id: "prod_bold",
    slug: "boldmove",
    name: "Boldmove",
    eyebrow: "Daylight energy",
    shortDescription: "Grapefruit and mint over aromatic herbs, vetiver and mineral woods.",
    description: "Boldmove is the bright counterpoint in the collection. Citrus snaps open, herbs keep the heart dry and green, and mineral woods give the finish enough structure for heat and movement.",
    story: "Made for sun, movement and shirtsleeves rather than ceremony.",
    family: "Fresh",
    concentration: "Eau de Parfum",
    image: bottle("boldmove"),
    imageAlt: "Placeholder bottle artwork for Boldmove perfume",
    accent: "#53796f",
    featured: false,
    notes: { top: ["Grapefruit", "Mandarin", "Mint"], heart: ["Lavender", "Clary sage", "Geranium"], base: ["Vetiver", "Mineral woods", "Musk"] },
    performance: { longevityHours: [5, 7], sillage: "close", seasons: ["Summer", "Spring", "Hot days"], occasions: ["Daily wear", "Office", "Travel"], dayNight: "day", wearsLike: "cold citrus, crushed herbs and dry stone" },
    variants: [
      { id: "var_bold_2", sku: "VEL-BLD-02", label: "2 ml sample", sizeMl: 2, pricePaise: 19900, available: true, kind: "sample", weightGrams: 40, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_bold_10", sku: "VEL-BLD-10", label: "10 ml travel", sizeMl: 10, pricePaise: 39900, available: true, kind: "travel", weightGrams: 90, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_bold_50", sku: "VEL-BLD-50", label: "50 ml", sizeMl: 50, pricePaise: 119900, available: true, kind: "bottle", weightGrams: 320, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-BLD50", inventorySku: "REPLACE-SELLER-SKU-BLD50", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-BLD-50", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] },
      { id: "var_bold_100", sku: "VEL-BLD-100", label: "100 ml", sizeMl: 100, pricePaise: 189900, available: true, kind: "bottle", weightGrams: 480, preferredFulfillmentProvider: "amazon_mcf", fulfillmentMappings: [{ provider: "amazon_mcf", providerSku: "REPLACE-AMAZON-SKU-BLD100", inventorySku: "REPLACE-SELLER-SKU-BLD100", enabled: false, priority: 10 }, { provider: "shiprocket", providerSku: "VEL-BLD-100", enabled: false, priority: 20 }, { provider: "manual", enabled: true, priority: 100 }] }
    ]
  },
  {
    id: "prod_discovery",
    slug: "discovery-set",
    name: "Discovery Set",
    eyebrow: "Five scents · one decision",
    shortDescription: "Five 2 ml vials across the collection, packed as a guided first wear.",
    description: "Wear each fragrance on skin before committing to a bottle. The discovery set contains 2 ml of every core scent and is designed as the safest way into the collection.",
    story: "A week of testing is more useful than a hundred adjectives.",
    family: "Fresh",
    concentration: "Mixed concentrations",
    image: "/products/discovery.svg",
    imageAlt: "Placeholder artwork showing the VELORA discovery set",
    accent: "#7e766b",
    featured: false,
    isDiscoverySet: true,
    notes: { top: ["Five openings"], heart: ["Five signatures"], base: ["Five drydowns"] },
    performance: { longevityHours: [5, 12], sillage: "noticeable", seasons: ["All year"], occasions: ["Discovery", "Gifting"], dayNight: "both", wearsLike: "the entire collection in one box" },
    variants: [
      { id: "var_discovery_10", sku: "VEL-DISC-10", label: "5 × 2 ml", sizeMl: 10, pricePaise: 79900, available: true, kind: "discovery", weightGrams: 160, preferredFulfillmentProvider: "manual", fulfillmentMappings: [{ provider: "manual", enabled: true, priority: 100 }] }
    ]
  }
];

export function demoProductBySlug(slug: string): Product | undefined {
  return demoProducts.find((product) => product.slug === slug);
}
