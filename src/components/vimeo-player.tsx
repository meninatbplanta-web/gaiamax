"use client";

import { useEffect, useRef } from "react";
import { parseVimeo, vimeoEmbedUrl } from "@/lib/vimeo";

// Player do Vimeo. Se receber lessonId, integra o SDK e marca a aula como
// concluída automaticamente ao terminar o vídeo (ou ao atingir ~90%).
export function VimeoPlayer({
  value,
  title,
  lessonId,
}: {
  value: string | null;
  title?: string;
  lessonId?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const parsed = parseVimeo(value);

  useEffect(() => {
    if (!lessonId || !iframeRef.current || !parsed) return;
    let player: any;
    let done = false;

    const markDone = () => {
      if (done) return;
      done = true;
      fetch("/api/progresso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      }).catch(() => {});
    };

    const setup = () => {
      const V = (window as any).Vimeo;
      if (!V || !iframeRef.current) return;
      player = new V.Player(iframeRef.current);
      player.on("ended", markDone);
      player.on("timeupdate", (d: any) => {
        if (d && typeof d.percent === "number" && d.percent >= 0.9) markDone();
      });
    };

    if ((window as any).Vimeo) {
      setup();
    } else {
      const SRC = "https://player.vimeo.com/api/player.js";
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
      if (s) {
        s.addEventListener("load", setup);
      } else {
        s = document.createElement("script");
        s.src = SRC;
        s.onload = setup;
        document.body.appendChild(s);
      }
    }

    return () => {
      try {
        if (player) {
          player.off("ended");
          player.off("timeupdate");
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, value]);

  if (!parsed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400">
        Vídeo ainda não configurado.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingBottom: "56.25%" }}>
      <iframe
        ref={iframeRef}
        src={vimeoEmbedUrl(parsed.id, parsed.hash)}
        title={title ?? "Videoaula"}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
