import { describe, expect, it } from "vitest";
import { formatINR, pricePerMl } from "../../lib/money";
describe("money",()=>{it("keeps amounts in paise",()=>{expect(formatINR(149900)).toContain("1,499");expect(pricePerMl(149900,50)).toContain("30");});});
