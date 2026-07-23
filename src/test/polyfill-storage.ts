/** Polyfill localStorage before any app module loads (supabase client). */
const mem = new Map<string, string>();
const store: Storage = {
  get length() {
    return mem.size;
  },
  clear() {
    mem.clear();
  },
  getItem(k: string) {
    return mem.has(k) ? mem.get(k)! : null;
  },
  setItem(k: string, v: string) {
    mem.set(String(k), String(v));
  },
  removeItem(k: string) {
    mem.delete(k);
  },
  key(i: number) {
    return Array.from(mem.keys())[i] ?? null;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: store,
  writable: true,
  configurable: true,
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: store,
    writable: true,
    configurable: true,
  });
}
