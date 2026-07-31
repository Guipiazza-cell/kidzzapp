/**
 * Capas de filme — path público simples (Vite serve /public na raiz).
 * Arquivos: public/exemplos/assets/cinema-v2/cover-{id}.png
 *
 * CDN só como fallback de rede se o arquivo local falhar.
 */

const PUBLIC_BASE = "/exemplos/assets/cinema-v2";
const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/Guipiazza-cell/kidzzapp@main/public/exemplos/assets/cinema-v2";

/** Path local (localhost e qualquer host que sirva public/) */
export function cinemaCoverUrl(id: string): string {
  return `${PUBLIC_BASE}/cover-${id}.png`;
}

/** Fallback CDN (GitHub) */
export function cinemaCoverCdn(id: string): string {
  return `${CDN_BASE}/cover-${id}.png`;
}

export function hasCinemaCover(_id: string): boolean {
  return true;
}

export function cinemaCoverIds(): string[] {
  return [];
}
