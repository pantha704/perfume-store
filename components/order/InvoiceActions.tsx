"use client";
import Link from "next/link";

export function InvoiceActions({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return <div className="invoice-actions">
    <Link className="button light-button" href={backHref}>{backLabel}</Link>
    <button className="button dark-button" type="button" onClick={() => window.print()}>Print / save as PDF</button>
  </div>;
}
