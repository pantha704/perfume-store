import { describe, expect, it } from "vitest";
import { INVOICE_SELLER, formatIstDateTime } from "../../lib/invoice";

describe("invoice formatting", () => {
  it("formats IST date-time deterministically", () => {
    expect(formatIstDateTime("2026-10-12T16:29:59.90769Z")).toBe("12 Oct 2026, 9:59 pm IST");
    expect(formatIstDateTime("2026-10-12T18:30:00.000Z")).toBe("13 Oct 2026, 12:00 am IST");
    expect(formatIstDateTime(null)).toBe("—");
    expect(formatIstDateTime("nonsense")).toBe("—");
  });

  it("keeps seller details ready for the client's registered info", () => {
    expect(INVOICE_SELLER.name).toBe("Relapse Perfumes");
    expect(INVOICE_SELLER.lines).toEqual([]);
    expect(INVOICE_SELLER.gstin).toBeNull();
  });
});
