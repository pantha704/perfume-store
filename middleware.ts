import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// OpenNext currently requires middleware.ts rather than Next 16's proxy.ts.
// Keep this boundary deliberately small: refresh auth cookies only.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
