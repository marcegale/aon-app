import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isDevelopmentRecruitingDemoApi =
    process.env.NODE_ENV === "development" &&
    [
      "/api/recruiting/create",
      "/api/recruiting/google/connect",
      "/api/recruiting/email-account",
      "/api/recruiting/monitor/start",
      "/api/recruiting/monitor/stop",
      "/api/recruiting/monitor/run-once",
    ].includes(pathname);

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/logout") ||
    pathname.startsWith("/api/charlie") ||
    pathname.startsWith("/api/atlas") ||
    pathname === "/api/recruiting/google/callback" ||
    isDevelopmentRecruitingDemoApi;

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(
      new URL("/agents/accounting/invoice-processor", req.url)
    );
  }

  if (pathname.startsWith("/admin")) {
    const role = user?.app_metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(
        new URL("/agents/accounting/invoice-processor", req.url)
      );
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2|ttf)$).*)",
  ],
};
