import { describe, expect, it } from "vitest";
import { scoreQuiz } from "../../lib/quiz";
import { demoProducts } from "../../data/demo-products";
describe("quiz",()=>{it("returns three explainable products",()=>{const result=scoreQuiz(demoProducts,{family:"Woody",intensity:"close",season:"monsoon",occasion:"office",mood:"dry",avoid:"sweet"});expect(result).toHaveLength(3);expect(result[0].reason.length).toBeGreaterThan(20);});});
