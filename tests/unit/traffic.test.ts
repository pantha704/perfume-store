import { describe, expect, it } from "vitest";
import { summarizeTraffic } from "../../lib/admin-stats";

const row = (event_name: string, created_at: string, extra: { anonymous_id?: string | null; properties?: Record<string, unknown> | null } = {}) => ({
  event_name,
  created_at,
  anonymous_id: extra.anonymous_id ?? "a1",
  properties: extra.properties ?? null
});

describe("traffic summary", () => {
  it("aggregates views, visitors, top paths and the funnel", () => {
    const rows = [
      row("page_view", "2026-10-13T10:00:00Z", { anonymous_id: "a1", properties: { path: "/" } }),
      row("page_view", "2026-10-13T10:05:00Z", { anonymous_id: "a2", properties: { path: "/" } }),
      row("page_view", "2026-10-12T10:00:00Z", { anonymous_id: "a1", properties: { path: "/shop" } }),
      row("page_view", "2026-10-01T10:00:00Z", { anonymous_id: "a3", properties: { path: "/old" } }),
      row("product_view", "2026-10-13T10:06:00Z", { anonymous_id: "a1" }),
      row("add_to_cart", "2026-10-13T10:07:00Z", { anonymous_id: "a1" }),
      row("vibe_submitted", "2026-10-13T10:08:00Z", { anonymous_id: "a1" })
    ];
    const summary = summarizeTraffic(rows, "2026-10-07T00:00:00Z");
    expect(summary.pageviews30).toBe(4);
    expect(summary.pageviews7).toBe(3);
    expect(summary.visitors7).toBe(2);
    expect(summary.visitors30).toBe(3);
    expect(summary.topPaths[0]).toEqual({ path: "/", views: 2 });
    expect(summary.productViews30).toBe(1);
    expect(summary.addToCart30).toBe(1);
    expect(summary.vibeRequests30).toBe(1);
    expect(summary.purchases30).toBe(0);
  });
});
