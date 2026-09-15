import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  KeyRound,
  Trash2,
  Crown,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { AuthUser, AppLanguage } from "../types";
import {
  getSavedCredentials,
  storeCredentials,
  loginWithGoogle,
  loginWithEmailPassword,
  logoutUser,
  loginWithAdminCode,
  promoteUserToAdmin,
} from "../utils/auth";
import { getTranslation } from "../i18n/translations";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onUserChange?: (user: AuthUser | null) => void;
  onAuthSuccess?: (user: AuthUser) => void;
  onOpenAdminControl?: () => void;
  language: AppLanguage;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onAuthSuccess,
  onOpenAdminControl,
  language,
}) => {
  const t = getTranslation(language);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Hidden admin unlock mechanism (activated by secret tap or key combo)
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [showSecretUnlock, setShowSecretUnlock] = useState(false);
  const [secretCodeInput, setSecretCodeInput] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);

  const updateUser = (user: AuthUser | null) => {
    if (onUserChange) onUserChange(user);
    if (user && onAuthSuccess) onAuthSuccess(user);
  };

  // Load saved credentials on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedCredentials();
      if (saved && saved.email) {
        setEmail(saved.email);
        if (saved.password) {
          setPassword(saved.password);
        }
        setHasSavedCredentials(true);
        setRememberCredentials(true);
      } else {
        setHasSavedCredentials(false);
      }
      setFeedbackMessage(null);
      setAdminError(null);
      setShowSecretUnlock(false);
      setSecretTapCount(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSecretIconTap = () => {
    const next = secretTapCount + 1;
    if (next >= 5) {
      setShowSecretUnlock(true);
      setSecretTapCount(0);
    } else {
      setSecretTapCount(next);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const user = await loginWithGoogle();
      updateUser(user);
      setFeedbackMessage(t.authSuccessLogin);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const user = await loginWithEmailPassword(
        email,
        password,
        rememberCredentials
      );
      updateUser(user);
      setFeedbackMessage(
        user.role === "admin"
          ? (language === "pt" ? "Acesso Master Desbloqueado." : "Master Access Unlocked.")
          : tab === "login"
          ? t.authSuccessLogin
          : t.authSuccessSignup
      );
      if (rememberCredentials) {
        setHasSavedCredentials(true);
      }
      setTimeout(() => {
        onClose();
        if (user.role === "admin" && onOpenAdminControl) {
          onOpenAdminControl();
        }
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCodeInput.trim()) return;
    setAdminError(null);
    setIsLoading(true);

    try {
      let adminUser: AuthUser;
      if (currentUser) {
        adminUser = promoteUserToAdmin(currentUser, secretCodeInput.trim());
      } else {
        adminUser = await loginWithAdminCode(secretCodeInput.trim());
      }
      updateUser(adminUser);
      setShowSecretUnlock(false);
      setFeedbackMessage(
        language === "pt"
          ? "Acesso Mestre Confirmado."
          : "Master Access Confirmed."
      );
      setTimeout(() => {
        onClose();
        if (onOpenAdminControl) {
          onOpenAdminControl();
        }
      }, 800);
    } catch (err) {
      setAdminError(
        language === "pt"
          ? "Chave secreta inválida."
          : "Invalid secret key."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCredentials = () => {
    storeCredentials(null);
    setEmail("");
    setPassword("");
    setHasSavedCredentials(false);
    setFeedbackMessage(
      language === "pt"
        ? "Credenciais removidas deste dispositivo."
        : "Credentials cleared from this device."
    );
  };

  const handleLogout = () => {
    logoutUser();
    updateUser(null);
    onClose();
  };

  const isCurrentAdmin = currentUser?.role === "admin" || currentUser?.isAdmin;

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-content"
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Discreet secret tap on this icon reveals the master key prompt after 5 taps */}
            <button
              type="button"
              onClick={handleSecretIconTap}
              className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 cursor-default select-none focus:outline-none"
              title=""
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
                {currentUser ? t.manageAccount : t.authModalTitle}
              </h3>
              <p className="text-xs text-zinc-400">{t.appName} Cloud Sync</p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {feedbackMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {adminError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          {/* Secret Master Key Drawer (Only appears when secret gesture triggered) */}
          {showSecretUnlock && (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  {language === "pt" ? "Chave Confidencial" : "Confidential Key"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSecretUnlock(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                >
                  {t.close}
                </button>
              </div>
              <form onSubmit={handleSecretUnlockSubmit} className="flex gap-2">
                <input
                  type="password"
                  autoFocus
                  value={secretCodeInput}
                  onChange={(e) => setSecretCodeInput(e.target.value)}
                  placeholder="••••••••••"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !secretCodeInput.trim()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  OK
                </button>
              </form>
            </div>
          )}

          {currentUser ? (
            /* Logged in state - Pure, clean, no public admin buttons */
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSecretIconTap}
                  className="cursor-default focus:outline-none"
                >
                  <img
                    src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full border border-rose-500/40 bg-zinc-900 object-cover"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-100 truncate">
                      {currentUser.name}
                    </h4>
                    {isCurrentAdmin ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-amber-300" /> VIP
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                        {currentUser.provider === "google" ? "Google" : "Email"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Discreet Control Access for Admin */}
              {isCurrentAdmin && onOpenAdminControl && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminControl();
                  }}
                  className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl border border-zinc-700/80 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.adminControlPanel}</span>
                </button>
              )}

              {/* Saved Credentials Status */}
              <div className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {hasSavedCredentials
                      ? t.credentialsStored
                      : language === "pt"
                      ? "Nenhuma credencial salva"
                      : "No credentials saved"}
                  </span>
                </div>
                {hasSavedCredentials && (
                  <button
                    onClick={handleClearCredentials}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.clearCredentials}</span>
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  id="auth-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state: ONLY 2 tabs (Login and Signup). No public admin tab. */
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.googleSignInBtn}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full"></div>
                <span className="bg-zinc-900 px-3 text-[11px] text-zinc-400 uppercase tracking-wider">
                  {t.orWithEmail}
                </span>
              </div>

              {/* Standard tabs: Login vs Sign Up only */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tab === "login"
                      ? "bg-zinc-800 text-zinc-100 shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t.loginTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tab === "signup"
                      ? "bg-zinc-800 text-zinc-100 shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t.signupTab}
                </button>
              </div>

              {/* Email/Password form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {tab === "signup" && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      {t.nameLabel}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-rose-500/60"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-rose-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-rose-500/60"
                    />
                  </div>
                </div>

                {/* Save Email & Password Checkbox */}
                <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="save-credentials-checkbox"
                      checked={rememberCredentials}
                      onChange={(e) => setRememberCredentials(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 bg-zinc-900 border-zinc-700 focus:ring-rose-500 focus:ring-offset-zinc-900 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-zinc-200">
                      {t.rememberMeLabel}
                    </span>
                  </label>
                  <p className="text-[11px] text-zinc-400 pl-6">
                    {t.rememberMeHint}
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading
                    ? t.submitting
                    : tab === "login"
                    ? t.loginSubmitBtn
                    : t.signupSubmitBtn}
                </button>
              </form>

              {hasSavedCredentials && (
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t.credentialsStored}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="text-zinc-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    {t.clearCredentials}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
