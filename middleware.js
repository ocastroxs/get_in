import { NextResponse } from "next/server";

const SESSION_COOKIE_KEY = "getin_session";
const TIPO_COOKIE_KEY = "getin_tipo";

const normalizeTipo = (tipo) => {
  const value = String(tipo || "").trim().toLowerCase();
  const aliases = {
    administrador: "adm",
    admin: "adm",
    adm: "adm",
    porteiro: "port",
    portaria: "port",
    port: "port",
    supervisor: "sup",
    sup: "sup",
  };

  return aliases[value] || value;
};

const roleRoutes = {
  port: "/portaria",
  sup: "/supervisor",
  adm: "/dashboard",
};

const isPathInSection = (pathname, section) =>
  pathname === section || pathname.startsWith(`${section}/`);

const getRequiredTipo = (pathname) => {
  if (isPathInSection(pathname, "/portaria")) {
    return "port";
  }

  if (isPathInSection(pathname, "/supervisor")) {
    return "sup";
  }

  if (isPathInSection(pathname, "/dashboard")) {
    return "adm";
  }

  if (isPathInSection(pathname, "/configuracoes")) {
    return "authenticated";
  }

  return null;
};

const redirectTo = (request, pathname) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE_KEY)?.value === "1";
  const tipo = normalizeTipo(request.cookies.get(TIPO_COOKIE_KEY)?.value);
  const roleRoute = roleRoutes[tipo] || "/";

  if (pathname === "/" && hasSession && roleRoute !== "/") {
    return redirectTo(request, roleRoute);
  }

  const requiredTipo = getRequiredTipo(pathname);

  if (!requiredTipo) {
    return NextResponse.next();
  }

  if (!hasSession || !tipo) {
    return redirectTo(request, "/");
  }

  if (requiredTipo !== "authenticated" && tipo !== requiredTipo) {
    return redirectTo(request, roleRoute);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/portaria/:path*", "/supervisor/:path*", "/configuracoes/:path*"],
};
