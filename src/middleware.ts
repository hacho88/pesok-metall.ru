import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // CORS для админки на поддомене (admin.pesok-metall.ru)
  if (url.pathname.startsWith("/api/admin")) {
    const origin = request.headers.get("origin") || "";
    const allowed = (process.env.ADMIN_ORIGIN || "http://localhost:3001")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const isAllowed = origin && allowed.includes(origin);
    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": isAllowed ? origin : "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Пропускаем системные файлы, API, статику и уже отрерайченные гео-пути
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_geo") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Отделяем порт: "balashiha.localhost:3000" -> "balashiha.localhost"
  const hostWithoutPort = hostname.split(":")[0];
  const hostnameParts = hostWithoutPort.split(".");

  let subdomain: string | null = null;

  // Прод: balashiha.pesok-metall.ru (3+ части)
  if (hostnameParts.length >= 3) {
    const candidate = hostnameParts[0].toLowerCase();
    if (candidate !== "www" && candidate !== "pesok-metall") {
      subdomain = candidate;
    }
  }
  // Локально: balashiha.localhost:3000 (2 части)
  else if (hostnameParts.length === 2 && hostnameParts[1] === "localhost") {
    const candidate = hostnameParts[0].toLowerCase();
    if (candidate !== "www" && candidate !== "pesok-metall") {
      subdomain = candidate;
    }
  }

  if (subdomain) {
    // Магия рерайта: незаметно подменяем страницу под гео-зону
    url.pathname = `/_geo/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/admin/:path*"],
};
