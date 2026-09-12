import { json } from "@/lib/http";
import { readOrderForGuest } from "@/lib/order-service";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const publicId = url.searchParams.get("id") || "";
  const token = url.searchParams.get("token") || "";
  if (!publicId || !token) return json({ error: "Tracking link is incomplete." }, 400);
  const order = await readOrderForGuest(publicId, token);
  if (!order) return json({ error: "Order not found or tracking link is invalid." }, 404);
  return json({ order });
}
