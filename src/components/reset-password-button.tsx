"use client";

import { useState, useTransition } from "react";
import { resetUserPassword } from "@/app/admin/actions";

export function ResetPasswordButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [pending, startTransition] = useTransition();
  const [temp, setTemp] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  function handleReset() {
    const ok = window.confirm(
      `Resetar a senha de ${email}? Uma senha temporária será gerada e o usuário precisará definir uma nova senha no próximo login.`
    );
    if (!ok) return;
    setErro(null);
    setTemp(null);
    setCopiado(false);
    startTransition(async () => {
      const res = await resetUserPassword(userId);
      if (res.error) setErro(res.error);
      else setTemp(res.tempPassword ?? null);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleReset}
        disabled={pending}
        className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
      >
        {pending ? "Resetando…" : "Resetar senha"}
      </button>

      {erro ? <p className="text-xs text-red-600">{erro}</p> : null}

      {temp ? (
        <div className="mt-1 w-full max-w-xs rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <p className="font-medium">Senha temporária gerada:</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-white px-2 py-1 font-mono text-sm tracking-wide text-slate-800">
              {temp}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(temp);
                setCopiado(true);
              }}
              className="rounded border border-amber-300 px-2 py-1 text-[11px] hover:bg-amber-100"
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="mt-1.5 leading-snug text-amber-700">
            Repasse esta senha ao usuário. No próximo login ele precisará definir uma nova senha (com confirmação).
          </p>
        </div>
      ) : null}
    </div>
  );
}
