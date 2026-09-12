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
    <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-5">
      {/* 1. Quick Scenario Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> {t.scenariosTitle}
          </span>
          <span className="text-[10px] text-zinc-400">
            {language === "pt" ? "1 clique" : "1 click"}
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-800/70 text-left transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-bold text-rose-400 block group-hover:text-rose-300">
                {preset.badge}
              </span>
              <span className="text-[11px] text-zinc-300 line-clamp-1 max-w-[140px]">
                {preset.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Input Mode Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-rose-400" />{" "}
            {language === "pt" ? "Entrada da Conversa" : "Conversation Input"}
          </span>

          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                inputMode === "text"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.inputModeText}
            </button>
            <button
              type="button"
              onClick={() => setInputMode("image")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                inputMode === "image"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.inputModeImage}
            </button>
            <button
              type="button"
              onClick={() => setInputMode("both")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                inputMode === "both"
                  ? "bg-zinc-800 text-white shadow-sm"
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
                  className="text-[10px] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
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
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all resize-none outline-none leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* 3. Strategic Direction */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-zinc-950/70 border border-rose-500/25">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            {language === "pt"
              ? "Rumo que a conversa deve seguir"
              : "Intended Conversation Direction"}
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">
            {language === "pt" ? "Estratégia" : "Strategy"}
          </span>
        </div>

        {/* Suggested chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                  className={`p-2 rounded-lg text-left border transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-rose-950/50 border-rose-500 text-white ring-1 ring-rose-500/40"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span className="text-sm shrink-0">{rumo.icon}</span>
                  <span className="text-xs font-semibold truncate leading-tight">
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
            className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            {showAllRumos ? (
              <>
                <ChevronUp className="w-3 h-3" />{" "}
                {language === "pt" ? "Menos opções" : "Fewer options"}
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />{" "}
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
              className="text-[10px] text-zinc-400 hover:text-rose-400 cursor-pointer"
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
          className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
        />
      </div>

      {/* 4. Relationship & Tone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Relationship */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-rose-400" /> {t.relationshipLabel}
          </label>
          <select
            value={context.relacao}
            onChange={(e) =>
              onChange({ relacao: e.target.value as RelacaoTipo })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-rose-500 transition-colors cursor-pointer"
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
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Palette className="w-3 h-3 text-rose-400" /> {t.toneLabel}
          </label>
          <select
            value={context.tom}
            onChange={(e) => onChange({ tom: e.target.value as EstiloTom })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-rose-500 transition-colors cursor-pointer"
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
      <div className="space-y-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" /> {t.audacityLabel}
          </span>
          <span
            className={`text-xs font-bold ${
              OUSADIA_LABELS[context.ousadia]?.color || "text-rose-400"
            }`}
          >
            {OUSADIA_LABELS[context.ousadia]?.title}
          </span>
        </div>

        <input
          id="slider-ousadia"
          type="range"
          min={1}
          max={5}
          step={1}
          value={context.ousadia}
          onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
          className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
        />

        <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
          <span>{language === "pt" ? "1. Sutil" : "1. Subtle"}</span>
          <span>{language === "pt" ? "2. Leve" : "2. Light"}</span>
          <span>{language === "pt" ? "3. Balanceado" : "3. Balanced"}</span>
          <span>{language === "pt" ? "4. Provocador" : "4. Playful"}</span>
          <span className="text-rose-400 font-bold">
            {language === "pt" ? "5. Alta Tensão" : "5. High Tension"}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      {isOutOfCredits ? (
        <button
          id="generate-responses-btn"
          type="button"
          onClick={onOpenPricing}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Crown className="w-4 h-4 text-amber-300" />
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
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
            !canSubmit
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40"
              : "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-600/30 hover:shadow-rose-600/40 active:scale-[0.99]"
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

      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <span>
          {language === "pt" ? "Atalho:" : "Shortcut:"}{" "}
          <kbd className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>
        </span>
        {!subscription.isPro && (
          <button
            type="button"
            onClick={onOpenPricing}
            className="text-rose-400 hover:underline cursor-pointer font-medium"
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
