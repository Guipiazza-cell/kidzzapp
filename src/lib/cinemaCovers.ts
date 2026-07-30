/** Auto-generated: capas no bundle Vite (imports explícitos). */

import c_4_vidas from "../assets/cinema-covers/cover-4-vidas.png";
import c_alice from "../assets/cinema-covers/cover-alice.png";
import c_bernardo_bianca from "../assets/cinema-covers/cover-bernardo-bianca.png";
import c_bolt from "../assets/cinema-covers/cover-bolt.png";
import c_carros from "../assets/cinema-covers/cover-carros.png";
import c_chefinho from "../assets/cinema-covers/cover-chefinho.png";
import c_coco from "../assets/cinema-covers/cover-coco.png";
import c_divertidamente from "../assets/cinema-covers/cover-divertidamente.png";
import c_dumbo from "../assets/cinema-covers/cover-dumbo.png";
import c_encanto from "../assets/cinema-covers/cover-encanto.png";
import c_enrolados from "../assets/cinema-covers/cover-enrolados.png";
import c_familia_futuro from "../assets/cinema-covers/cover-familia-futuro.png";
import c_hamburguer from "../assets/cinema-covers/cover-hamburguer.png";
import c_horton from "../assets/cinema-covers/cover-horton.png";
import c_leo from "../assets/cinema-covers/cover-leo.png";
import c_lilo_stitch from "../assets/cinema-covers/cover-lilo-stitch.png";
import c_luca from "../assets/cinema-covers/cover-luca.png";
import c_madagascar from "../assets/cinema-covers/cover-madagascar.png";
import c_malvado from "../assets/cinema-covers/cover-malvado.png";
import c_marley from "../assets/cinema-covers/cover-marley.png";
import c_matilda from "../assets/cinema-covers/cover-matilda.png";
import c_minions from "../assets/cinema-covers/cover-minions.png";
import c_narnia from "../assets/cinema-covers/cover-narnia.png";
import c_nemo from "../assets/cinema-covers/cover-nemo.png";
import c_oz from "../assets/cinema-covers/cover-oz.png";
import c_pequenos_espioes from "../assets/cinema-covers/cover-pequenos-espioes.png";
import c_peter_pan from "../assets/cinema-covers/cover-peter-pan.png";
import c_pets from "../assets/cinema-covers/cover-pets.png";
import c_polar_express from "../assets/cinema-covers/cover-polar-express.png";
import c_polar from "../assets/cinema-covers/cover-polar.png";
import c_red from "../assets/cinema-covers/cover-red.png";
import c_rei_leao from "../assets/cinema-covers/cover-rei-leao.png";
import c_robos from "../assets/cinema-covers/cover-robos.png";
import c_sing from "../assets/cinema-covers/cover-sing.png";
import c_soul from "../assets/cinema-covers/cover-soul.png";
import c_stuart_little from "../assets/cinema-covers/cover-stuart-little.png";
import c_toy_story from "../assets/cinema-covers/cover-toy-story.png";
import c_up from "../assets/cinema-covers/cover-up.png";
import c_wall_e from "../assets/cinema-covers/cover-wall-e.png";
import c_walle from "../assets/cinema-covers/cover-walle.png";
import c_wish from "../assets/cinema-covers/cover-wish.png";
import c_zootopia from "../assets/cinema-covers/cover-zootopia.png";

export const CINEMA_COVERS: Record<string, string> = {
  "4-vidas": c_4_vidas,
  "alice": c_alice,
  "bernardo-bianca": c_bernardo_bianca,
  "bolt": c_bolt,
  "carros": c_carros,
  "chefinho": c_chefinho,
  "coco": c_coco,
  "divertidamente": c_divertidamente,
  "dumbo": c_dumbo,
  "encanto": c_encanto,
  "enrolados": c_enrolados,
  "familia-futuro": c_familia_futuro,
  "hamburguer": c_hamburguer,
  "horton": c_horton,
  "leo": c_leo,
  "lilo-stitch": c_lilo_stitch,
  "luca": c_luca,
  "madagascar": c_madagascar,
  "malvado": c_malvado,
  "marley": c_marley,
  "matilda": c_matilda,
  "minions": c_minions,
  "narnia": c_narnia,
  "nemo": c_nemo,
  "oz": c_oz,
  "pequenos-espioes": c_pequenos_espioes,
  "peter-pan": c_peter_pan,
  "pets": c_pets,
  "polar-express": c_polar_express,
  "polar": c_polar,
  "red": c_red,
  "rei-leao": c_rei_leao,
  "robos": c_robos,
  "sing": c_sing,
  "soul": c_soul,
  "stuart-little": c_stuart_little,
  "toy-story": c_toy_story,
  "up": c_up,
  "wall-e": c_wall_e,
  "walle": c_walle,
  "wish": c_wish,
  "zootopia": c_zootopia,
};

const ALIASES: Record<string, string> = {
  "wall-e": "wall-e",
  "walle": "wall-e",
  "polar": "polar-express",
  "polar-express": "polar-express",
};

/** CDN público no GitHub — funciona mesmo se public/ do host der 404 */
export function cinemaCoverCdn(id: string): string {
  return `https://cdn.jsdelivr.net/gh/Guipiazza-cell/kidzzapp@main/public/exemplos/assets/cinema-v2/cover-${id}.png`;
}

export function cinemaCoverUrl(id: string): string {
  // Prefer bundle local (offline/dev). Senão CDN estável.
  if (CINEMA_COVERS[id]) return CINEMA_COVERS[id];
  if (id === "wall-e" && CINEMA_COVERS["walle"]) return CINEMA_COVERS["walle"];
  if (id === "wall-e" && CINEMA_COVERS["wall-e"]) return CINEMA_COVERS["wall-e"];
  if (id === "polar-express" && CINEMA_COVERS["polar-express"]) return CINEMA_COVERS["polar-express"];
  if (id === "polar-express" && CINEMA_COVERS["polar"]) return CINEMA_COVERS["polar"];
  return cinemaCoverCdn(id);
}

export function hasCinemaCover(id: string): boolean {
  return Boolean(CINEMA_COVERS[id] || CINEMA_COVERS[id.replace("wall-e","walle")]);
}

export function cinemaCoverIds(): string[] { return Object.keys(CINEMA_COVERS).sort(); }
