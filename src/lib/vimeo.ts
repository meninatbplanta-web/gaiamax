// Extrai o ID numérico do vídeo no Vimeo (e o hash de vídeos privados/unlisted)
// a partir de várias formas de entrada: ID puro, vimeo.com/ID, vimeo.com/ID/HASH,
// player.vimeo.com/video/ID?h=HASH.
export function parseVimeo(input: string | null | undefined): { id: string; hash?: string } | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return { id: s };
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    const playerMatch = url.pathname.match(/\/video\/(\d+)/);
    if (playerMatch) {
      const h = url.searchParams.get("h") || undefined;
      return { id: playerMatch[1], hash: h };
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] && /^\d+$/.test(parts[0])) {
      return { id: parts[0], hash: parts[1] };
    }
  } catch {
    // ignora; tenta fallback abaixo
  }
  const m = s.match(/(\d{6,})/);
  return m ? { id: m[1] } : null;
}

export function vimeoEmbedUrl(id: string, hash?: string): string {
  const params = new URLSearchParams({ title: "0", byline: "0", portrait: "0", dnt: "1" });
  if (hash) params.set("h", hash);
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}
