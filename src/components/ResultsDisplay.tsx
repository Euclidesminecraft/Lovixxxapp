import React, { useState } from "react";
import {
  ParsedOption,
  GenerationResult,
  UserSubscription,
  AppLanguage,
} from "../types";
import {
  Copy,
  Check,
  Smartphone,
  Sparkles,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Flame,
  Compass,
  FileImage,
  Crown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getTranslation } from "../i18n/translations";

interface ResultsDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  subscription?: UserSubscription;
  onOpenPricing?: () => void;
  language: AppLanguage;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  isLoading,
  onToggleFavorite,
  isFavorite,
  subscription,
  onOpenPricing,
  language,
}) => {
  const t = getTranslation(language);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(1);
  const [showChatSimulator, setShowChatSimulator] = useState(true);
  const [analysisMap, setAnalysisMap] = useState<{ [key: number]: string }>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<number | null>(null);

  const handleCopyOption = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const textToCopy =
      result.rawText ||
      result.options
        .map((opt) => `${opt.number}. ${opt.text}`)
        .join("\n");
    navigator.clipboard.writeText(textToCopy);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([25, 40, 25]);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleFetchAnalysis = async (option: ParsedOption) => {
    if (!result) return;
    if (analysisMap[option.number]) {
      const next = { ...analysisMap };
      delete next[option.number];
      setAnalysisMap(next);
      return;
    }

    setLoadingAnalysis(option.number);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resposta: option.text,
          mensagem: result.context.mensagem,
          relacao: result.context.relacao,
          rumoConversa: result.context.rumoConversa,
          image: result.context.image,
          language: language,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisMap((prev) => ({
          ...prev,
          [option.number]: data.analysis,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(null);
    }
  };

  const getBadgeDetails = (num: number) => {
    if (language === "pt") {
      switch (num) {
        case 1:
          return {
            label: "Opção 1 • Equilibrada & Segura",
            bg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
            border: "hover:border-blue-500/40",
            desc: "Mantém a conversa natural e abre espaço sem se expor demais.",
          };
        case 2:
          return {
            label: "Opção 2 • Provocadora & Magnética",
            bg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
            border: "hover:border-amber-500/40",
            desc: "Técnica Push-Pull: provoca levemente gerando sorriso e curiosidade.",
          };
        case 3:
          return {
            label: "Opção 3 • Ousada & Direta",
            bg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
            border: "hover:border-rose-500/40",
            desc: "Tensão alta: atitude confiante, sem joguinhos e com intenção clara.",
          };
        default:
          return {
            label: `Opção ${num}`,
            bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
            border: "hover:border-zinc-700",
            desc: "",
          };
      }
    } else {
      switch (num) {
        case 1:
          return {
            label: "Option 1 • Balanced & Smooth",
            bg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
            border: "hover:border-blue-500/40",
            desc: "Keeps conversation natural with effortless high status.",
          };
        case 2:
          return {
            label: "Option 2 • Playful & Witty Tease",
            bg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
            border: "hover:border-amber-500/40",
            desc: "Push-Pull dynamics: challenges playfully, creating tension.",
          };
        case 3:
          return {
            label: "Option 3 • Bold & High Tension",
            bg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
            border: "hover:border-rose-500/40",
            desc: "High stakes: unapologetic confidence with clear attraction frame.",
          };
        default:
          return {
            label: `Option ${num}`,
            bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
            border: "hover:border-zinc-700",
            desc: "",
          };
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[460px] text-center shadow-[0_4px_24px_-2px_rgba(0,0,0,0.5)]">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.1] flex items-center justify-center shadow-lg relative">
            <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-rose-500/30 animate-ping pointer-events-none" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5 tracking-tight">
          {language === "pt"
            ? "Lovix calibrando as respostas..."
            : "Lovix calibrating magnetic replies..."}
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          {language === "pt"
            ? "Aplicando dinâmica social push-pull, dosando tensão e refinando o tom."
            : "Applying push-pull dynamics, tension calibration, and authentic tone."}
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[#111114]/60 border border-dashed border-white/[0.08] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[460px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
          <Smartphone className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-200 mb-1">
          {t.emptyResultsTitle}
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
          {t.emptyResultsSubtitle}
        </p>
      </div>
    );
  }

  const activePreviewOption =
    result.options.find((opt) => opt.number === selectedPreviewIndex) ||
    result.options[0];

  return (
    <div className="space-y-6">
      {/* Header of Results */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111114] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> {t.resultsHeaderTitle}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              • {t.toneLabel} {result.context.tom}
            </span>
          </div>

          {result.context.rumoConversa && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-300 font-medium bg-rose-500/[0.08] border border-rose-500/20 px-2.5 py-1 rounded-lg w-fit">
              <Compass className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>
                {language === "pt" ? "Rumo: " : "Direction: "}
                {result.context.rumoConversa}
              </span>
            </div>
          )}

          <p className="text-xs text-zinc-400 mt-1">
            {t.resultsHeaderSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onToggleFavorite(result.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isFavorite
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                : "bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-white hover:bg-zinc-850"
            }`}
            title="Save to Favorites"
          >
            {isFavorite ? (
              <BookmarkCheck className="w-4 h-4 text-rose-400" />
            ) : (
              <Bookmark className="w-4 h-4 text-zinc-400" />
            )}
            <span className="text-[11px] hidden sm:inline">
              {language === "pt" ? "Favoritar" : "Favorite"}
            </span>
          </button>

          <button
            id="copy-all-btn"
            onClick={handleCopyAll}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Copy all 3 replies"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  {language === "pt" ? "Todas Copiadas!" : "All Copied!"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>{language === "pt" ? "Copiar as 3" : "Copy All 3"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulated Smartphone Chat Simulator */}
      <div className="bg-[#09090b] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        {/* Chat Topbar */}
        <div className="bg-[#121215] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/[0.1] flex items-center justify-center font-semibold text-xs text-white">
              {result.context.relacao.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-200">
                {result.context.relacao}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {language === "pt" ? "online agora" : "online now"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              {language === "pt" ? "Simulador WhatsApp" : "Chat Preview"}
            </span>
            <button
              onClick={() => setShowChatSimulator(!showChatSimulator)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06] cursor-pointer transition-colors"
            >
              {showChatSimulator ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{language === "pt" ? "Recolher" : "Collapse"}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{language === "pt" ? "Ver no Chat" : "View in Chat"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        {showChatSimulator && (
          <div className="p-4 sm:p-5 space-y-4 bg-[#09090b] min-h-[160px] flex flex-col justify-end animate-in fade-in duration-150">
            {/* Received message (Left bubble) */}
            <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
              <span className="text-[10px] text-zinc-500 mb-1 ml-1 font-medium">
                {language === "pt" ? "Eles enviaram:" : "They sent:"}
              </span>
              <div className="bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-sm p-3.5 text-xs sm:text-sm leading-relaxed border border-white/[0.06] shadow-sm space-y-2">
                {result.context.image && result.context.image.data && (
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-zinc-950 max-w-[240px]">
                    <img
                      src={result.context.image.data}
                      alt="Print"
                      className="w-full max-h-52 object-cover"
                    />
                    <div className="p-1.5 bg-zinc-950/90 text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      <FileImage className="w-3 h-3 text-rose-400" />
                      <span className="truncate">
                        {result.context.image.name || "screenshot.jpg"}
                      </span>
                    </div>
                  </div>
                )}
                {result.context.mensagem && (
                  <p className="text-zinc-200">{result.context.mensagem}</p>
                )}
              </div>
            </div>

            {/* Selected Lovix Reply (Right bubble) */}
            {activePreviewOption && (
              <div className="flex flex-col items-end self-end max-w-[85%] sm:max-w-[75%] animate-in fade-in duration-150">
                <span className="text-[10px] text-rose-400 mb-1 mr-1 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Lovix •{" "}
                  {language === "pt" ? "Opção " : "Option "}
                  {activePreviewOption.number}
                </span>
                <div className="bg-rose-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-[0_2px_12px_rgba(225,29,72,0.3)]">
                  {activePreviewOption.text}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* The 3 Options List */}
      <div className="space-y-3.5">
        {result.options.map((opt) => {
          const badge = getBadgeDetails(opt.number);
          const isCopied = copiedIndex === opt.number;
          const isSelected = activePreviewOption?.number === opt.number;
          const analysis = analysisMap[opt.number];
          const isAnalyzing = loadingAnalysis === opt.number;

          return (
            <div
              key={opt.number}
              className={`bg-[#111114] border rounded-2xl p-4 sm:p-5 transition-all relative shadow-[0_2px_12px_rgba(0,0,0,0.3)] ${
                isSelected
                  ? "border-rose-500/60 ring-1 ring-rose-500/20"
                  : "border-white/[0.08] hover:border-white/[0.14]"
              }`}
            >
              {/* Option Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedPreviewIndex(opt.number)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "text-rose-300 bg-rose-500/15"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                    }`}
                    title="View in simulated chat"
                  >
                    {language === "pt" ? "Ver no chat" : "View in chat"}
                  </button>

                  <button
                    id={`copy-opt-${opt.number}-btn`}
                    onClick={() => handleCopyOption(opt.text, opt.number)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-white/[0.08]"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{t.copy}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message Text */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-zinc-100 font-sans text-sm sm:text-[15px] leading-relaxed select-text">
                "{opt.text}"
              </div>

              {/* Quick Psychology Hook explanation toggle */}
              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                <span className="text-[11px] text-zinc-400 font-normal">
                  {badge.desc}
                </span>
                <button
                  onClick={() => handleFetchAnalysis(opt)}
                  disabled={isAnalyzing}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>
                    {analysis
                      ? language === "pt"
                        ? "Ocultar análise"
                        : "Hide analysis"
                      : t.whyItWorks}
                  </span>
                </button>
              </div>

              {/* Dynamic Psychological Analysis */}
              {isAnalyzing && (
                <div className="mt-2.5 p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-xs text-zinc-400 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {language === "pt"
                      ? "Lovix dissecando o gatilho psicológico..."
                      : "Lovix dissecting psychological trigger..."}
                  </span>
                </div>
              )}

              {analysis && !isAnalyzing && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 text-xs text-zinc-200 leading-relaxed animate-in fade-in duration-150">
                  <strong className="block text-rose-400 font-semibold mb-1">
                    {language === "pt" ? "Gatilho Lovix:" : "Lovix Dynamics:"}
                  </strong>
                  {analysis}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pro Callout Banner if user is on Free plan */}
      {!subscription?.isPro && onOpenPricing && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                {t.proBannerCallout}
              </span>
              <span className="text-[11px] text-zinc-400">
                {t.proBannerPrice}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/50 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            {t.exploreProBtn}
          </button>
        </div>
      )}
    </div>
  );
};
