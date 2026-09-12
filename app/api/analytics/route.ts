import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { trackServerEvent } from "@/lib/analytics";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const body = await safeJson<{ event: string; anonymousId?: string; properties?: Record<string, unknown> }>(request);
    if (!body?.event) return json({ error: "Event is required." }, 400);
    await trackServerEvent(body.event, body.properties || {}, body.anonymousId);
    return json({ ok: true }, 202);
  } catch { return json({ error: "Event rejected." }, 400); }
}
