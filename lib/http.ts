import { NextResponse } from "next/server";

export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return NextResponse.json(data, { status, headers: { "cache-control": "no-store", ...Object.fromEntries(new Headers(headers)) } });
}

export async function safeJson<T = unknown>(request: Request): Promise<T | null> {
  try { return (await request.json()) as T; } catch { return null; }
}
