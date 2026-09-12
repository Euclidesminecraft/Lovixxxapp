import React from "react";
import { GenerationResult, AppLanguage } from "../types";
import {
  X,
  History,
  Trash2,
  Bookmark,
  BookmarkCheck,
  CornerDownLeft,
  Copy,
  Check,
} from "lucide-react";
import { getTranslation } from "../i18n/translations";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationResult[];
  onSelect: (item: GenerationResult) => void;
  onClear: () => void;
  onToggleFavorite: (id: string) => void;
  language: AppLanguage;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onToggleFavorite,
  language,
}) => {
  const t = getTranslation(language);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyHistoryItem = (
    item: GenerationResult,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const text =
      item.rawText ||
      item.options.map((o) => `${o.number}. ${o.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border-l border-zinc-800 w-full max-w-md h-full flex flex-col p-6 shadow-2xl text-zinc-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                {t.historyDrawerTitle}
              </h2>
              <p className="text-xs text-zinc-400">
                {history.length}{" "}
                {history.length === 1
                  ? language === "pt"
                    ? "registro salvo"
                    : "saved record"
                  : language === "pt"
                  ? "registros salvos"
                  : "saved records"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">
                {language === "pt"
                  ? "Nenhum histórico ainda."
                  : "No history yet."}
              </p>
              <p className="text-[11px] text-zinc-600 mt-1">
                {language === "pt"
                  ? "Gere respostas para salvar automaticamente aqui."
                  : "Generated replies will be automatically saved here."}
              </p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90 hover:border-rose-500/40 hover:bg-zinc-900/60 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {item.context.tom}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {dateStr}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="text-zinc-400 hover:text-rose-400 transition-colors p-1"
                        title={
                          language === "pt"
                            ? "Favoritar"
                            : "Add to favorites"
                        }
                      >
                        {item.isFavorite ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleCopyHistoryItem(item, e)}
                        className="text-zinc-400 hover:text-white transition-colors p-1"
                        title={
                          language === "pt"
                            ? "Copiar todas as opções"
                            : "Copy all options"
                        }
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-500 block">
                      {language === "pt" ? "Recebida:" : "Received:"}
                    </span>
                    <p className="text-xs text-zinc-300 font-medium line-clamp-2">
                      "{item.context.mensagem}"
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      {item.options.length}{" "}
                      {language === "pt" ? "opções" : "options"}
                    </span>
                    <span className="text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      {language === "pt" ? "Carregar" : "Load"}{" "}
                      <CornerDownLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {history.length > 0 && (
          <div className="pt-4 border-t border-zinc-800 flex justify-between">
            <button
              onClick={onClear}
              className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearHistory}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
