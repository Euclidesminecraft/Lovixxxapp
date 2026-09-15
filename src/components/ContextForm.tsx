import React, { useState } from "react";
import {
  LovixContext,
  RelacaoTipo,
  ObjetivoTipo,
  EstiloTom,
  ScenarioPreset,
  UserSubscription,
  AppLanguage,
} from "../types";
import { getPresetScenarios } from "../data/presets";
import { ImageUploader } from "./ImageUploader";
import {
  Sparkles,
  MessageSquare,
  Users,
  Palette,
  Flame,
  Zap,
  Compass,
  Crown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getTranslation } from "../i18n/translations";

interface ContextFormProps {
  context: LovixContext;
  onChange: (updated: Partial<LovixContext>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onApplyPreset: (preset: ScenarioPreset) => void;
  subscription: UserSubscription;
  onOpenPricing: () => void;
  language: AppLanguage;
}

export const ContextForm: React.FC<ContextFormProps> = ({
  context,
  onChange,
  onSubmit,
  isLoading,
  onApplyPreset,
  subscription,
  onOpenPricing,
  language,
}) => {
  const t = getTranslation(language);
  const presets = getPresetScenarios(language);

  const [inputMode, setInputMode] = useState<"text" | "image" | "both">(
    context.image ? "image" : "both"
  );
  const [showAllRumos, setShowAllRumos] = useState(false);

  const hasText = Boolean(context.mensagem.trim());
  const hasImage = Boolean(context.image?.data);
  const hasInput = hasText || hasImage;

  const isOutOfCredits =
    !subscription.isPro && subscription.creditsRemaining <= 0;
  const canSubmit = !isLoading && hasInput && !isOutOfCredits;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) {
        onSubmit();
      } else if (isOutOfCredits) {
        onOpenPricing();
      }
    }
  };

  const handleSliderChange = (val: number) => {
    onChange({ ousadia: val });
  };

  const RELACOES_ITEMS: { value: RelacaoTipo; label: string }[] =
    language === "pt"
      ? [
          { value: "Match (Tinder / Bumble / Hinge)", label: "Match (Tinder / Bumble / Hinge)" },
          { value: "Crush recente", label: "Crush recente" },
          { value: "Ficante", label: "Ficante / Quase algo" },
          { value: "Amigo(a) com interesse", label: "Amigo(a) com interesse mútuo" },
          { value: "Conversa que está esfriando", label: "Conversa que está esfriando" },
          { value: "Ex", label: "Ex / Histórico complexo" },
        ]
      : [
          { value: "Match (Tinder / Bumble / Hinge)", label: "Dating App Match (Tinder / Hinge / Bumble)" },
          { value: "Crush recente", label: "Recent Crush / Casual interest" },
          { value: "Ficante", label: "Situationship / Exclusive dating" },
          { value: "Amigo(a) com interesse", label: "Friend with romantic tension" },
          { value: "Conversa que está esfriando", label: "Conversation growing cold" },
          { value: "Ex", label: "Ex / Complicated past" },
        ];

  const RUMOS_SUGERIDOS =
    language === "pt"
      ? [
          {
            title: "Chamar pra sair / Tomar um drink",
            icon: "🍸",
            desc: "Transição sutil para um encontro real sem parecer desesperado.",
          },
          {
            title: "Criar tensão sexual & sair da friendzone",
            icon: "🔥",
            desc: "Quebrar o padrão de 'amiguinho' e ativar atração magnética.",
          },
          {
            title: "Virar o jogo / Desarmar frieza e vácuo",
            icon: "🧊",
            desc: "Fazer a pessoa correr atrás e retomar o frame de poder.",
          },
          {
            title: "Fazer rir & quebrar o gelo com humor",
            icon: "😂",
            desc: "Aliviar o clima e criar cumplicidade descontraída.",
          },
          {
            title: "Aprofundar intimidade & conexão real",
            icon: "💬",
            desc: "Fazer a pessoa se abrir e revelar segredos/gostos.",
          },
          {
            title: "Pedir o WhatsApp / Instagram",
            icon: "📱",
            desc: "Mudar de plataforma com naturalidade e confiança.",
          },
        ]
      : [
          {
            title: "Ask out for drinks / Set up a real date",
            icon: "🍸",
            desc: "Smooth transition into a physical date without sounding needy.",
          },
          {
            title: "Escalate romantic tension & exit friendzone",
            icon: "🔥",
            desc: "Break platonic frames and ignite mutual desire.",
          },
          {
            title: "Turn the tables / Call out slow replies",
            icon: "🧊",
            desc: "Take back the frame and compel them to qualify.",
          },
          {
            title: "Make them laugh & break the ice",
            icon: "😂",
            desc: "Disarm tension with witty conversational banter.",
          },
          {
            title: "Deepen genuine intimacy & connection",
            icon: "💬",
            desc: "Create genuine vulnerability and mutual resonance.",
          },
          {
            title: "Move to WhatsApp / Instagram gracefully",
            icon: "📱",
            desc: "Level up to private messaging effortlessly.",
          },
        ];

  const ESTILOS_ITEMS: { key: EstiloTom; label: string; desc: string }[] =
    language === "pt"
      ? [
          {
            key: "Provocador/Teasing",
            label: "Provocador / Teasing",
            desc: "Desafie a pessoa com ironia leve",
          },
          {
            key: "Misterioso",
            label: "Misterioso",
            desc: "Curto, intrigante e não entrega tudo",
          },
          {
            key: "Romântico/Fofo",
            label: "Romântico / Conexão",
            desc: "Conexão real sem melosidade",
          },
          {
            key: "Direto/Confiante",
            label: "Direto / Confiante",
            desc: "Sem rodeios, intenção clara",
          },
          {
            key: "Engraçado",
            label: "Engraçado / Sagaz",
            desc: "Humor observacional sagaz",
          },
        ]
      : [
          {
            key: "Provocador/Teasing",
            label: "Playful Tease / Witty",
            desc: "Challenge them with effortless charm",
          },
          {
            key: "Misterioso",
            label: "Mysterious & High Value",
            desc: "Concise, intriguing, leaves them curious",
          },
          {
            key: "Romântico/Fofo",
            label: "Authentic & Flirtatious",
            desc: "Warm connection without being needy",
          },
          {
            key: "Direto/Confiante",
            label: "Direct & Bold",
            desc: "High status, unambiguous intentions",
          },
          {
            key: "Engraçado",
            label: "Observational Humor",
            desc: "Clever wit and banter",
          },
        ];

  const OUSADIA_LABELS: { [key: number]: { title: string; color: string } } =
    language === "pt"
      ? {
          1: { title: "1 • Sutil & Elegante", color: "text-blue-400" },
          2: { title: "2 • Descontraído & Leve", color: "text-emerald-400" },
          3: { title: "3 • Push-Pull Balanceado", color: "text-amber-400" },
          4: { title: "4 • Provocação Nítida", color: "text-orange-400" },
          5: { title: "5 • Alta Tensão (Ousadia Máxima)", color: "text-rose-500" },
        }
      : {
          1: { title: "1 • Subtle & Polite", color: "text-blue-400" },
          2: { title: "2 • Relaxed & Casual", color: "text-emerald-400" },
          3: { title: "3 • Balanced Push-Pull", color: "text-amber-400" },
          4: { title: "4 • Provocative & Bold", color: "text-orange-400" },
          5: { title: "5 • High Tension (Max Audacity)", color: "text-rose-500" },
        };

  return (
    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col gap-5 sm:gap-6">
      {/* 1. Quick Scenario Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-zinc-400" /> {t.scenariosTitle}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            {language === "pt" ? "Atalhos rápidos" : "Quick presets"}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="shrink-0 px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-white/[0.06] hover:border-white/[0.14] text-left transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-semibold tracking-wide text-rose-400 block group-hover:text-rose-300">
                {preset.badge}
              </span>
              <span className="text-xs text-zinc-300 font-medium line-clamp-1 max-w-[140px]">
                {preset.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Input Mode Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />{" "}
            {language === "pt" ? "Entrada da Conversa" : "Conversation Input"}
          </span>

          <div className="inline-flex bg-zinc-950/90 p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-medium ${
                inputMode === "text"
                  ? "bg-zinc-800 text-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.inputModeText}
            </button>
            <button
              type="button"
              onClick={() => setInputMode("image")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-medium ${
                inputMode === "image"
                  ? "bg-zinc-800 text-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.inputModeImage}
            </button>
            <button
              type="button"
              onClick={() => setInputMode("both")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-medium ${
                inputMode === "both"
                  ? "bg-zinc-800 text-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.inputModeBoth}
            </button>
          </div>
        </div>

        {/* Image Uploader */}
        {(inputMode === "image" || inputMode === "both") && (
          <div className="animate-in fade-in duration-150">
            <ImageUploader
              image={context.image}
              onImageChange={(img) => onChange({ image: img })}
            />
          </div>
        )}

        {/* Textarea */}
        {(inputMode === "text" || inputMode === "both") && (
          <div className="animate-in fade-in duration-150 relative">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="input-mensagem"
                className="text-[11px] text-zinc-400 font-medium"
              >
                {context.image
                  ? t.contextExtraLabel
                  : t.receivedMessageLabel}
              </label>
              {context.mensagem && (
                <button
                  onClick={() => onChange({ mensagem: "" })}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {t.clear}
                </button>
              )}
            </div>
            <textarea
              id="input-mensagem"
              rows={2}
              value={context.mensagem}
              onChange={(e) => onChange({ mensagem: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder={
                context.image
                  ? language === "pt"
                    ? "Ex: Ela mandou isso faz 2h... ou deixe em branco pro Lovix ler o print sozinho."
                    : "e.g., 'Sent this 2 hours ago...' or leave empty for Lovix to analyze screenshot alone."
                  : t.placeholderText
              }
              className="w-full bg-zinc-950/80 border border-white/[0.08] focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/10 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 transition-all resize-none outline-none leading-relaxed shadow-inner"
            />
          </div>
        )}
      </div>

      {/* 3. Strategic Direction */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            {language === "pt"
              ? "Rumo que a conversa deve seguir"
              : "Intended Conversation Direction"}
          </label>
          <span className="text-[10px] text-zinc-400 font-medium">
            {language === "pt" ? "Estratégia" : "Strategy"}
          </span>
        </div>

        {/* Suggested direction cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(showAllRumos ? RUMOS_SUGERIDOS : RUMOS_SUGERIDOS.slice(0, 4)).map(
            (rumo) => {
              const isSelected = context.rumoConversa === rumo.title;
              return (
                <button
                  key={rumo.title}
                  type="button"
                  onClick={() =>
                    onChange({
                      rumoConversa: isSelected ? "" : rumo.title,
                    })
                  }
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? "bg-rose-500/[0.08] border-rose-500/50 text-white shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]"
                      : "bg-zinc-900/40 border-white/[0.06] text-zinc-300 hover:bg-zinc-900/80 hover:border-white/[0.12] hover:text-white"
                  }`}
                >
                  <span className="text-base shrink-0">{rumo.icon}</span>
                  <span className="text-xs font-medium truncate leading-tight">
                    {rumo.title}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            onClick={() => setShowAllRumos(!showAllRumos)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors font-medium"
          >
            {showAllRumos ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />{" "}
                {language === "pt" ? "Menos opções" : "Fewer options"}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />{" "}
                {language === "pt"
                  ? `Ver mais rumos (${RUMOS_SUGERIDOS.length})`
                  : `See more directions (${RUMOS_SUGERIDOS.length})`}
              </>
            )}
          </button>

          {context.rumoConversa && (
            <button
              type="button"
              onClick={() => onChange({ rumoConversa: "" })}
              className="text-[11px] text-zinc-400 hover:text-rose-400 cursor-pointer font-medium"
            >
              {language === "pt" ? "Limpar rumo" : "Clear direction"}
            </button>
          )}
        </div>

        {/* Custom Rumo input */}
        <input
          id="input-custom-rumo"
          type="text"
          value={context.rumoConversa || ""}
          onChange={(e) => onChange({ rumoConversa: e.target.value })}
          placeholder={
            language === "pt"
              ? "Ou digite seu rumo próprio (ex: Fazer ela marcar o date)..."
              : "Or type your custom direction (e.g., Get them to suggest dinner)..."
          }
          className="w-full bg-zinc-900/70 border border-white/[0.06] focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/20 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
        />
      </div>

      {/* 4. Relationship & Tone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Relationship */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400" /> {t.relationshipLabel}
          </label>
          <select
            value={context.relacao}
            onChange={(e) =>
              onChange({ relacao: e.target.value as RelacaoTipo })
            }
            className="w-full bg-zinc-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-rose-500/70 transition-colors cursor-pointer"
          >
            {RELACOES_ITEMS.map((rel) => (
              <option
                key={rel.value}
                value={rel.value}
                className="bg-zinc-950 text-zinc-200"
              >
                {rel.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-zinc-400" /> {t.toneLabel}
          </label>
          <select
            value={context.tom}
            onChange={(e) => onChange({ tom: e.target.value as EstiloTom })}
            className="w-full bg-zinc-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-rose-500/70 transition-colors cursor-pointer"
          >
            {ESTILOS_ITEMS.map((est) => (
              <option
                key={est.key}
                value={est.key}
                className="bg-zinc-950 text-zinc-200"
              >
                {est.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Tension & Audacity Level */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" /> {t.audacityLabel}
          </span>
          <span
            className={`text-xs font-semibold ${
              OUSADIA_LABELS[context.ousadia]?.color || "text-rose-400"
            }`}
          >
            {OUSADIA_LABELS[context.ousadia]?.title}
          </span>
        </div>

        {/* Audacity Level Selector buttons for crisp feedback */}
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isLvl = context.ousadia === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleSliderChange(lvl)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  isLvl
                    ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                    : "bg-zinc-900/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-0.5">
          <span>{language === "pt" ? "Sutil" : "Subtle"}</span>
          <span>{language === "pt" ? "Equilibrado" : "Balanced"}</span>
          <span className="text-rose-400 font-semibold">
            {language === "pt" ? "Alta Tensão" : "High Tension"}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      {isOutOfCredits ? (
        <button
          id="generate-responses-btn"
          type="button"
          onClick={onOpenPricing}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
        >
          <Crown className="w-4 h-4 text-amber-200" />
          <span>
            {language === "pt"
              ? "Créditos diários esgotados • Ativar Lovix PRO"
              : "Daily credits exhausted • Activate Lovix PRO"}
          </span>
        </button>
      ) : (
        <button
          id="generate-responses-btn"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(30);
            }
            onSubmit();
          }}
          disabled={!canSubmit}
          className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            !canSubmit
              ? "bg-zinc-900 text-zinc-500 cursor-not-allowed border border-white/[0.04]"
              : "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.5),0_4px_16px_rgba(225,29,72,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.99]"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                {language === "pt"
                  ? "Lovix arquitetando 3 respostas..."
                  : "Lovix crafting 3 magnetic replies..."}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {subscription.isPro
                  ? language === "pt"
                    ? "Gerar 3 Respostas (VIP Ilimitado)"
                    : "Generate 3 Replies (VIP Unlimited)"
                  : language === "pt"
                  ? `Gerar 3 Respostas (${subscription.creditsRemaining} restantes)`
                  : `Generate 3 Replies (${subscription.creditsRemaining} remaining)`}
              </span>
            </>
          )}
        </button>
      )}

      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 -mt-2">
        <span>
          {language === "pt" ? "Atalho:" : "Shortcut:"}{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.06] text-zinc-300 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>
        </span>
        {!subscription.isPro && (
          <button
            type="button"
            onClick={onOpenPricing}
            className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
          >
            {language === "pt"
              ? "Quer gerações ilimitadas? Seja PRO"
              : "Want unlimited generations? Go PRO"}
          </button>
        )}
      </div>
    </div>
  );
};
