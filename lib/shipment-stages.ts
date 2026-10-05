// The shipment stage ladder shared by the admin API (advancing orders) and the
// console (labelling the "Advance →" button). "unfulfilled" is the initial state
// written at checkout; the customer tracker renders it as the first stage.
export const SHIPMENT_LADDER = ["processing", "shipped", "in_transit", "out_for_delivery", "delivered"] as const;

/** Next stage after `current`, or null when the order is final. */
export function nextShipmentStage(current: string): string | null {
  if (current === "delivered" || current === "cancelled" || current === "attention_required") return null;
  const normalized = current === "unfulfilled" ? "processing" : current;
  const idx = SHIPMENT_LADDER.indexOf(normalized as (typeof SHIPMENT_LADDER)[number]);
  if (idx === -1) return "shipped";
  return idx + 1 < SHIPMENT_LADDER.length ? SHIPMENT_LADDER[idx + 1] : null;
}
