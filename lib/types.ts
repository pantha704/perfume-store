export type FragranceFamily = "Woody" | "Floral" | "Amber" | "Fresh" | "Gourmand" | "Smoky";
export type VariantKind = "sample" | "travel" | "bottle" | "discovery";
export type FulfillmentState =
  | "unfulfilled"
  | "submitted"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "attention_required";

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragrancePerformance {
  longevityHours: [number, number];
  sillage: "intimate" | "close" | "noticeable" | "room-filling";
  seasons: string[];
  occasions: string[];
  dayNight: "day" | "night" | "both";
  wearsLike: string;
  perfumer?: string;
  year?: number;
}

export interface FulfillmentMapping {
  provider: string;
  providerSku?: string;
  inventorySku?: string;
  enabled: boolean;
  priority: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  sizeMl: number;
  pricePaise: number;
  compareAtPaise?: number | null;
  available: boolean;
  kind: VariantKind;
  weightGrams: number;
  preferredFulfillmentProvider?: string;
  fulfillmentMappings: FulfillmentMapping[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  shortDescription: string;
  description: string;
  family: FragranceFamily;
  concentration: string;
  image: string;
  imageAlt: string;
  /** Additional product photos for the PDP gallery (first image stays `image`). */
  gallery?: string[];
  accent: string;
  notes: FragranceNotes;
  featured: boolean;
  variants: ProductVariant[];
  performance: FragrancePerformance;
  story?: string;
  isDiscoverySet?: boolean;
}

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: "IN";
}

export interface GiftOptions {
  isGift: boolean;
  note?: string;
  hidePriceOnPackingSlip?: boolean;
}

export interface NormalizedOrderStatus {
  orderId: string;
  paymentStatus: "pending" | "paid" | "failed" | "refund_pending" | "refunded";
  fulfillmentStatus: FulfillmentState;
  provider: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  updatedAt: string;
}
