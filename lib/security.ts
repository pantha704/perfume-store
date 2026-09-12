import { runtimeEnv } from "@/lib/runtime-env";

export function isAllowedMutationOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = runtimeEnv("NEXT_PUBLIC_SITE_URL");
  const allowed = new Set<string>();
  if (configured) {
    try { allowed.add(new URL(configured).origin); } catch { /* invalid config fails closed below */ }
  }
  try { allowed.add(new URL(request.url).origin); } catch { return false; }
  return allowed.has(origin);
}

export function assertAllowedMutationOrigin(request: Request): void {
  if (!isAllowedMutationOrigin(request)) throw new Error("Invalid request origin.");
}
