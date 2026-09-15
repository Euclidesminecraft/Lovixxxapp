import React, { useState, useEffect } from "react";
import { PlanPeriod, PricingPlan, UserSubscription, AppLanguage } from "../types";
import {
  X,
  Check,
  Zap,
  Flame,
  ShieldCheck,
  Sparkles,
  Crown,
  Tag,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Lock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { getTranslation } from "../i18n/translations";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onActivatePro: (plan: PlanPeriod) => void;
  onResetToFree: () => void;
  language: AppLanguage;
  onOpenAdminControl?: () => void;
  onPromoteAdmin?: (secretCode: string) => void;
}

const SECURE_CHECKOUT_URL = "https://pay.hotmart.com/L107577070N?checkoutMode=2";
const SECURE_DIRECT_URL = "https://pay.hotmart.com/L107577070N";

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onActivatePro,
  onResetToFree,
  language,
  onOpenAdminControl,
  onPromoteAdmin,
}) => {
  const t = getTranslation(language);

  const [selectedPlan, setSelectedPlan] = useState<PlanPeriod>("monthly");
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [vipSuccessNotice, setVipSuccessNotice] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Load checkout scripts dynamically if needed
  useEffect(() => {
    if (!isOpen) return;

    const loadCheckoutScripts = () => {
      if (!document.getElementById("checkout-widget-css")) {
        const link = document.createElement("link");
        link.id = "checkout-widget-css";
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = "https://static.hotmart.com/css/hotmart-fb.min.css";
        document.head.appendChild(link);
      }

      if (!document.getElementById("checkout-widget-script")) {
        const script = document.createElement("script");
        script.id = "checkout-widget-script";
        script.type = "text/javascript";
        script.src = "https://static.hotmart.com/checkout/widget.min.js";
        document.head.appendChild(script);
      }
    };

    loadCheckoutScripts();
  }, [isOpen]);

  if (!isOpen) return null;

  const PLANS: PricingPlan[] =
    language === "pt"
      ? [
          {
            id: "weekly",
            name: "Semanal",
            tagline: "Redirecionando para oferta especial",
            price: "$10 USD",
            periodLabel: "/ semana",
            features: [
              "Gerações ilimitadas",
              "Uploads ilimitados de prints",
              "Todos os 5 estilos liberados",
              "Nível de ousadia 5 liberado",
              "Sem anúncios ou esperas",
            ],
          },
          {
            id: "monthly",
            name: "Mensal PRO",
            tagline: "🔥 Oferta Especial de Liberação Imediata",
            price: "$19 USD",
            originalPrice: "$80 USD",
            periodLabel: "/ mês (76% OFF)",
            isPopular: true,
            features: [
              "Tudo do plano semanal",
              "Prioridade máxima na IA Gemini",
              "Rumo estratégico avançado",
              "Análise psicológica 'Por que funciona'",
              "Histórico de conversas ilimitado",
              "Suporte a novos estilos exclusivos",
            ],
          },
          {
            id: "annual",
            name: "Anual VIP",
            tagline: "Redirecionando para oferta especial",
            price: "$42 USD",
            periodLabel: "/ ano",
            features: [
              "Acesso por 1 ano completo",
              "Todas as futuras atualizações da IA",
              "Prints ilimitados em altíssima resolução",
              "Acesso antecipado ao Modo Áudio",
              "Garantia blindada de 7 dias",
            ],
          },
        ]
      : [
          {
            id: "weekly",
            name: "Weekly",
            tagline: "Redirecting to special offer",
            price: "$10 USD",
            periodLabel: "/ week",
            features: [
              "Unlimited reply generations",
              "Unlimited screenshot uploads",
              "All 5 conversation styles unlocked",
              "Audacity Level 5 unlocked",
              "Zero delays or cooldowns",
            ],
          },
          {
            id: "monthly",
            name: "Monthly PRO",
            tagline: "🔥 Special Instant Access Offer",
            price: "$19 USD",
            originalPrice: "$80 USD",
            periodLabel: "/ month (76% OFF)",
            isPopular: true,
            features: [
              "Everything in Weekly plan",
              "Maximum Gemini AI priority speed",
              "Advanced strategic direction routing",
              "Psychological 'Why it works' breakdowns",
              "Unlimited chat memory & favorites",
              "VIP love suggestions all year round",
            ],
          },
          {
            id: "annual",
            name: "Annual VIP",
            tagline: "Redirecting to special offer",
            price: "$42 USD",
            periodLabel: "/ year",
            features: [
              "Full 1-year unrestricted access",
              "All future AI model upgrades",
              "Ultra high-resolution screenshot parsing",
              "Early access to audio analysis",
              "Ironclad 7-day money-back guarantee",
            ],
          },
        ];

  const handleSelectPlan = (planId: PlanPeriod) => {
    if (planId === "weekly") {
      setSelectedPlan("monthly");
      setRedirectNotice(
        language === "pt"
          ? "Erro temporário no servidor de cobrança para o plano Semanal ($10 USD). Para garantir seu acesso imediato, você foi direcionado para o Plano Mensal VIP: de $80 USD por apenas $19 USD!"
          : "Temporary billing server error for the Weekly Plan ($10 USD). To ensure immediate access, you have been redirected to the Monthly VIP Plan: from $80 USD down to only $19 USD!"
      );
      return;
    }

    if (planId === "annual") {
      setSelectedPlan("monthly");
      setRedirectNotice(
        language === "pt"
          ? "Erro temporário no gateway para o plano Anual ($42 USD). Para que você não fique sem acesso, você foi direcionado para o Plano Mensal VIP: de $80 USD por apenas $19 USD!"
          : "Temporary gateway error for the Annual Plan ($42 USD). To ensure you don't lose access, you have been redirected to the Monthly VIP Plan: from $80 USD down to only $19 USD!"
      );
      return;
    }

    setSelectedPlan("monthly");
    setRedirectNotice(null);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setVipSuccessNotice(null);
    setAdminNotice(null);

    const raw = couponCode.trim();
    const lower = raw.toLowerCase();

    // Especial: Cupom mcpe.123 -> Abre o Painel ADM e libera permissão mestre
    if (lower === "mcpe.123") {
      setCouponApplied(true);
      setAdminNotice(
        language === "pt"
          ? "🔑 Cupom mcpe.123 reconhecido! Abrindo Painel ADM..."
          : "🔑 Coupon mcpe.123 recognized! Opening Admin Panel..."
      );
      setTimeout(() => {
        if (onPromoteAdmin) {
          onPromoteAdmin("mcpe.123");
        } else if (onOpenAdminControl) {
          onOpenAdminControl();
        }
        onClose();
      }, 450);
      return;
    }

    // Especial: Cupom Maclas5758 -> Passa para o VIP
    if (lower === "maclas5758") {
      setCouponApplied(true);
      onActivatePro("monthly");
      setVipSuccessNotice(
        language === "pt"
          ? "👑 Cupom Maclas5758 ativado! Você agora é VIP com acesso completo e ilimitado!"
          : "👑 Coupon Maclas5758 activated! You are now VIP with full unlimited access!"
      );
      return;
    }

    const cleaned = raw.toUpperCase();
    if (["LOVIXVIP", "PRO100", "FLERTE", "PRIMEIRAONDA", "VIP19"].includes(cleaned)) {
      setCouponApplied(true);
      setCouponError("");
    } else if (!cleaned) {
      setCouponError(
        language === "pt"
          ? "Digite um código de cupom."
          : "Please enter a coupon code."
      );
    } else {
      setCouponError(
        language === "pt"
          ? "Cupom inválido ou expirado."
          : "Invalid or expired coupon."
      );
    }
  };

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(true);
      onActivatePro(selectedPlan);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 1400);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#111114] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#141418] p-4 sm:p-5 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  {t.pricingTitle}
                </h2>
                <span className="text-[10px] uppercase font-semibold bg-amber-400/10 border border-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                  VIP
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {t.pricingSubtitle}
              </p>
            </div>
          </div>

          <button
            id="close-pricing-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 border border-transparent hover:border-white/[0.06] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {/* System Justification: Temporary Error Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-amber-200/90 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-amber-300 uppercase tracking-wide text-[11px]">
                  {t.pricingSystemNoticeTitle}
                </span>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium">
                  {language === "pt" ? "Instabilidade Temporária" : "Temporary Gateway Redirect"}
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
                {language === "pt" ? (
                  <>
                    O <strong>Plano Semanal ($10 USD)</strong> e o <strong>Plano Anual ($42 USD)</strong> estão temporariamente indisponíveis devido a um erro técnico no processador de assinaturas. Por esse motivo, todos os acessos estão sendo direcionados para o <strong>Plano Mensal VIP</strong>: de <span className="line-through text-zinc-500">$80 USD</span> por <strong>apenas $19 USD</strong> para você não ficar sem acesso hoje!
                  </>
                ) : (
                  <>
                    The <strong>Weekly Plan ($10 USD)</strong> and <strong>Annual Plan ($42 USD)</strong> are temporarily unavailable due to a technical error in the subscription gateway. Consequently, all activations are redirected to the <strong>Monthly VIP Plan</strong>: originally <span className="line-through text-zinc-500">$80 USD</span>, now <strong>only $19 USD</strong> for instant access today!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Interactive Redirection Feedback if user clicked weekly or annual */}
          {redirectNotice && (
            <div className="p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-white text-[11px]">
                  {language === "pt" ? "Redirecionamento Automático Ativado:" : "Automatic Redirect Triggered:"}
                </p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  {redirectNotice}
                </p>
              </div>
              <button
                onClick={() => setRedirectNotice(null)}
                className="text-[10px] text-rose-400 hover:text-white underline shrink-0 cursor-pointer"
              >
                {language === "pt" ? "Entendi" : "Got it"}
              </button>
            </div>
          )}

          {/* Active Pro Status Banner if user is already PRO */}
          {subscription.isPro && (
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-emerald-300 block">
                    {language === "pt" ? "Seu Lovix PRO está ativo!" : "Your Lovix PRO is active!"}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {language === "pt"
                      ? "Acesso a gerações ilimitadas e leitura de prints liberada."
                      : "Unlimited reply generations and screenshot uploads enabled."}
                  </span>
                </div>
              </div>
              <button
                onClick={onResetToFree}
                className="text-[11px] text-zinc-400 hover:text-rose-400 underline cursor-pointer shrink-0"
                title="Reset to free testing tier"
              >
                {language === "pt" ? "Resetar para Grátis" : "Reset to Free"}
              </button>
            </div>
          )}

          {/* Pricing Plan Selector */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {language === "pt" ? "Planos e Oferta Disponível:" : "Plans & Available Offer:"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const isRedirectPlan = plan.id === "weekly" || plan.id === "annual";

                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#16161b] border-rose-500/60 ring-1 ring-rose-500/20 shadow-lg"
                        : isRedirectPlan
                        ? "bg-[#0f0f12] border-white/[0.04] opacity-75 hover:opacity-100 hover:border-amber-500/30 text-zinc-400"
                        : "bg-[#111114] border-white/[0.08] hover:border-white/[0.14] text-zinc-300"
                    }`}
                  >
                    {/* Badge for Popular or Redirect */}
                    {plan.isPopular ? (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-semibold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                        {language === "pt" ? "Liberado • $19 USD" : "Available • $19 USD"}
                      </div>
                    ) : (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-amber-500/30 text-amber-300 font-medium text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
                        {language === "pt" ? "Erro temporário ➔ $19 USD" : "Temporary error ➔ $19 USD"}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {plan.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-rose-500 bg-rose-500 text-white"
                              : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                        {plan.tagline}
                      </p>

                      <div className="mt-3">
                        {plan.originalPrice && (
                          <span className="text-[11px] text-zinc-500 line-through mr-1.5 font-mono">
                            {plan.originalPrice}
                          </span>
                        )}
                        <span className="text-lg sm:text-xl font-bold text-white font-mono">
                          {couponApplied && isSelected ? "$0.00 USD" : plan.price}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1">
                          {plan.periodLabel}
                        </span>
                      </div>

                      {isRedirectPlan && (
                        <div className="mt-2 py-1 px-2 rounded-lg bg-amber-500/[0.08] border border-amber-500/20 text-[10px] text-amber-300/90 font-medium">
                          {language === "pt"
                            ? "Indisponível no momento. Direciona para o Mensal de $19 USD."
                            : "Currently unavailable. Redirects to Monthly for $19 USD."}
                        </div>
                      )}
                    </div>

                    <ul className="mt-3.5 space-y-1.5 border-t border-white/[0.06] pt-3">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <li
                          key={idx}
                          className="text-[11px] text-zinc-300 flex items-start gap-1.5"
                        >
                          <Check className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECURE CHECKOUT BOX - Professional and neutral */}
          <div className="bg-[#121215] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                    {t.secureCheckoutTitle}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t.secureCheckoutSubtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span className="bg-zinc-900 border border-white/[0.06] px-2 py-0.5 rounded text-zinc-300">
                  {language === "pt" ? "PIX Instantâneo" : "Credit Card / PayPal"}
                </span>
                <span className="bg-zinc-900 border border-white/[0.06] px-2 py-0.5 rounded text-zinc-300">
                  {language === "pt" ? "Cartão Internacional" : "Global Fast Ingress"}
                </span>
              </div>
            </div>

            {/* Professional CTA Component */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-sm">
                    {language === "pt" ? (
                      <>
                        Plano Mensal VIP: de <span className="line-through text-zinc-500">$80 USD</span> por apenas <span className="text-emerald-400 font-bold font-mono">$19 USD</span>
                      </>
                    ) : (
                      <>
                        Monthly VIP Plan: from <span className="line-through text-zinc-500">$80 USD</span> down to <span className="text-emerald-400 font-bold font-mono">$19 USD</span>
                      </>
                    )}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {language === "pt"
                    ? "Preço promocional especial aplicado devido à manutenção temporária dos demais planos."
                    : "Promotional rate applied due to temporary maintenance on other tiers."}
                </p>
              </div>

              {/* Styled Professional CTA Button */}
              <div className="shrink-0 flex flex-col items-center gap-1 w-full sm:w-auto">
                <a
                  id="official-checkout-anchor"
                  href={SECURE_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotmart-fb hotmart__button-checkout group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer no-underline border border-emerald-500/40"
                  title="Finalize Secure Order"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-100 group-hover:scale-105 transition-transform" />
                  <span className="font-semibold tracking-wide">{t.ctaUnlockMonthly}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <a
                  href={SECURE_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors mt-0.5"
                >
                  <span>{language === "pt" ? "Abrir em tela cheia" : "Open in full tab"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Action to unlock PRO right after buying */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-zinc-400">
                {t.alreadyPurchased}
              </span>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> {t.clickToActivatePro}
              </button>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="bg-[#0f0f12] border border-white/[0.08] rounded-xl p-3.5">
            <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={
                    language === "pt"
                      ? "Adicionar cupom (ex: Maclas5758)"
                      : "Add coupon code (e.g. Maclas5758)"
                  }
                  className="w-full bg-[#16161a] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none font-mono tracking-wide focus:border-rose-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 border border-white/[0.06]"
              >
                {language === "pt" ? "Aplicar" : "Apply"}
              </button>
            </form>

            {vipSuccessNotice && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/[0.1] border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{vipSuccessNotice}</span>
              </div>
            )}

            {adminNotice && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/[0.1] border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{adminNotice}</span>
              </div>
            )}

            {couponApplied && !vipSuccessNotice && !adminNotice && (
              <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" />{" "}
                {language === "pt"
                  ? "Cupom VIP aplicado com sucesso: 100% OFF liberado para teste!"
                  : "VIP coupon successfully applied: 100% OFF unlocked for testing!"}
              </p>
            )}
            {couponError && (
              <p className="text-[11px] text-rose-400 mt-2">
                {couponError}
              </p>
            )}
          </div>

          {/* Guarantee and Security badges */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/[0.06]">
            <span className="flex items-center gap-1.5 font-normal">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t.guaranteeNotice}
            </span>
            <span className="flex items-center gap-1.5 font-normal">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> {t.instantDelivery}
            </span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-[#141418] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-xs text-zinc-400 block">
              {language === "pt" ? "Total a pagar:" : "Total due:"}
            </span>
            <div className="flex items-baseline gap-1.5">
              {!couponApplied && (
                <span className="text-xs text-zinc-500 line-through font-mono">
                  $80 USD
                </span>
              )}
              <span className="text-xl font-bold text-white font-mono">
                {couponApplied ? "$0.00 USD" : "$19 USD"}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {language === "pt" ? "(76% OFF aplicado)" : "(76% OFF applied)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Direct Secure Button in Footer */}
            <a
              href={SECURE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hotmart-fb hotmart__button-checkout flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 no-underline border border-emerald-500/40"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{language === "pt" ? "Garantir por $19 USD" : "Secure Access for $19 USD"}</span>
            </a>

            {/* In-app activation */}
            <button
              id="checkout-confirm-btn"
              onClick={handleConfirmPurchase}
              disabled={isProcessing || successMessage}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === "pt" ? "Ativando..." : "Activating..."}</span>
                </>
              ) : successMessage ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>{language === "pt" ? "PRO Ativado!" : "PRO Activated!"}</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-white" />
                  <span>{language === "pt" ? "Ativar Acesso" : "Activate Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
