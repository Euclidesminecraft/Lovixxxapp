import { MorningTrackerState, MorningLovePhrase, AppLanguage } from "../types";
import { getMorningPhrases } from "../data/morningLovePhrases";

const STORAGE_KEY = "lovix_morning_tracker_v1";

export function getInitialMorningState(): MorningTrackerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Erro ao carregar estado matinal:", e);
  }

  const initial: MorningTrackerState = {
    firstSeenTimestamp: Date.now(),
    notificationsEnabled: false,
    preferredTime: "08:00",
    lastNotifiedDate: null,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error(e);
  }

  return initial;
}

export function saveMorningState(state: MorningTrackerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Erro ao salvar estado matinal:", e);
  }
}

/**
 * Calculates current trial day (1-indexed, from 1 to 14) and days remaining.
 */
export function calculateMorningProgress(firstSeenTimestamp: number) {
  const now = Date.now();
  const diffMs = Math.max(0, now - firstSeenTimestamp);
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(14, daysElapsed + 1);
  const daysRemaining = Math.max(0, 14 - daysElapsed);
  const isTrialExpired = daysElapsed >= 14;

  return {
    currentDay,
    daysElapsed,
    daysRemaining,
    isTrialExpired,
  };
}

export function getTodayPhrase(currentDay: number, lang: AppLanguage = "en"): MorningLovePhrase {
  const phrases = getMorningPhrases(lang);
  const index = Math.max(0, Math.min(13, currentDay - 1));
  return phrases[index] || phrases[0];
}

/**
 * Checks if current hour is morning time (e.g. 06:00 to 12:00)
 */
export function isCurrentlyMorning(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 12;
}

/**
 * Requests browser notification permissions and fires a test / morning notification if supported
 */
export async function requestMorningNotifications(
  phrase: MorningLovePhrase,
  lang: AppLanguage = "en"
): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  let perm = Notification.permission;
  if (perm !== "granted") {
    perm = await Notification.requestPermission();
  }

  if (perm === "granted") {
    try {
      const title =
        lang === "pt"
          ? "☀️ Frase de Amor Matinal • Lovix"
          : "☀️ Morning Love Message • Lovix";
      const dayLabel = lang === "pt" ? "Dia" : "Day";
      new Notification(title, {
        body: `${dayLabel} ${phrase.day}: "${phrase.phrase}"`,
        icon: "/favicon.ico",
      });
      return true;
    } catch (e) {
      console.warn("Notification error:", e);
      return true;
    }
  }

  return false;
}

export function buildWhatsAppLink(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
