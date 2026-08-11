// PIN dos pais — armazenado apenas como hash SHA-256 no dispositivo.
export const PIN_HASH_KEY = "kidzz_parental_pin_hash";
export const PIN_ATTEMPTS_KEY = "kidzz_parental_attempts";
export const PIN_LOCK_UNTIL_KEY = "kidzz_parental_lock_until";
export const PIN_MAX_ATTEMPTS = 3;
export const PIN_LOCK_DURATION_MS = 60 * 1000;

/** sha256("1234") — fallback de fábrica, usado só quando não há PIN customizado. */
export const DEFAULT_PIN_HASH =
  "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

/** Origem de produção fixa para links de recuperação (nunca preview). */
export const APP_ORIGIN = "https://kidzz.app";

export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getStoredPinHash(): string {
  try {
    return localStorage.getItem(PIN_HASH_KEY) || DEFAULT_PIN_HASH;
  } catch {
    return DEFAULT_PIN_HASH;
  }
}

export function hasCustomPin(): boolean {
  try {
    const h = localStorage.getItem(PIN_HASH_KEY);
    return !!h && h !== DEFAULT_PIN_HASH;
  } catch {
    return false;
  }
}

export async function savePin(pin: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  const h = await sha256Hex(pin);
  try {
    localStorage.setItem(PIN_HASH_KEY, h);
    localStorage.removeItem(PIN_ATTEMPTS_KEY);
    localStorage.removeItem(PIN_LOCK_UNTIL_KEY);
    return true;
  } catch {
    return false;
  }
}
