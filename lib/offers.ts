export interface Offer {
  id: string;
  kicker: string;
  title: string;
  note: string;
  cta: string;
  href: string;
  accent: string;
  /** Background perfume image for the card (client art); moves inversely on hover. */
  image: string;
}

/** Home-page offer banners. Client prices; wording can be swapped anytime. */
export const OFFERS: Offer[] = [
  {
    id: "set-of-five",
    kicker: "The bundle",
    title: "Set of 5 — ₹399",
    note: "All five scents, 5 × 8 ml each. Wear the house for a fortnight before choosing a bottle.",
    cta: "Build your discovery",
    href: "/samples",
    accent: "#9c9aa0",
    image: "/products/relapse/lineup.webp",
  },
  {
    id: "entry-size",
    kicker: "Entry size",
    title: "8 ml — ₹99",
    note: "The lowest-risk way to live with a scent for a full day — in heat, indoors and at the end of it.",
    cta: "Shop the scents",
    href: "/shop",
    accent: "#757245",
    image: "/products/relapse/invictus.webp",
  },
  {
    id: "credit-back",
    kicker: "Credit back",
    title: "The set pays for itself",
    note: "Your ₹399 returns as store credit toward a full bottle. Ninety days to decide.",
    cta: "How the credit works",
    href: "/samples",
    accent: "#804b21",
    image: "/products/relapse/sandalwood.webp",
  },
];
