"use client";

import { parseVimeo, vimeoEmbedUrl } from "@/lib/vimeo";

export function VimeoPlayer({ value, title }: { value: string | null; title?: string }) {
  const parsed = parseVimeo(value);

  if (!parsed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400">
        Vídeo ainda não configurado.<br />Cole o link ou o ID do vídeo no Vimeo.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingBottom: "56.25%" }}>
      <iframe
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
