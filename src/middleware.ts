import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Usuário com senha resetada pelo admin: forçar definição de nova senha.
  const mustChange = !!(user?.app_metadata as any)?.must_change_password;
  if (user && mustChange) {
    const { pathname } = request.nextUrl;
    const liberado =
      pathname.startsWith("/redefinir-senha") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/api");
    if (!liberado) {
      const url = request.nextUrl.clone();
      url.pathname = "/redefinir-senha";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      // Preserva os cookies de sessão renovados pelo updateSession.
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
