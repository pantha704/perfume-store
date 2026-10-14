// Invoice / receipt configuration + formatting.
// Seller legal details are pending client inputs (registered address + GSTIN);
// fill them here and they appear on every receipt automatically.

export const INVOICE_SELLER = {
  name: "Relapse Perfumes",
  lines: [] as string[], // registered address — awaiting client details
  gstin: null as string | null // awaiting client's GST confirmation
};

/** Formats an ISO timestamp as an IST calendar date + time (deterministic). */
export function formatIstDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const day = ist.getUTCDate();
  const month = ist.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const year = ist.getUTCFullYear();
  let hours = ist.getUTCHours();
  const minutes = String(ist.getUTCMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${meridiem} IST`;
}
