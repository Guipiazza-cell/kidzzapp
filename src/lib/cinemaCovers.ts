/**
 * Capas de filme empacotadas no bundle (Vite).
 * public/exemplos/.../covers não sobe no deploy do kidzz.app (404),
 * então as imagens vivem em src/assets/cinema-covers e viram URL no build.
 */
const modules = import.meta.glob("../assets/cinema-covers/cover-*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const byId: Record<string, string> = {};

for (const [path, url] of Object.entries(modules)) {
  // .../cover-nemo.png → nemo
  const file = path.split("/").pop() || "";
  const id = file.replace(/^cover-/, "").replace(/\.png$/i, "");
  if (id) byId[id] = url;
}

/** URL da capa do filme (hashed no build). Fallback: string vazia. */
export function cinemaCoverUrl(id: string): string {
  return byId[id] || "";
}

export function hasCinemaCover(id: string): boolean {
  return Boolean(byId[id]);
}

/** Debug / testes */
export function cinemaCoverIds(): string[] {
  return Object.keys(byId).sort();
}
