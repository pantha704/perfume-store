import { cache } from "react";
import { demoProducts } from "@/data/demo-products";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/runtime-env";
import type { Product, ProductVariant } from "@/lib/types";

interface DbMapping { provider: string; provider_sku: string | null; inventory_sku: string | null; enabled: boolean; priority: number; }
interface DbVariant {
  id: string; sku: string; label: string; size_ml: number; price_paise: number; compare_at_paise: number | null;
  is_active: boolean; preferred_fulfillment_provider: string | null; weight_grams: number; kind?: string | null;
  variant_fulfillment_mappings?: DbMapping[];
}
interface DbProduct {
  id: string; slug: string; name: string; eyebrow: string; short_description: string; description: string;
  family: Product["family"]; concentration: string; image_url: string; image_alt: string; accent: string;
  notes: Product["notes"]; featured: boolean; metadata?: Record<string, unknown> | null; variants: DbVariant[];
}

function mapProduct(row: DbProduct): Product {
  const meta = row.metadata || {};
  const performance = (meta.performance || {}) as Partial<Product["performance"]>;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    eyebrow: row.eyebrow,
    shortDescription: row.short_description,
    description: row.description,
    family: row.family,
    concentration: row.concentration,
    image: row.image_url,
    imageAlt: row.image_alt,
    accent: row.accent,
    notes: row.notes,
    featured: row.featured,
    story: typeof meta.story === "string" ? meta.story : undefined,
    isDiscoverySet: meta.isDiscoverySet === true,
    performance: {
      longevityHours: Array.isArray(performance.longevityHours) ? performance.longevityHours as [number, number] : [6, 8],
      sillage: performance.sillage || "noticeable",
      seasons: performance.seasons || ["All year"],
      occasions: performance.occasions || ["Everyday"],
      dayNight: performance.dayNight || "both",
      wearsLike: performance.wearsLike || "a balanced fragrance profile",
      perfumer: performance.perfumer,
      year: performance.year,
    },
    variants: (row.variants || []).map((v): ProductVariant => ({
      id: v.id,
      sku: v.sku,
      label: v.label,
      sizeMl: v.size_ml,
      pricePaise: v.price_paise,
      compareAtPaise: v.compare_at_paise,
      available: v.is_active,
      kind: (v.kind || (v.size_ml <= 2 ? "sample" : v.size_ml <= 15 ? "travel" : "bottle")) as ProductVariant["kind"],
      weightGrams: v.weight_grams || 300,
      preferredFulfillmentProvider: v.preferred_fulfillment_provider || undefined,
      fulfillmentMappings: (v.variant_fulfillment_mappings || []).map((m) => ({
        provider: m.provider,
        providerSku: m.provider_sku || undefined,
        inventorySku: m.inventory_sku || undefined,
        enabled: m.enabled,
        priority: m.priority,
      })),
    })),
  };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = getAdminSupabase();
  if (isDemoMode() || !supabase) return demoProducts;
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*, variant_fulfillment_mappings(provider,provider_sku,inventory_sku,enabled,priority))")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(`Catalogue query failed: ${error.message}`);
  return (data as DbProduct[]).map(mapProduct);
});

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) || null;
}

export async function getProductsByFamily(family: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.family.toLowerCase() === family.toLowerCase() && !product.isDiscoverySet);
}

export async function getVariantsByIds(ids: string[]): Promise<Array<{ product: Product; variant: ProductVariant }>> {
  const wanted = new Set(ids);
  const products = await getProducts();
  const results: Array<{ product: Product; variant: ProductVariant }> = [];
  for (const product of products) for (const variant of product.variants) if (wanted.has(variant.id)) results.push({ product, variant });
  return results;
}

export async function getAllNotes(): Promise<Array<{ name: string; products: Product[] }>> {
  const products = await getProducts();
  const notes = new Map<string, Product[]>();
  for (const product of products.filter((p) => !p.isDiscoverySet)) {
    for (const note of [...product.notes.top, ...product.notes.heart, ...product.notes.base]) {
      const key = note.trim();
      const bucket = notes.get(key) || [];
      if (!bucket.some((p) => p.id === product.id)) bucket.push(product);
      notes.set(key, bucket);
    }
  }
  return [...notes.entries()].map(([name, noteProducts]) => ({ name, products: noteProducts })).sort((a, b) => a.name.localeCompare(b.name));
}
