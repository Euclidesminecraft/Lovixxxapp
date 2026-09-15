import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Crown,
  Zap,
  Sparkles,
  Sliders,
  Sun,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  BellRing,
  Gauge,
  Cpu,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  AuthUser,
  UserSubscription,
  MorningTrackerState,
  AppLanguage,
  PlanPeriod,
} from "../types";
import { getAdminCustomCode, setAdminCustomCode } from "../utils/auth";
import { getTranslation } from "../i18n/translations";

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  subscription: UserSubscription;
  onUpdateSubscription: (updated: Partial<UserSubscription>) => void;
  morningState: MorningTrackerState;
  onUpdateMorningState: (updated: Partial<MorningTrackerState>) => void;
  onTriggerMorningTest: () => void;
  language: AppLanguage;
  totalGenerationsCount: number;
  totalFavoritesCount: number;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  subscription,
  onUpdateSubscription,
  morningState,
  onUpdateMorningState,
  onTriggerMorningTest,
  language,
  totalGenerationsCount,
  totalFavoritesCount,
}) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<"vip" | "ai" | "morning" | "security">("vip");

  // Secret code management
  const [currentCode, setCurrentCode] = useState(() => getAdminCustomCode());
  const [newSecretCode, setNewSecretCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // AI settings (stored locally for session/app)
  const [aiTemperature, setAiTemperature] = useState<number>(() => {
    const saved = localStorage.getItem("lovix_admin_temp");
    return saved ? parseFloat(saved) : 0.85;
  });
  const [aiPresetMode, setAiPresetMode] = useState<string>(() => {
    return localStorage.getItem("lovix_admin_ai_mode") || "spicy";
  });

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSetUnlimitedCredits = () => {
    onUpdateSubscription({
      isPro: true,
      creditsRemaining: 999999,
      maxDailyCredits: 999999,
      planId: "admin_vip",
    });
    showToast(language === "pt" ? "Acesso VIP com créditos infinitos ativado!" : "VIP Access with infinite credits unlocked!");
  };

  const handleAdd100Credits = () => {
    onUpdateSubscription({
      creditsRemaining: (subscription.creditsRemaining || 0) + 100,
    });
    showToast(language === "pt" ? "+100 Créditos adicionados com sucesso!" : "+100 Credits added successfully!");
  };

  const handleToggleProStatus = (isPro: boolean) => {
    onUpdateSubscription({
      isPro,
      creditsRemaining: isPro ? 999999 : 5,
      maxDailyCredits: isPro ? 999999 : 5,
      planId: isPro ? "admin_vip" : undefined,
    });
    showToast(
      isPro
        ? language === "pt"
          ? "Status PRO/VIP ativado!"
          : "PRO/VIP status activated!"
        : language === "pt"
        ? "Modo Free redefinido (5 créditos)."
        : "Free mode reset (5 credits)."
    );
  };

  const handleSetPlan = (plan: PlanPeriod | "admin_vip") => {
    onUpdateSubscription({
      isPro: true,
      planId: plan,
      creditsRemaining: 999999,
      activatedAt: Date.now(),
    });
    showToast(`${language === "pt" ? "Plano alterado para" : "Plan switched to"}: ${plan.toUpperCase()}`);
  };

  const handleSaveAiSettings = () => {
    localStorage.setItem("lovix_admin_temp", aiTemperature.toString());
    localStorage.setItem("lovix_admin_ai_mode", aiPresetMode);
    showToast(language === "pt" ? "Configurações de IA salvas com sucesso!" : "AI settings updated successfully!");
  };

  const handleSaveNewSecretCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretCode.trim()) return;
    setAdminCustomCode(newSecretCode.trim());
    setCurrentCode(newSecretCode.trim());
    setNewSecretCode("");
    showToast(language === "pt" ? "Novo código secreto salvo!" : "New secret code configured!");
  };

  // 14-day routine day jumper
  const handleJumpDay = (day: number) => {
    const fakeFirstSeen = Date.now() - (day - 1) * 24 * 60 * 60 * 1000;
    onUpdateMorningState({
      firstSeenTimestamp: fakeFirstSeen,
      lastNotifiedDate: null,
    });
    showToast(language === "pt" ? `Rotina ajustada para o Dia ${day}!` : `Routine adjusted to Day ${day}!`);
  };

  return (
    <div
      id="admin-control-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="admin-control-modal-content"
        className="relative w-full max-w-2xl bg-[#111114] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#141418] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <span>PAINEL DE CONTROLE ADM</span>
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-300" /> VIP MASTER
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {language === "pt"
                  ? "Gestão Suprema de VIP, Créditos, IA e Rotina Matinal"
                  : "Supreme Control of VIP Access, Credits, AI Engine & Routine"}
              </p>
            </div>
          </div>
          <button
            id="close-admin-control-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-xl border border-transparent hover:border-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex bg-[#0d0d10] border-b border-white/[0.06] p-1.5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("vip")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "vip"
                ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "pt" ? "Controle VIP & Créditos" : "VIP & Credits"}</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ai"
                ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === "pt" ? "Motor de IA & Ousadia" : "AI & Creativity"}</span>
          </button>

          <button
            onClick={() => setActiveTab("morning")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "morning"
                ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "pt" ? "Rotina 14 Dias" : "14-Day Routine"}</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-300" />
            <span>{language === "pt" ? "Código Secreto & Métricas" : "Secret Code & Metrics"}</span>
          </button>
        </div>

        {/* Feedback alert if any */}
        {feedback && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: VIP & CREDITS */}
          {activeTab === "vip" && (
            <div className="space-y-5">
              {/* Status banner */}
              <div className="p-4 rounded-xl bg-[#16161b] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {language === "pt" ? "Status da Conta:" : "Account Status:"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        subscription.isPro
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {subscription.isPro ? "VIP PRO ATIVO" : "FREE TIER"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">
                    {language === "pt" ? "Créditos Disponíveis:" : "Remaining Credits:"}{" "}
                    <span className="font-semibold text-amber-300">
                      {subscription.isPro ? "ILIMITADO (VIP)" : subscription.creditsRemaining}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleProStatus(!subscription.isPro)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      subscription.isPro
                        ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border-white/[0.08]"
                        : "bg-rose-600 hover:bg-rose-500 text-white border-transparent shadow-sm"
                    }`}
                  >
                    {subscription.isPro
                      ? language === "pt"
                        ? "Desativar VIP"
                        : "Disable VIP"
                      : language === "pt"
                      ? "Ativar VIP Imediato"
                      : "Activate VIP Now"}
                  </button>
                </div>
              </div>

              {/* Quick credit buttons */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{language === "pt" ? "Ações Rápidas de Créditos" : "Quick Credit Actions"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={handleSetUnlimitedCredits}
                    className="p-3 bg-[#16161b] border border-amber-400/20 hover:border-amber-400/40 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-amber-300 font-medium text-xs">
                      <Crown className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
                      <span>{language === "pt" ? "Créditos Infinitos" : "Infinite Credits"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {language === "pt" ? "Define 999.999 créditos VIP" : "Set 999,999 VIP credits"}
                    </p>
                  </button>

                  <button
                    onClick={handleAdd100Credits}
                    className="p-3 bg-[#16161b] border border-white/[0.06] hover:border-white/[0.12] rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-zinc-200 font-medium text-xs">
                      <Zap className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
                      <span>{language === "pt" ? "+100 Créditos" : "+100 Credits"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {language === "pt" ? "Adiciona sem mudar o plano" : "Add without plan change"}
                    </p>
                  </button>

                  <button
                    onClick={() => handleToggleProStatus(false)}
                    className="p-3 bg-[#16161b] border border-white/[0.06] hover:border-rose-500/30 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-zinc-300 font-medium text-xs">
                      <RotateCcw className="w-4 h-4 text-rose-400 group-hover:scale-105 transition-transform" />
                      <span>{language === "pt" ? "Resetar Free (5)" : "Reset Free (5)"}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {language === "pt" ? "Volta para o plano gratuito" : "Return to free limits"}
                    </p>
                  </button>
                </div>
              </div>

              {/* Force plan switch */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-rose-400" />
                  <span>{language === "pt" ? "Simular Planos do Sistema" : "Simulate Subscription Tier"}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                  {(["weekly", "monthly", "annual", "lifetime"] as PlanPeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => handleSetPlan(period)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        subscription.planId === period
                          ? "bg-amber-400/10 text-amber-300 border-amber-400/30 font-semibold"
                          : "bg-[#16161b] text-zinc-400 hover:text-zinc-200 border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      <span className="capitalize">{period}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI & CREATIVITY ENGINE */}
          {activeTab === "ai" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#16161b] border border-white/[0.06] space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      {language === "pt" ? "Temperatura / Criatividade da IA" : "AI Temperature / Banter Creativity"}
                    </span>
                    <span className="font-mono font-semibold text-amber-400">{aiTemperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={aiTemperature}
                    onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>0.20 (Conservador)</span>
                    <span>0.85 (Padrão Lovix)</span>
                    <span>1.00 (Máxima ousadia)</span>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-3">
                  <label className="block text-xs font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>{language === "pt" ? "Perfil de Dinâmica Social" : "Social Dynamics Profile"}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "spicy", label: "Provocação & Tensão", desc: "Push-pull afiado e alto valor" },
                      { id: "romantic", label: "Romântico & Fofo", desc: "Complicidade e carinho sutil" },
                      { id: "direct", label: "Direto & Confiante", desc: "Objetivo e liderança de conversa" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setAiPresetMode(mode.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          aiPresetMode === mode.id
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            : "bg-[#111114] text-zinc-400 hover:text-zinc-200 border-white/[0.06]"
                        }`}
                      >
                        <div className="font-semibold text-xs">{mode.label}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAiSettings}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  {language === "pt" ? "Salvar Parâmetros da IA" : "Save AI Parameters"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MORNING ROUTINE */}
          {activeTab === "morning" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#16161b] border border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>{language === "pt" ? "Salto Temporal da Rotina (1 a 14 Dias)" : "Routine Time Jump (Days 1 to 14)"}</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {language === "pt"
                        ? "Pule instantaneamente para qualquer dia da rotina para desbloquear e testar a frase correspondente."
                        : "Jump to any day to inspect and test the corresponding phrase instantly."}
                    </p>
                  </div>
                </div>

                {/* Day Jump Grid */}
                <div className="grid grid-cols-7 sm:grid-cols-7 gap-1.5">
                  {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      onClick={() => handleJumpDay(d)}
                      className="py-2 rounded-lg bg-[#111114] hover:bg-amber-400/10 hover:text-amber-300 border border-white/[0.06] hover:border-amber-400/30 text-xs font-medium text-zinc-300 transition-all cursor-pointer"
                    >
                      D{d}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onTriggerMorningTest}
                    className="flex-1 py-2.5 px-3 bg-amber-400/10 hover:bg-amber-400/15 text-amber-300 border border-amber-400/20 rounded-xl text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <BellRing className="w-4 h-4 text-amber-400" />
                    <span>{language === "pt" ? "Testar Notificação Agora" : "Test Notification Now"}</span>
                  </button>

                  <button
                    onClick={() => handleJumpDay(1)}
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-white/[0.06]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === "pt" ? "Reiniciar para Dia 1" : "Reset to Day 1"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & METRICS */}
          {activeTab === "security" && (
            <div className="space-y-5">
              {/* Secret Code Setup */}
              <div className="p-4 rounded-xl bg-[#16161b] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>{language === "pt" ? "Código Secreto Master de Administrador" : "Master Admin Secret Code"}</span>
                  </h4>
                  <span className="font-mono text-xs text-amber-300 font-medium bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {currentCode}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {language === "pt"
                    ? "Este é o código que libera o login administrativo e o modo VIP Supremo."
                    : "This code unlocks administrative login and VIP supreme access."}
                </p>

                <form onSubmit={handleSaveNewSecretCode} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSecretCode}
                    onChange={(e) => setNewSecretCode(e.target.value)}
                    placeholder={language === "pt" ? "Novo código secreto (ex: MEU-ADM-2026)" : "New secret code"}
                    className="flex-1 bg-[#111114] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    {language === "pt" ? "Atualizar" : "Update"}
                  </button>
                </form>
              </div>

              {/* App Real-Time Metrics */}
              <div className="p-4 rounded-xl bg-[#16161b] border border-white/[0.06] space-y-3">
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  {language === "pt" ? "Métricas em Tempo Real" : "Real-Time App Metrics"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#111114] border border-white/[0.06]">
                    <div className="text-[11px] text-zinc-400">{language === "pt" ? "Histórico de Respostas" : "History Replies"}</div>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">{totalGenerationsCount}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111114] border border-white/[0.06]">
                    <div className="text-[11px] text-zinc-400">{language === "pt" ? "Mensagens Favoritas" : "Favorites Saved"}</div>
                    <div className="text-lg font-bold text-rose-400 mt-0.5">{totalFavoritesCount}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111114] border border-white/[0.06]">
                    <div className="text-[11px] text-zinc-400">{language === "pt" ? "Idioma Ativo" : "Active Language"}</div>
                    <div className="text-lg font-bold text-white mt-0.5 uppercase">{language}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-[#141418] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{language === "pt" ? "Sessão Administrativa Conectada" : "Admin Session Active"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium cursor-pointer transition-colors border border-white/[0.06]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
