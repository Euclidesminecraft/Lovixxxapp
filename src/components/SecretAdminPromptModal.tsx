import React, { useState } from "react";
import { X, Lock, KeyRound, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthUser, AppLanguage } from "../types";
import { loginWithAdminCode, promoteUserToAdmin } from "../utils/auth";
import { getTranslation } from "../i18n/translations";

interface SecretAdminPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onAdminActivated: (adminUser: AuthUser) => void;
  language: AppLanguage;
}

export const SecretAdminPromptModal: React.FC<SecretAdminPromptModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAdminActivated,
  language,
}) => {
  const t = getTranslation(language);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      let adminUser: AuthUser;
      if (currentUser) {
        adminUser = promoteUserToAdmin(currentUser, code.trim());
      } else {
        adminUser = await loginWithAdminCode(code.trim());
      }

      setSuccess(
        language === "pt"
          ? "Código mestre confirmado. Modo Administrador Ativado."
          : "Master code verified. Administrator Mode Activated."
      );

      setTimeout(() => {
        onAdminActivated(adminUser);
        onClose();
        setCode("");
        setSuccess(null);
      }, 700);
    } catch (err: any) {
      setError(
        language === "pt"
          ? "Chave secreta inválida. Acesso negado."
          : "Invalid secret key. Access denied."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="secret-admin-prompt-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="secret-admin-prompt-modal"
        className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4 overflow-hidden"
      >
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-rose-500/40 to-amber-500/40" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
              {language === "pt" ? "Acesso Confidencial" : "Confidential Access"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-all cursor-pointer disabled:opacity-40"
          >
            {isLoading
              ? (language === "pt" ? "Verificando..." : "Verifying...")
              : (language === "pt" ? "Autenticar" : "Authenticate")}
          </button>
        </form>

        <p className="text-[10px] text-zinc-600 font-mono text-center">
          Terminal ID #0342 • Lovix Secure Protocol
        </p>
      </div>
    </div>
  );
};
