import type { FragranceFamily, Product } from "@/lib/types";

export interface QuizAnswers {
  family?: string;
  intensity?: string;
  season?: string;
  occasion?: string;
  mood?: string;
  avoid?: string;
  favourite?: string;
}

const intensityWeight: Record<string, number> = { intimate: 1, close: 2, noticeable: 3, "room-filling": 4 };
const moodFamilies: Record<string, FragranceFamily[]> = {
  clean: ["Fresh", "Floral"], dry: ["Woody", "Smoky"], soft: ["Floral", "Amber", "Woody"], dark: ["Smoky", "Amber", "Woody"],
};
const seasonWords: Record<string, string[]> = { summer:["summer","all year"], monsoon:["monsoon","all year"], autumn:["autumn","cool evenings","all year"], winter:["winter","cool evenings","all year"] };
const occasionWords: Record<string, string[]> = { office:["office","travel","everyday"], everyday:["everyday","office","travel"], dinner:["dinner","date night"], events:["evening events","celebrations","dinner"] };

export function scoreQuiz(products: Product[], answers: QuizAnswers): Array<{ product: Product; score: number; reason: string }> {
  const avoid = (answers.avoid || "").toLowerCase();
  return products.filter((p) => !p.isDiscoverySet).map((product) => {
    let score = 0;
    if (answers.family?.toLowerCase() === product.family.toLowerCase()) score += 9;
    const desiredPresence = intensityWeight[answers.intensity || ""];
    const actualPresence = intensityWeight[product.performance.sillage] || 2;
    if (desiredPresence) score += Math.max(0, 4 - Math.abs(desiredPresence - actualPresence) * 2);
    if ((seasonWords[answers.season || ""] || []).some((word) => product.performance.seasons.some((s) => s.toLowerCase().includes(word)))) score += 3;
    if ((occasionWords[answers.occasion || ""] || []).some((word) => product.performance.occasions.some((s) => s.toLowerCase().includes(word)))) score += 3;
    if ((moodFamilies[answers.mood || ""] || []).includes(product.family)) score += 3;
    const haystack = [product.family, product.shortDescription, product.performance.wearsLike, ...product.notes.top, ...product.notes.heart, ...product.notes.base].join(" ").toLowerCase();
    if (avoid === "sweet" && /vanilla|tonka|gourmand|sweet/.test(haystack)) score -= 5;
    if (avoid && avoid !== "sweet" && haystack.includes(avoid)) score -= 6;
    const reason = `Because you leaned ${answers.family || "toward this family"}, ${answers.intensity || "balanced"} in presence, and ${answers.mood || "textural"}: ${product.performance.wearsLike}.`;
    return { product, score, reason };
  }).sort((a,b)=>b.score-a.score);
}
