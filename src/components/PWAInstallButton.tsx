import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language: 'pt' | 'en';
  variant?: 'navbar' | 'banner' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed'>('idle');

  // Suppress completely if already launched in standalone mode
  if (isInstalled || installStatus === 'installed') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstallStatus('installing');
      const accepted = await install();
      if (accepted) {
        setInstallStatus('installed');
      } else {
        setInstallStatus('idle');
      }
    } else {
      // Open guide modal for iOS or browsers where prompt is manual
      setShowGuideModal(true);
    }
  };

  const label = language === 'pt' ? 'Instalar App' : 'Install App';

  return (
    <>
      {variant === 'navbar' && (
        <button
          id="pwa-install-nav-btn"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-sm hover:shadow-rose-900/30 transition-all cursor-pointer active:scale-95 border border-rose-500/30"
          title={language === 'pt' ? 'Instalar Lovix como aplicativo no seu celular ou PC' : 'Install Lovix as an app on your phone or desktop'}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{language === 'pt' ? 'App' : 'App'}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div
          id="pwa-install-banner"
          className="p-3 sm:p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>{language === 'pt' ? 'Lovix no seu Celular (PWA)' : 'Lovix on your Phone (PWA)'}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                  NATIVO
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                {language === 'pt'
                  ? 'Acesso em 1 toque, sem barra de navegador, ultra-rápido e offline.'
                  : '1-tap access, no browser address bar, ultra-fast and offline ready.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        </div>
      )}

      {/* Manual / Guided Install Instructions Modal */}
      {showGuideModal && (
        <div
          id="pwa-install-guide-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuideModal(false);
          }}
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-[#111114] border border-white/[0.08] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] text-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {language === 'pt' ? 'Como Instalar o Lovix' : 'How to Install Lovix'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-zinc-300">
              {isIOS ? (
                <>
                  <p className="text-zinc-400 leading-relaxed">
                    {language === 'pt'
                      ? 'No Safari (iPhone/iPad), siga 2 passos rápidos:'
                      : 'On Safari (iPhone/iPad), follow these 2 quick steps:'}
                  </p>
                  <div className="p-3 rounded-xl bg-[#16161b] border border-white/[0.06] space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-semibold text-[11px]">
                        1
                      </div>
                      <p>
                        {language === 'pt' ? (
                          <>Toque no botão <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5" />) na barra inferior do Safari.</>
                        ) : (
                          <>Tap the <strong>Share</strong> button (<Share className="w-3.5 h-3.5 inline mx-0.5" />) in Safari toolbar.</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-semibold text-[11px]">
                        2
                      </div>
                      <p>
                        {language === 'pt' ? (
                          <>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).</>
                        ) : (
                          <>Scroll down and select <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).</>
                        )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-zinc-400 leading-relaxed">
                    {language === 'pt'
                      ? 'Para adicionar o Lovix à sua tela inicial como app:'
                      : 'To add Lovix to your home screen as a standalone app:'}
                  </p>
                  <div className="p-3 rounded-xl bg-[#16161b] border border-white/[0.06] space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-semibold text-[11px]">
                        1
                      </div>
                      <p>
                        {language === 'pt'
                          ? 'Abra o menu do navegador (três pontos no topo ou rodapé).'
                          : 'Open browser menu (the three dots in the top or bottom bar).'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-semibold text-[11px]">
                        2
                      </div>
                      <p>
                        {language === 'pt'
                          ? 'Toque em "Instalar aplicativo" ou "Adicionar à tela inicial".'
                          : 'Tap "Install app" or "Add to Home screen".'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'pt'
                    ? 'O app funcionará em tela cheia como um aplicativo de loja nativo.'
                    : 'The app will launch in standalone fullscreen like a store app.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors cursor-pointer border border-white/[0.06]"
            >
              {language === 'pt' ? 'Entendi' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
