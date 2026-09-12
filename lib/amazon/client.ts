import { envFlag, runtimeEnv } from "@/lib/runtime-env";

let tokenCache: { value: string; expiresAt: number } | null = null;

function endpoint(): string {
  const override = runtimeEnv("AMAZON_SP_API_BASE");
  if (override) return override.replace(/\/$/, "");
  const sandbox = envFlag("AMAZON_SPAPI_SANDBOX", true);
  const region = runtimeEnv("AMAZON_SPAPI_REGION", "eu");
  const suffix = region === "na" ? "na" : region === "fe" ? "fe" : "eu";
  return sandbox ? `https://sandbox.sellingpartnerapi-${suffix}.amazon.com` : `https://sellingpartnerapi-${suffix}.amazon.com`;
}

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.value;
  const clientId = runtimeEnv("AMAZON_LWA_CLIENT_ID");
  const clientSecret = runtimeEnv("AMAZON_LWA_CLIENT_SECRET");
  const refreshToken = runtimeEnv("AMAZON_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Amazon LWA credentials are not configured.");
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret });
  const response = await fetch(runtimeEnv("AMAZON_LWA_TOKEN_URL", "https://api.amazon.com/auth/o2/token"), {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, cache: "no-store",
  });
  if (!response.ok) throw new Error(`Amazon LWA token failed (${response.status}): ${await response.text()}`);
  const payload = (await response.json()) as { access_token: string; expires_in?: number };
  tokenCache = { value: payload.access_token, expiresAt: Date.now() + (payload.expires_in || 3600) * 1000 };
  return tokenCache.value;
}

export async function amazonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const response = await fetch(`${endpoint()}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "content-type": "application/json", "x-amz-access-token": token, ...(init.headers || {}) },
  });
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) throw new Error(`Amazon SP-API ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  return payload as T;
}
