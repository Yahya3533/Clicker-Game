import { memo } from 'react';
import { formatNumber } from '../utils/format';
import { useSettings } from '../hooks/useSettings';
import type { Boost } from '../types';
import SaveIndicator from './SaveIndicator';

interface HeaderProps {
  points: number;
  pps: number;
  gems: number;
  boost: Boost | null;
  isSaving: boolean;
  onSettingsClick: () => void;
}

const Header = ({ points, pps, gems, boost, isSaving, onSettingsClick }: HeaderProps) => {
  const { t } = useSettings();

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex justify-around items-center text-white text-center p-4 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <SaveIndicator isSaving={isSaving} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm md:text-lg font-bold text-yellow-300">{formatNumber(points)} ⭐</h2>
          <p className="text-xs md:text-sm text-gray-400">{t('points')}</p>
        </div>
        <div className="flex-1 border-l border-r border-gray-700 px-2">
          <h2 className="text-sm md:text-lg font-bold text-cyan-300">{formatNumber(pps)} ⭐/s</h2>
          <p className="text-xs md:text-sm text-gray-400">{t('pps')}</p>
        </div>
        <div className="flex-1">
          <h2 className="text-sm md:text-lg font-bold text-purple-400">{formatNumber(gems)} 💎</h2>
          <p className="text-xs md:text-sm text-gray-400">{t('gems')} (+{gems * 10}% Boost)</p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button 
              onClick={onSettingsClick} 
              className="text-2xl md:text-3xl hover:text-gray-300 transition-colors"
              aria-label={t('settings')}
            >
                ⚙️
            </button>
        </div>
      </div>
      {boost && (
        <div className="bg-yellow-400/90 text-center p-1 text-black text-sm font-bold animate-pulse">
            {t('golden_boost_active')} {t('golden_boost_timer', { multiplier: boost.multiplier, timeLeft: boost.timeLeft })}
        </div>
      )}
    </header>
  );
};

export default memo(Header);