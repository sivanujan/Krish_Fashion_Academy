import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - brand (brand assets)
     * - api/keep-alive (cron endpoint)
     * - images/svgs
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|api/keep-alive|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
