import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  language?: 'pt' | 'en';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language = 'pt' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-[#1c1416] border border-rose-500/40 px-3.5 py-2.5 text-xs text-rose-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
      <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
      <span className="font-medium">
        {language === 'pt'
          ? 'Modo Offline — O app continuará funcionando com dados em cache.'
          : 'Offline Mode — The app will continue operating with cached data.'}
      </span>
    </div>
  );
};
