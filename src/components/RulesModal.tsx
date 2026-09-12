import React from "react";
import { X, Flame, ShieldAlert, CheckCircle2 } from "lucide-react";
import { AppLanguage } from "../types";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const isEn = language === "en";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 text-zinc-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEn
                  ? "Golden Principles & Lovix Dynamics"
                  : "Diretrizes de Ouro & Filosofia Lovix"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isEn
                  ? "Core attraction psychology behind every generated message"
                  : "Os princípios da psicologia da atração que orientam cada resposta"}
              </p>
            </div>
          </div>
          <button
            id="close-rules-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5">
          {/* Golden Rules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />{" "}
              {isEn ? "The 5 Non-Negotiable Rules" : "As 5 Diretrizes Inegociáveis"}
            </h3>
            <div className="grid gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-rose-400 font-semibold text-sm">
                  {isEn ? "1. Never Robotic:" : "1. Sem tom robótico:"}
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  {isEn
                    ? "Never sound like an AI chatbot ('Here are some ideas' or 'Hope this helps'). Lovix delivers ready-to-send high-status lines instantly."
                    : "Nunca soa como assistente virtual ('Aqui estão sugestões' ou 'Espero que ajude'). O Lovix vai direto ao ponto."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-rose-400 font-semibold text-sm">
                  {isEn ? "2. Authentic Cadence:" : "2. Linguagem Natural:"}
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  {isEn
                    ? "Text like a charismatic 20-30 year old. Natural phrasing, authentic conversational rhythm, and zero stiff corporate grammar."
                    : "Estilo de quem tem 20-30 anos. Uso de gírias leves e contrações de chat (vc, tá, pq), sem formalidades engessadas."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-rose-400 font-semibold text-sm">
                  {isEn ? "3. Less is More:" : "3. Menos é Mais:"}
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  {isEn
                    ? "Lengthy paragraphs signal over-investment and low social leverage. Punchy, effortless texts keep them curious and pursuing."
                    : "Textão demonstra carência e desespero. Frases curtas e certeiras deixam a outra pessoa querendo mais."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-rose-400 font-semibold text-sm">
                  {isEn ? "4. Push-Pull Tension:" : "4. Técnica Push-Pull:"}
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  {isEn
                    ? "Avoid people-pleasing ('simping'). Calibrate sweet compliments with subtle, teasing pushbacks that spark attraction."
                    : "Nunca seja um bajulador ('simp'). Misture elogios sutis com pequenas provocações que geram tensão positiva."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <span className="text-rose-400 font-semibold text-sm">
                  {isEn ? "5. Zero Cheesy Clichés:" : "5. Zero Clichês:"}
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  {isEn
                    ? "Cringe internet pickup lines and poetic drivel kill desire. Real charisma relies on frame control, context, and wit."
                    : "Proibidas cantadas prontas de Google ou poesia exagerada que ninguém usaria na vida real em um direct ou WhatsApp."}
                </p>
              </div>
            </div>
          </div>

          {/* Style Guide */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              {isEn ? "Style Dynamics" : "Guia de Estilos & Dinâmica"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
                <strong className="text-white block mb-0.5">
                  {isEn ? "Playful Tease / Witty" : "Provocador / Teasing"}
                </strong>
                <span className="text-zinc-400">
                  {isEn
                    ? "Light irony and playful challenges that qualify their interest."
                    : "Ironia leve e desafio. Mostra que a pessoa precisa merecer sua atenção."}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
                <strong className="text-white block mb-0.5">
                  {isEn ? "Mysterious" : "Misterioso"}
                </strong>
                <span className="text-zinc-400">
                  {isEn
                    ? "Short, intriguing, leaves space for imagination and anticipation."
                    : "Respostas curtas e intrigantes. Mantém o ar de curiosidade."}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
                <strong className="text-white block mb-0.5">
                  {isEn ? "Authentic & Flirtatious" : "Romântico / Fofo"}
                </strong>
                <span className="text-zinc-400">
                  {isEn
                    ? "Genuine warmth and high-value connection without being needy."
                    : "Conexão genuína com elogios específicos, sem pieguice."}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
                <strong className="text-white block mb-0.5">
                  {isEn ? "Direct & Bold" : "Direto / Confiante"}
                </strong>
                <span className="text-zinc-400">
                  {isEn
                    ? "Zero hesitation, high polarity, clear date-setting leadership."
                    : "Sem rodeios. Liderança, atitude e intenção transparente."}
                </span>
              </div>
            </div>
          </div>

          {/* Safety & Ethics */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <strong className="text-white text-xs">
                {isEn ? "Ethics & Safety" : "Segurança & Consentimento"}
              </strong>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isEn
                ? "Lovix enhances natural conversation and respectful romantic banter. Explicitly hostile, non-consensual, or abusive interactions are strictly blocked."
                : "O Lovix potencializa a química em conversas consensuais. Comportamentos abusivos, hostis ou insistentes após recusas claras não são apoiados pela plataforma."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
