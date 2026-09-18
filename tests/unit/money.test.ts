import { describe, expect, it } from "vitest";
import { discountPercent, formatINR, pricePerMl } from "../../lib/money";
describe("money",()=>{it("keeps amounts in paise",()=>{expect(formatINR(149900)).toContain("1,499");expect(pricePerMl(149900,50)).toContain("30");});});
describe("discountPercent",()=>{
  it("computes the store badge percentage",()=>{
    expect(discountPercent(9900,14900)).toBe(34);
    expect(discountPercent(29900,44900)).toBe(33);
    expect(discountPercent(39900,59900)).toBe(33);
  });
  it("returns 0 without a compare-at price",()=>{
    expect(discountPercent(9900)).toBe(0);
    expect(discountPercent(9900,null)).toBe(0);
  });
  it("never reports a negative or zero discount",()=>{
    expect(discountPercent(14900,9900)).toBe(0);
    expect(discountPercent(9900,9900)).toBe(0);
  });
});
