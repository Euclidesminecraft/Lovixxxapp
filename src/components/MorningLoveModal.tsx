import React, { useState } from "react";
import {
  X,
  Heart,
  Sun,
  Copy,
  Check,
  Bell,
  BellRing,
  Calendar,
  Sparkles,
  Crown,
  ChevronRight,
  Send,
} from "lucide-react";
import { UserSubscription, AppLanguage } from "../types";
import { getMorningPhrases } from "../data/morningLovePhrases";
import {
  calculateMorningProgress,
  requestMorningNotifications,
  buildWhatsAppLink,
} from "../utils/morningTracker";
import { getTranslation } from "../i18n/translations";

interface MorningLoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  firstSeenTimestamp: number;
  notificationsEnabled: boolean;
  onToggleNotification: () => void;
  onOpenPricing: () => void;
  language: AppLanguage;
}

export const MorningLoveModal: React.FC<MorningLoveModalProps> = ({
  isOpen,
  onClose,
  subscription,
  firstSeenTimestamp,
  notificationsEnabled,
  onToggleNotification,
  onOpenPricing,
  language,
}) => {
  const t = getTranslation(language);
  const phrases = getMorningPhrases(language);

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const { currentDay } = calculateMorningProgress(firstSeenTimestamp);
    return currentDay;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const { currentDay, daysRemaining, isTrialExpired } =
    calculateMorningProgress(firstSeenTimestamp);

  const activePhrase =
    phrases.find((p) => p.day === selectedDay) || phrases[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEnableNotification = async () => {
    const success = await requestMorningNotifications(activePhrase, language);
    if (success) {
      onToggleNotification();
      setNotificationStatus(
        language === "pt"
          ? "Notificação ativada! Você receberá sugestões matinais no seu dispositivo."
          : "Notification enabled! You will receive morning love suggestions on this device."
      );
    } else {
      setNotificationStatus(
        language === "pt"
          ? "Permissão negada ou não suportada no navegador atual."
          : "Permission denied or notifications not supported on this browser."
      );
    }
    setTimeout(() => setNotificationStatus(null), 4000);
  };

  return (
    <div
      id="morning-love-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="morning-love-modal-content"
        className="relative w-full max-w-2xl bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {t.morningModalTitle}
                </h3>
                {subscription.isPro ? (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {t.morningVipBadge}
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {isTrialExpired
                      ? t.morningTrialFinished
                      : t.morningTrialBadge(currentDay)}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">{t.morningModalSubtitle}</p>
            </div>
          </div>
          <button
            id="close-morning-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Notification status message */}
          {notificationStatus && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{notificationStatus}</span>
            </div>
          )}

          {/* Routine Status Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-zinc-300 block">
                {t.track14Title}
              </span>
              <p className="text-xs text-zinc-400">
                {subscription.isPro
                  ? t.track14ProSubtitle
                  : t.track14Subtitle(daysRemaining)}
              </p>
            </div>

            <button
              onClick={handleEnableNotification}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                notificationsEnabled
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              }`}
            >
              {notificationsEnabled ? (
                <>
                  <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{t.notificationActiveBtn}</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-zinc-400" />
                  <span>{t.activateAlertBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* 14-Days Interactive Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300">
                {t.calendarTitle}
              </span>
              <span className="text-[11px] text-rose-400 font-semibold">
                {t.todayBadge(currentDay)}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {phrases.map((item) => {
                const isToday = item.day === currentDay;
                const isSelected = item.day === selectedDay;
                const isPast = item.day < currentDay;

                return (
                  <button
                    key={item.day}
                    onClick={() => setSelectedDay(item.day)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-gradient-to-b from-amber-500/20 to-rose-500/20 border-amber-500 text-amber-200 shadow-md font-bold scale-105"
                        : isToday
                        ? "bg-zinc-800/90 border-rose-500/70 text-rose-300"
                        : isPast
                        ? "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/60"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-tight">
                      {t.dayLabel}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold">
                      {item.day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Day Phrase Details */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {t.dayLabel} {activePhrase.day} • {activePhrase.theme}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                {t.sendMorningTip}
              </span>
            </div>

            {/* Main Phrase */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                {t.mainPhraseLabel}
              </span>
              <p className="text-sm sm:text-base text-zinc-100 leading-relaxed font-medium bg-zinc-900/90 p-3.5 rounded-xl border border-zinc-800 select-all">
                "{activePhrase.phrase}"
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() =>
                    handleCopy(activePhrase.phrase, `main_${activePhrase.day}`)
                  }
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId === `main_${activePhrase.day}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{t.copyPhrase}</span>
                    </>
                  )}
                </button>

                <a
                  href={buildWhatsAppLink(activePhrase.phrase)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 no-underline shadow-sm shadow-emerald-950/50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.sendWhatsApp}</span>
                </a>
              </div>
            </div>

            {/* Alternative Variation */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                {t.variationLabel}
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 select-all">
                "{activePhrase.variation}"
              </p>

              <button
                onClick={() =>
                  handleCopy(
                    activePhrase.variation,
                    `var_${activePhrase.day}`
                  )
                }
                className="px-3 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === `var_${activePhrase.day}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>{t.copyVariation}</span>
                  </>
                )}
              </button>
            </div>

            {/* Lovix Tip */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>{t.tipPrefix}</strong> {activePhrase.tip}
              </span>
            </div>
          </div>

          {/* Pro Promotion for Continuing Beyond 14 Days */}
          {!subscription.isPro && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-rose-950/40 to-zinc-900 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-black font-bold" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {t.beyond14Title}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {t.beyond14Subtitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPricing();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-bold text-xs shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                {t.seeProBtn}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/90 flex items-center justify-between text-xs text-zinc-400">
          <span>{t.track14Title}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            {t.doneBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
