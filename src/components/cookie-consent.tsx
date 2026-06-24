"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ok = document.cookie.split("; ").some((c) => c.startsWith("gx_consent="));
    if (!ok) setShow(true);
  }, []);

  if (!show) return null;

  const accept = () => {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `gx_consent=1; path=/; max-age=${oneYear}; samesite=lax`;
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-slate-600">
          Usamos cookies essenciais para manter você conectado e melhorar sua experiência. Ao continuar, você concorda com a nossa{" "}
          <Link href="/privacidade" className="text-brand hover:underline">Política de Privacidade</Link>.
        </p>
        <button onClick={accept} className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Entendi
        </button>
      </div>
    </div>
  );
}
