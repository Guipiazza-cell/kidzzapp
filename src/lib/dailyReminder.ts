// Lembrete diário gentil. Web Notifications API (local, sem servidor).
// O setTimeout só sobrevive enquanto a aba estiver aberta — usamos também
// uma checagem on-load pra disparar caso o horário escolhido já tenha passado.

const TIME_KEY = "bora_reminder_hour";
const LAST_FIRED_KEY = "bora_reminder_last_fired";

export function getReminderHour(): number {
  if (typeof window === "undefined") return 18;
  const raw = window.localStorage.getItem(TIME_KEY);
  const h = raw ? parseInt(raw, 10) : 18;
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : 18;
}

export function setReminderHour(h: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIME_KEY, String(h));
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "default") {
    try { return await Notification.requestPermission(); } catch { return "denied"; }
  }
  return Notification.permission;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function fire(name: string) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const lastFired = window.localStorage.getItem(LAST_FIRED_KEY);
    if (lastFired === todayKey()) return;
    new Notification("Bora, " + (name || "família") + "? 🌿", {
      body: "Que tal 15 min sem tela hoje? Tem uma atividade esperando vocês.",
      tag: "bora-diario",
      icon: "/icons/icon-192.png",
    });
    window.localStorage.setItem(LAST_FIRED_KEY, todayKey());
  } catch {
    /* noop */
  }
}

/**
 * Agenda o lembrete pro horário escolhido pelo pai (uma vez por dia).
 * Idempotente — chama a cada mount; cancela timers anteriores.
 */
let _timer: ReturnType<typeof setTimeout> | null = null;
export function scheduleDailyReminder(childName: string = "") {
  if (typeof window === "undefined") return;
  if (_timer) { clearTimeout(_timer); _timer = null; }
  const hour = getReminderHour();
  const now = new Date();
  const next = new Date();
  next.setHours(hour, 0, 0, 0);

  // Se o horário do dia já passou e ainda não disparou hoje, dispara em 5s.
  if (next <= now) {
    const lastFired = window.localStorage.getItem(LAST_FIRED_KEY);
    if (lastFired !== todayKey()) {
      _timer = setTimeout(() => fire(childName), 5_000);
      return;
    }
    // Agenda pra amanhã
    next.setDate(next.getDate() + 1);
  }
  const ms = next.getTime() - now.getTime();
  // setTimeout máx ~24.8 dias; aqui sempre < 24h
  _timer = setTimeout(() => {
    fire(childName);
    // re-agenda pro próximo dia
    scheduleDailyReminder(childName);
  }, ms);
}
