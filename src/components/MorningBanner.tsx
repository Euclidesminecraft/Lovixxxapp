import React, { useState } from "react";
import {
  Sun,
  Heart,
  Copy,
  Check,
  Send,
  Calendar,
  Bell,
  BellRing,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { UserSubscription, AppLanguage } from "../types";
import {
  calculateMorningProgress,
  getTodayPhrase,
  buildWhatsAppLink,
  requestMorningNotifications,
} from "../utils/morningTracker";
import { getTranslation } from "../i18n/translations";

interface MorningBannerProps {
  subscription: UserSubscription;
  firstSeenTimestamp: number;
  notificationsEnabled: boolean;
  onToggleNotification: () => void;
  onOpenModal: () => void;
  language: AppLanguage;
}

export const MorningBanner: React.FC<MorningBannerProps> = ({
  subscription,
  firstSeenTimestamp,
  notificationsEnabled,
  onToggleNotification,
  onOpenModal,
  language,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const t = getTranslation(language);
  const { currentDay, daysRemaining } = calculateMorningProgress(firstSeenTimestamp);
  const todayPhrase = getTodayPhrase(currentDay, language);

  const handleCopy = () => {
    navigator.clipboard.writeText(todayPhrase.phrase);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNotificationClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await requestMorningNotifications(todayPhrase, language);
    if (success) {
      onToggleNotification();
    }
  };

  return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-zinc-900 border border-amber-500/30 p-3 sm:p-4 shadow-lg transition-all animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                {t.morningBannerTitle}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {t.morningDayBadge(currentDay, daysRemaining)}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 block sm:inline">
              {t.morningBannerSubtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-3">
          <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
            <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed italic">
              "{todayPhrase.phrase}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{t.copy}</span>
                  </>
                )}
              </button>

              {/* WhatsApp Button */}
              <a
                href={buildWhatsAppLink(todayPhrase.phrase)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 no-underline shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendWhatsApp}</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Button */}
              <button
                onClick={handleNotificationClick}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  notificationsEnabled
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
                }`}
                title="Morning notification alert"
              >
                {notificationsEnabled ? (
                  <>
                    <BellRing className="w-3 h-3 text-amber-400" />
                    <span>{t.alertActive}</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3 text-zinc-400" />
                    <span>{t.remindTomorrow}</span>
                  </>
                )}
              </button>

              {/* View all 14 days */}
              <button
                onClick={onOpenModal}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.view14Days}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
