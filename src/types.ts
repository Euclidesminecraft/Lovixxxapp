export type EstiloTom = string;
export type RelacaoTipo = string;
export type ObjetivoTipo = string;

export interface UploadedImage {
  data: string; // base64 data url or raw base64
  mimeType: string;
  name: string;
  size: number;
}

export interface LovixContext {
  mensagem: string;
  image?: UploadedImage | null;
  rumoConversa?: string; // Direction requested by the user
  relacao: RelacaoTipo;
  objetivo: ObjetivoTipo;
  tom: EstiloTom;
  ousadia: number; // 1 to 5
}

export interface ParsedOption {
  number: number;
  type: string;
  text: string;
  copied?: boolean;
}

export interface GenerationResult {
  id: string;
  timestamp: number;
  context: LovixContext;
  rawText: string;
  options: ParsedOption[];
  isFavorite?: boolean;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  badge: string;
  mensagem: string;
  rumoConversa?: string;
  relacao: RelacaoTipo;
  objetivo: ObjetivoTipo;
  tom: EstiloTom;
  ousadia: number;
}

export type PlanPeriod = "weekly" | "monthly" | "annual" | "lifetime";

export interface PricingPlan {
  id: PlanPeriod;
  name: string;
  tagline: string;
  price: string;
  originalPrice?: string;
  periodLabel: string;
  isPopular?: boolean;
  features: string[];
}

export interface UserSubscription {
  isPro: boolean;
  creditsRemaining: number;
  maxDailyCredits: number;
  planId?: PlanPeriod | "admin_vip";
  activatedAt?: number;
  isAdminUnlocked?: boolean;
}

export interface MorningLovePhrase {
  day: number;
  theme: string;
  phrase: string;
  variation: string;
  tip: string;
}

export interface MorningTrackerState {
  firstSeenTimestamp: number;
  notificationsEnabled: boolean;
  preferredTime: string; // e.g. "08:00"
  lastNotifiedDate: string | null;
}

export type AppLanguage = "en" | "pt" | "es" | "fr" | "de" | "it";

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  label: string;
  flag: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", label: "English", flag: "🇺🇸", shortLabel: "EN" },
  { code: "pt", name: "Português", label: "Português", flag: "🇧🇷", shortLabel: "PT" },
  { code: "es", name: "Español", label: "Español", flag: "🇪🇸", shortLabel: "ES" },
  { code: "fr", name: "Français", label: "Français", flag: "🇫🇷", shortLabel: "FR" },
  { code: "de", name: "Deutsch", label: "Deutsch", flag: "🇩🇪", shortLabel: "DE" },
  { code: "it", name: "Italiano", label: "Italiano", flag: "🇮🇹", shortLabel: "IT" },
];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "google" | "password" | "admin";
  role?: "admin" | "user";
  isAdmin?: boolean;
  createdAt: number;
}

export interface SavedCredentials {
  email: string;
  password?: string;
  savedAt: number;
}

