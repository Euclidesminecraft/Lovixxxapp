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
} from "lucide-react";
import { UserSubscription, AppLanguage, AuthUser, SUPPORTED_LANGUAGES } from "../types";
import { getTranslation } from "../i18n/translations";

interface NavbarProps {
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenPricing: () => void;
  onOpenMorning: () => void;
  onOpenAuth: () => void;
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
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500/20 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-sans">
                {t.appName}
              </span>
              {subscription.isPro ? (
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> PRO
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  FREE
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Switcher Dropdown (EN, PT, ES, FR, DE, IT) */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="language-toggle-btn"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                langMenuOpen
                  ? "bg-zinc-800 text-white border-rose-500/50 shadow-sm shadow-rose-500/10"
                  : "bg-zinc-900/90 text-zinc-200 hover:text-white hover:bg-zinc-800/90 border-zinc-700/80 hover:border-zinc-600"
              }`}
              title="Select Language / Selecionar Idioma"
            >
              <Globe className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-sans text-[11px] font-bold flex items-center gap-1">
                <span>{currentLangOption.flag}</span>
                <span className="uppercase">{currentLangOption.code}</span>
              </span>
              <ChevronDown
                className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                  langMenuOpen ? "rotate-180 text-rose-400" : ""
                }`}
              />
            </button>

            {langMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-1.5 w-44 py-1 bg-zinc-900/95 border border-zinc-700/90 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1 mb-1 border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>Languages</span>
                  <span className="text-zinc-400">{SUPPORTED_LANGUAGES.length}</span>
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
                      className={`w-full px-2.5 py-1.5 flex items-center justify-between text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-rose-500/15 text-rose-300 font-semibold"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
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

          {/* User Account / Auth Button */}
          <button
            id="auth-nav-btn"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
              activeUser
                ? "bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-zinc-600 hover:text-white"
                : "bg-zinc-900/90 text-zinc-300 border-zinc-700/70 hover:bg-zinc-800 hover:text-white"
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
                  className="w-4 h-4 rounded-full border border-rose-500/50"
                />
                <span className="max-w-[70px] sm:max-w-[100px] truncate hidden xs:inline">
                  {activeUser.name.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">{t.signIn}</span>
              </>
            )}
          </button>

          {/* Subscription Credits Badge / Upgrade button */}
          <button
            id="pricing-nav-btn"
            onClick={onOpenPricing}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
              subscription.isPro
                ? "bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400/50 shadow-sm"
                : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white border-rose-500 shadow-sm shadow-rose-600/30 active:scale-95"
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
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span className="hidden sm:inline">
                  {subscription.creditsRemaining} {t.freeCredits} • PRO
                </span>
                <span className="sm:hidden">
                  {subscription.creditsRemaining} • PRO
                </span>
              </>
            )}
          </button>

          {/* Morning Love Phrases Button */}
          <button
            id="morning-love-nav-btn"
            onClick={onOpenMorning}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/40 rounded-lg transition-colors cursor-pointer"
            title={t.morningNav}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{t.morningNav}</span>
          </button>

          {/* Rules Button */}
          <button
            id="rules-modal-btn"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer"
            title={t.rulesNav}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">{t.rulesNav}</span>
          </button>

          {/* History Button */}
          <button
            id="history-drawer-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors relative cursor-pointer"
            title={t.historyNav}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
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
