// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > maxRequests) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  // Rate limiting
  if (path.startsWith("/api/auth/login")) {
    if (isRateLimited(`login:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Trop de tentatives, réessaie dans 1 minute." },
        { status: 429 },
      );
    }
  }

  if (path.startsWith("/api/bookings")) {
    if (isRateLimited(`booking:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessaie plus tard." },
        { status: 429 },
      );
    }
  }

  if (path.startsWith("/api/messages")) {
    if (isRateLimited(`messages:${ip}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Trop de messages envoyés, ralentis un peu." },
        { status: 429 },
      );
    }
  }

  if (path.startsWith("/api/blog/comments")) {
    if (isRateLimited(`comments:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Trop de commentaires envoyés, réessaie plus tard." },
        { status: 429 },
      );
    }
  }

  // Protection admin
  if (path.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protection student
  if (path.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
    "/api/bookings/:path*",
    "/api/messages/:path*",
    "/api/blog/comments/:path*",
  ],
};
