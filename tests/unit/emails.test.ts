import { describe, expect, it } from "vitest";
import { escapeHtml, orderConfirmedEmail, orderDispatchedEmail } from "../../lib/emails";

const data = {
  publicId: "REL-1001",
  customerName: "Ayush",
  totalPaise: 39900,
  items: [{ productName: "Velvet Bloom", variantLabel: "8 ml", quantity: 1, lineTotalPaise: 9900 }]
};

describe("order emails", () => {
  it("builds a confirmation with items, total and order id", () => {
    const { subject, html } = orderConfirmedEmail(data);
    expect(subject).toContain("REL-1001");
    expect(html).toContain("Velvet Bloom");
    expect(html).toContain("₹399");
  });

  it("includes the tracking number in the dispatched email", () => {
    const { subject, html } = orderDispatchedEmail({ ...data, trackingNumber: "EE123456789IN", trackingUrl: "https://indiapost.example/track" });
    expect(subject).toContain("on its way");
    expect(html).toContain("EE123456789IN");
    expect(html).toContain("indiapost.example");
  });

  it("escapes hostile content", () => {
    expect(escapeHtml('<script>"x"</script>')).toBe("&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
  });
});
