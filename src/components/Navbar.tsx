import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  History,
  Flame,
  Crown,
  Zap,
  Sun,
  Globe,
  User as UserIcon,
  ChevronDown,
  Check,
  Sliders,
} from "lucide-react";
import { UserSubscription, AppLanguage, AuthUser, SUPPORTED_LANGUAGES } from "../types";
import { getTranslation } from "../i18n/translations";
import { PWAInstallButton } from "./PWAInstallButton";

interface NavbarProps {
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenPricing: () => void;
  onOpenMorning: () => void;
  onOpenAuth: () => void;
  onOpenAdminControl?: () => void;
  onSecretTrigger?: () => void;
  historyCount: number;
  subscription: UserSubscription;
  language: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  onToggleLanguage?: () => void;
  currentUser?: AuthUser | null;
  authUser?: AuthUser | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRules,
  onOpenHistory,
  onOpenPricing,
  onOpenMorning,
  onOpenAuth,
  onOpenAdminControl,
  onSecretTrigger,
  historyCount,
  subscription,
  language,
  onLanguageChange,
  onToggleLanguage,
  currentUser,
  authUser,
  onSignOut,
}) => {
  const t = getTranslation(language);
  const activeUser = currentUser ?? authUser ?? null;
  const isAdmin = Boolean(activeUser?.role === "admin" || activeUser?.isAdmin);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleLogoTap = () => {
    const next = logoClickCount + 1;
    if (next >= 5) {
      if (onSecretTrigger) onSecretTrigger();
      setLogoClickCount(0);
    } else {
      setLogoClickCount(next);
    }
  };

  const currentLangOption =
    SUPPORTED_LANGUAGES.find((item) => item.code === language) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (code: AppLanguage) => {
    if (typeof onLanguageChange === "function") {
      onLanguageChange(code);
    }
    setLangMenuOpen(false);
  };

  return (
    <header className="border-b border-white/[0.08] bg-[#09090b]/85 backdrop-blur-xl sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoTap}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-white/[0.1] hover:border-rose-500/30 flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group"
            title=""
          >
            <Flame className="w-5 h-5 text-rose-500 transition-transform group-hover:scale-110" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-[-0.02em] text-white font-sans">
                {t.appName}
              </span>
              {isAdmin || subscription.isPro ? (
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/[0.08] text-amber-300 border border-amber-400/20 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> VIP PRO
                </span>
              ) : (
                <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-white/[0.06]">
                  FREE
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block tracking-normal">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* In-App PWA Install Trigger */}
          <PWAInstallButton language={language} variant="navbar" />

          {/* Language Switcher Dropdown (EN, PT, ES, FR, DE, IT) */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="language-toggle-btn"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-9 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
                langMenuOpen
                  ? "bg-zinc-800 text-white border-zinc-600 shadow-sm"
                  : "bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border-white/[0.08] hover:border-white/[0.15]"
              }`}
              title="Select Language / Selecionar Idioma"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-[11px] font-semibold flex items-center gap-1">
                <span>{currentLangOption.flag}</span>
                <span className="uppercase">{currentLangOption.code}</span>
              </span>
              <ChevronDown
                className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                  langMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {langMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-1.5 w-44 py-1 bg-[#121215] border border-white/[0.1] rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1.5 mb-1 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>Languages</span>
                  <span>{SUPPORTED_LANGUAGES.length}</span>
                </div>
                {SUPPORTED_LANGUAGES.map((item) => {
                  const isSelected = item.code === language;
                  return (
                    <button
                      key={item.code}
                      id={`lang-option-${item.code}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectLanguage(item.code)}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-rose-500/10 text-rose-300 font-medium"
                          : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Discreet Admin Control Button (only for authenticated admin) */}
          {isAdmin && onOpenAdminControl && (
            <button
              id="admin-control-nav-btn"
              onClick={onOpenAdminControl}
              className="h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
              title={language === "pt" ? "Configurações Avançadas" : "Advanced Settings"}
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* User Account / Auth Button */}
          <button
            id="auth-nav-btn"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-9 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
              activeUser
                ? "bg-zinc-900/90 text-zinc-200 border-white/[0.08] hover:border-zinc-700 hover:bg-zinc-800"
                : "bg-zinc-900/80 text-zinc-300 border-white/[0.08] hover:bg-zinc-800 hover:text-white"
            }`}
            title={activeUser ? activeUser.name : t.signIn}
          >
            {activeUser ? (
              <>
                <img
                  src={
                    activeUser.avatarUrl ||
                    "https://api.dicebear.com/7.x/initials/svg?seed=User"
                  }
                  alt={activeUser.name}
                  className="w-4 h-4 rounded-full border border-rose-500/30"
                />
                <span className="max-w-[70px] sm:max-w-[100px] truncate hidden xs:inline text-zinc-200 font-medium">
                  {activeUser.name.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">{t.signIn}</span>
              </>
            )}
          </button>

          {/* Subscription Credits Badge / Upgrade button */}
          <button
            id="pricing-nav-btn"
            onClick={onOpenPricing}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-9 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              subscription.isPro
                ? "bg-amber-400/[0.08] hover:bg-amber-400/[0.12] border border-amber-400/20 text-amber-300"
                : "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border border-rose-500/50 shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.98]"
            }`}
            title={subscription.isPro ? t.proActive : t.upgradePro}
          >
            {subscription.isPro ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.proActive}</span>
                <span className="sm:hidden">VIP</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-rose-200 fill-rose-200" />
                <span className="hidden sm:inline font-medium">
                  {subscription.creditsRemaining} {t.freeCredits} • PRO
                </span>
                <span className="sm:hidden font-medium">
                  {subscription.creditsRemaining} • PRO
                </span>
              </>
            )}
          </button>

          {/* Morning Love Phrases Button */}
          <button
            id="morning-love-nav-btn"
            onClick={onOpenMorning}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 h-9 text-xs font-medium text-amber-300/90 hover:text-amber-200 bg-amber-400/[0.06] hover:bg-amber-400/[0.1] border border-amber-400/20 rounded-lg transition-colors cursor-pointer"
            title={t.morningNav}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{t.morningNav}</span>
          </button>

          {/* Rules Button */}
          <button
            id="rules-modal-btn"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 h-9 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
            title={t.rulesNav}
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">{t.rulesNav}</span>
          </button>

          {/* History Button */}
          <button
            id="history-drawer-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 h-9 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] rounded-lg transition-colors relative cursor-pointer"
            title={t.historyNav}
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">{t.historyNav}</span>
            {historyCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
