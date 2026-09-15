import React, { useState, useEffect } from "react";
import {
  LovixContext,
  GenerationResult,
  ScenarioPreset,
  UserSubscription,
  PlanPeriod,
  AppLanguage,
  AuthUser,
  MorningTrackerState,
} from "./types";
import { Navbar } from "./components/Navbar";
import { ContextForm } from "./components/ContextForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { RulesModal } from "./components/RulesModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { PricingModal } from "./components/PricingModal";
import { MorningBanner } from "./components/MorningBanner";
import { MorningLoveModal } from "./components/MorningLoveModal";
import { AuthModal } from "./components/AuthModal";
import { AdminControlModal } from "./components/AdminControlModal";
import { SecretAdminPromptModal } from "./components/SecretAdminPromptModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import {
  getInitialMorningState,
  saveMorningState,
  calculateMorningProgress,
  getTodayPhrase,
  isCurrentlyMorning,
  requestMorningNotifications,
} from "./utils/morningTracker";
import {
  getStoredAuthUser,
  signOutUser,
  promoteUserToAdmin,
  saveStoredUser,
} from "./utils/auth";
import { getTranslation } from "./i18n/translations";
import {
  testFirestoreConnection,
  syncUserProfileToFirestore,
  loadUserProfileFromFirestore,
  saveHistoryItemToFirestore,
  loadHistoryFromFirestore,
  saveMorningTrackerToFirestore,
  loadMorningTrackerFromFirestore,
  signOutFirebase,
} from "./lib/firebase";
import {
  AlertCircle,
  SlidersHorizontal,
  MessageSquareText,
} from "lucide-react";

const STORAGE_KEY = "lovix_history_v1";
const SUBSCRIPTION_KEY = "lovix_subscription_v1";
const LANGUAGE_KEY = "lovix_language_v1";

export default function App() {
  // App Language: defaults to English with full support for EN, PT, ES, FR, DE, IT
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY) as AppLanguage | null;
      if (saved && ["en", "pt", "es", "fr", "de", "it"].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return "en";
  });

  const t = getTranslation(language);

  // Auth User state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    getStoredAuthUser()
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Default context tailored according to language
  const [context, setContext] = useState<LovixContext>(() => {
    return language === "pt"
      ? {
          mensagem: "Oi sumido... sumiu pq?",
          image: null,
          rumoConversa:
            "Inverter o jogo e fazer ela/ele correr atrás com provocação",
          relacao: "Ficante",
          objetivo: "Criar curiosidade e tensão positiva",
          tom: "Provocador/Teasing",
          ousadia: 4,
        }
      : {
          mensagem: "Hey stranger... where did you disappear to?",
          image: null,
          rumoConversa:
            "Turn the tables and playfully get them to pursue with witty teasing",
          relacao: "Ficante",
          objetivo: "Criar curiosidade e tensão positiva",
          tom: "Provocador/Teasing",
          ousadia: 4,
        };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isMorningOpen, setIsMorningOpen] = useState(false);
  const [isAdminControlOpen, setIsAdminControlOpen] = useState(false);
  const [isSecretPromptOpen, setIsSecretPromptOpen] = useState(false);
  const [morningState, setMorningState] = useState<MorningTrackerState>(() =>
    getInitialMorningState()
  );
  const [mobileTab, setMobileTab] = useState<"context" | "results">("context");

  // Global secret shortcut (Ctrl+Shift+A or Cmd+Shift+A) to open confidential master prompt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsSecretPromptOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load subscription state from localStorage or initialize free tier
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem(SUBSCRIPTION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading subscription:", e);
    }
    return {
      isPro: false,
      creditsRemaining: 5,
      maxDailyCredits: 5,
    };
  });

  // Validate Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Sync Admin status with unlimited VIP access
  useEffect(() => {
    if (authUser?.role === "admin" || authUser?.isAdmin) {
      setSubscription((prev) => {
        if (!prev.isPro || prev.creditsRemaining < 99999) {
          const updated: UserSubscription = {
            ...prev,
            isPro: true,
            creditsRemaining: 999999,
            maxDailyCredits: 999999,
            planId: "admin_vip",
            isAdminUnlocked: true,
          };
          try {
            localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        }
        return prev;
      });
    }
  }, [authUser?.role, authUser?.isAdmin]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading local history:", e);
    }
  }, []);

  // Synchronize user profile, cloud history, and morning tracker with Firestore
  useEffect(() => {
    if (!authUser) return;

    // 1. Sync current profile & subscription to Firestore
    syncUserProfileToFirestore(authUser, subscription, language);

    // 2. Fetch cloud subscription data if user upgraded on another device
    loadUserProfileFromFirestore(authUser.id).then((cloudProfile) => {
      if (cloudProfile && cloudProfile.isPro !== undefined) {
        setSubscription((prev) => {
          const updated = {
            ...prev,
            isPro: cloudProfile.isPro ?? prev.isPro,
            creditsRemaining: cloudProfile.creditsRemaining ?? prev.creditsRemaining,
          };
          try {
            localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });
      }
    });

    // 3. Load cloud history from Firestore and merge
    loadHistoryFromFirestore(authUser.id).then((cloudHistory) => {
      if (cloudHistory && cloudHistory.length > 0) {
        setHistory((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = cloudHistory.filter((i) => !existingIds.has(i.id));
          const merged = [...prev, ...newItems].sort((a, b) => b.timestamp - a.timestamp);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {
            console.error(e);
          }
          return merged;
        });
      }
    });

    // 4. Load cloud morning routine tracker
    loadMorningTrackerFromFirestore(authUser.id).then((cloudTracker) => {
      if (cloudTracker && cloudTracker.firstSeenTimestamp) {
        setMorningState((prev) => {
          const updated = {
            ...prev,
            firstSeenTimestamp: cloudTracker.firstSeenTimestamp ?? prev.firstSeenTimestamp,
            notificationsEnabled: cloudTracker.notificationsEnabled ?? prev.notificationsEnabled,
            lastNotifiedDate: cloudTracker.lastNotifiedDate ?? prev.lastNotifiedDate,
          };
          saveMorningState(updated);
          return updated;
        });
      }
    });
  }, [authUser?.id]);

  // Update document title and language persistence
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (e) {
      console.error(e);
    }

    const titles: Record<AppLanguage, string> = {
      en: "Lovix • Magnetic Reply Generator & Text Flirting Dynamics",
      pt: "Lovix • Respostas Magnéticas & Dinâmica Social de Flerte",
      es: "Lovix • Generador de Respuestas Magnéticas & Dinámica de Coqueteo",
      fr: "Lovix • Réponses Magnétiques & Séduction par Message",
      de: "Lovix • Magnetische Antworten & Moderne Flirt-Dynamik",
      it: "Lovix • Risposte Magnetiche & Messaggistica Seduttiva",
    };
    document.title = titles[language] || titles.en;
  }, [language]);

  // Automatic morning notification check
  useEffect(() => {
    if (!morningState.notificationsEnabled) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (morningState.lastNotifiedDate === todayStr) return;

    if (isCurrentlyMorning()) {
      const { currentDay } = calculateMorningProgress(
        morningState.firstSeenTimestamp
      );
      const todayPhrase = getTodayPhrase(currentDay, language);
      requestMorningNotifications(todayPhrase, language).then((sent) => {
        if (sent) {
          const updated = { ...morningState, lastNotifiedDate: todayStr };
          setMorningState(updated);
          saveMorningState(updated);
          if (authUser) {
            saveMorningTrackerToFirestore(authUser.id, updated);
          }
        }
      });
    }
  }, [morningState, language, authUser]);

  // Global secret shortcut (Ctrl+Shift+A or Cmd+Shift+A) to toggle hidden Admin Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAdminControlOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleLanguage = () => {
    const langs: AppLanguage[] = ["en", "pt", "es", "fr", "de", "it"];
    setLanguage((prev) => {
      const idx = langs.indexOf(prev);
      return langs[(idx + 1) % langs.length];
    });
  };

  const handleToggleMorningNotification = () => {
    setMorningState((prev) => {
      const updated = {
        ...prev,
        notificationsEnabled: !prev.notificationsEnabled,
      };
      saveMorningState(updated);
      if (authUser) {
        saveMorningTrackerToFirestore(authUser.id, updated);
      }
      return updated;
    });
  };

  const handleSignOut = () => {
    signOutFirebase();
    signOutUser();
    setAuthUser(null);
  };

  // Save history to localStorage and Firestore
  const saveToHistory = (newResult: GenerationResult) => {
    if (authUser) {
      saveHistoryItemToFirestore(authUser.id, newResult);
    }
    setHistory((prev) => {
      const updated = [
        newResult,
        ...prev.filter((p) => p.id !== newResult.id),
      ].slice(0, 30);
      try {
        const storageSafe = updated.map((item) => ({
          ...item,
          context: {
            ...item.context,
            image: item.context.image
              ? {
                  name: item.context.image.name,
                  mimeType: item.context.image.mimeType,
                  size: item.context.image.size,
                  data: "",
                }
              : null,
          },
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageSafe));
      } catch (e) {
        console.error("Error saving local history:", e);
      }
      return updated;
    });
  };

  const handleUpdateContext = (updated: Partial<LovixContext>) => {
    setContext((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyPreset = (preset: ScenarioPreset) => {
    setContext({
      mensagem: preset.mensagem,
      image: null,
      rumoConversa: preset.rumoConversa || "",
      relacao: preset.relacao,
      objetivo: preset.objetivo,
      tom: preset.tom,
      ousadia: preset.ousadia,
    });
  };

  const handleActivatePro = (plan: PlanPeriod) => {
    const updated: UserSubscription = {
      isPro: true,
      creditsRemaining: 9999,
      maxDailyCredits: 9999,
      planId: plan,
      activatedAt: Date.now(),
    };
    setSubscription(updated);
    try {
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (authUser) {
      syncUserProfileToFirestore(authUser, updated, language);
    }
  };

  const handleResetToFree = () => {
    const updated: UserSubscription = {
      isPro: false,
      creditsRemaining: 5,
      maxDailyCredits: 5,
    };
    setSubscription(updated);
    try {
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (authUser) {
      syncUserProfileToFirestore(authUser, updated, language);
    }
  };

  const handleGenerate = async () => {
    if (!context.mensagem.trim() && !context.image?.data) return;

    // Check credits if not PRO
    if (!subscription.isPro && subscription.creditsRemaining <= 0) {
      setIsPricingOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let adminTemp: number | undefined;
      try {
        const savedTemp = localStorage.getItem("lovix_admin_ai_temperature");
        if (savedTemp) adminTemp = parseFloat(savedTemp);
      } catch (e) {
        // ignore
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...context,
          language,
          temperature: adminTemp,
        }),
      });

      if (!response.ok) {
        let errMsg =
          language === "pt"
            ? "O servidor Lovix está ocupado no momento. Tente novamente."
            : "Lovix service is currently busy. Please retry.";
        try {
          const errorData = await response.json();
          if (errorData?.error) errMsg = errorData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      const resultObj: GenerationResult = {
        id: `lovix_${Date.now()}`,
        timestamp: Date.now(),
        context: { ...context },
        rawText: data.rawText || "",
        options: data.options || [],
        isFavorite: false,
      };

      setCurrentResult(resultObj);
      saveToHistory(resultObj);

      // Decrement credits if not PRO
      if (!subscription.isPro) {
        setSubscription((prev) => {
          const updated = {
            ...prev,
            creditsRemaining: Math.max(0, prev.creditsRemaining - 1),
          };
          try {
            localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });
      }

      // Switch to results tab automatically on mobile
      setMobileTab("results");
    } catch (err: any) {
      console.error(err);
      const msg = String(err?.message || err);
      setErrorMessage(
        msg.includes("Failed to fetch")
          ? (language === "pt"
              ? "Instabilidade temporária de rede. Tente novamente em instantes."
              : "Temporary network interruption. Please try again.")
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (currentResult && currentResult.id === id) {
      setCurrentResult((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenMorning={() => setIsMorningOpen(true)}
        onOpenAdminControl={() => setIsAdminControlOpen(true)}
        onSecretTrigger={() => setIsSecretPromptOpen(true)}
        historyCount={history.length}
        subscription={subscription}
        language={language}
        onLanguageChange={setLanguage}
        onToggleLanguage={handleToggleLanguage}
        currentUser={authUser}
        authUser={authUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Morning Love Phrases Banner (14 Days Free Routine) */}
        <MorningBanner
          subscription={subscription}
          firstSeenTimestamp={morningState.firstSeenTimestamp}
          notificationsEnabled={morningState.notificationsEnabled}
          onToggleNotification={handleToggleMorningNotification}
          onOpenModal={() => setIsMorningOpen(true)}
          language={language}
        />

        {/* Error Banner if any */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-300 underline shrink-0 cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        )}

        {/* Mobile View Toggle Switcher (< lg screens) */}
        <div className="lg:hidden mb-4 grid grid-cols-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setMobileTab("context")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "context"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span>1. {language === "pt" ? "Configurar" : "Configure"}</span>
          </button>

          <button
            onClick={() => setMobileTab("results")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              mobileTab === "results"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
            <span>
              2. {language === "pt" ? "Respostas" : "Replies"}{" "}
              {currentResult ? "(3)" : ""}
            </span>
            {currentResult && mobileTab !== "results" && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
            )}
          </button>
        </div>

        {/* Main 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Context Configuration (5 cols) */}
          <div
            className={`lg:col-span-5 space-y-3.5 ${
              mobileTab === "context" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{t.heroTitle}</span>
              </h1>
              <span className="text-[11px] text-zinc-400 font-medium">
                {language === "pt" ? "Passo 1: Contexto" : "Step 1: Context"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed -mt-1.5">
              {t.heroSubtitle}
            </p>

            <ContextForm
              context={context}
              onChange={handleUpdateContext}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              onApplyPreset={handleApplyPreset}
              subscription={subscription}
              onOpenPricing={() => setIsPricingOpen(true)}
              language={language}
            />
          </div>

          {/* Right Column: Output Showcase & Live Chat Simulator (7 cols) */}
          <div
            className={`lg:col-span-7 space-y-3.5 ${
              mobileTab === "results" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>
                  {language === "pt"
                    ? "Respostas Magnéticas"
                    : "Magnetic Replies"}
                </span>
              </h2>
              <span className="text-[11px] text-zinc-400 font-medium">
                {language === "pt"
                  ? "Passo 2: Escolha & Envie"
                  : "Step 2: Choose & Send"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed -mt-1.5">
              {language === "pt"
                ? "3 opções estratégicas calibradas com a psicologia de atração Lovix."
                : "3 strategic replies calibrated with Lovix attraction dynamics."}
            </p>

            <ResultsDisplay
              result={currentResult}
              isLoading={isLoading}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={Boolean(currentResult?.isFavorite)}
              subscription={subscription}
              onOpenPricing={() => setIsPricingOpen(true)}
              language={language}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-3.5 px-4 text-center text-[11px] text-zinc-500">
        <p>
          Lovix •{" "}
          {language === "pt"
            ? "Especialista em dinâmica social, psicologia da atração e comunicação moderna via texto"
            : "Modern dating chemistry, attraction psychology & text banter engineering"}
        </p>
      </footer>

      {/* Modals & Drawers */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        subscription={subscription}
        onActivatePro={handleActivatePro}
        onResetToFree={handleResetToFree}
        language={language}
        onOpenAdminControl={() => {
          setIsPricingOpen(false);
          setIsAdminControlOpen(true);
        }}
        onPromoteAdmin={(code) => {
          let updatedUser: AuthUser;
          if (authUser) {
            try {
              updatedUser = promoteUserToAdmin(authUser, code);
            } catch {
              updatedUser = {
                ...authUser,
                role: "admin",
                isAdmin: true,
              };
              saveStoredUser(updatedUser);
            }
          } else {
            updatedUser = {
              id: "admin_" + Date.now(),
              name: "Administrador Lovix VIP",
              email: "admin@lovix.ai",
              avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=LovixMasterVIP",
              provider: "admin",
              role: "admin",
              isAdmin: true,
              createdAt: Date.now(),
            };
            saveStoredUser(updatedUser);
          }
          setAuthUser(updatedUser);
          handleActivatePro("annual");
          setIsPricingOpen(false);
          setIsAdminControlOpen(true);
        }}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={language}
      />

      <MorningLoveModal
        isOpen={isMorningOpen}
        onClose={() => setIsMorningOpen(false)}
        subscription={subscription}
        firstSeenTimestamp={morningState.firstSeenTimestamp}
        notificationsEnabled={morningState.notificationsEnabled}
        onToggleNotification={handleToggleMorningNotification}
        onOpenPricing={() => {
          setIsMorningOpen(false);
          setIsPricingOpen(true);
        }}
        language={language}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setContext(item.context);
          setCurrentResult(item);
          setMobileTab("results");
        }}
        onClear={handleClearHistory}
        onToggleFavorite={handleToggleFavorite}
        language={language}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        currentUser={authUser}
        onUserChange={setAuthUser}
        onAuthSuccess={(user) => {
          setAuthUser(user);
          setIsAuthOpen(false);
          if (user.role === "admin" || user.isAdmin) {
            setIsAdminControlOpen(true);
          }
        }}
        onOpenAdminControl={() => {
          setIsAuthOpen(false);
          setIsAdminControlOpen(true);
        }}
      />

      <AdminControlModal
        isOpen={isAdminControlOpen}
        onClose={() => setIsAdminControlOpen(false)}
        currentUser={authUser}
        subscription={subscription}
        onUpdateSubscription={(updated) => {
          setSubscription((prev) => {
            const next = { ...prev, ...updated };
            try {
              localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(next));
            } catch (e) {
              console.error(e);
            }
            if (authUser) {
              syncUserProfileToFirestore(authUser, next, language);
            }
            return next;
          });
        }}
        morningState={morningState}
        onUpdateMorningState={(updated) => {
          setMorningState((prev) => {
            const next = { ...prev, ...updated };
            saveMorningState(next);
            if (authUser) {
              saveMorningTrackerToFirestore(authUser.id, next);
            }
            return next;
          });
        }}
        onTriggerMorningTest={() => {
          setIsAdminControlOpen(false);
          setIsMorningOpen(true);
        }}
        language={language}
        totalGenerationsCount={history.length}
        totalFavoritesCount={history.filter((h) => h.isFavorite).length}
      />

      <SecretAdminPromptModal
        isOpen={isSecretPromptOpen}
        onClose={() => setIsSecretPromptOpen(false)}
        currentUser={authUser}
        onAdminActivated={(adminUser) => {
          setAuthUser(adminUser);
          setIsAdminControlOpen(true);
        }}
        language={language}
      />

      {/* Real-time PWA Offline State Indicator */}
      <OfflineIndicator language={language} />
    </div>
  );
}
