import { useMemo, memo } from 'react';
import { formatNumber } from '../utils/format';
import { useSettings } from '../hooks/useSettings';

interface ShopItemProps {
  emoji?: string;
  name: string;
  description?: string;
  level?: number;
  cost: number;
  pps?: number;
  isAffordable: boolean;
  isPurchased?: boolean;
  onBuy: () => void;
}

const ShopItem = ({
  emoji,
  name,
  description,
  level,
  cost,
  pps,
  isAffordable,
  isPurchased = false,
  onBuy
}: ShopItemProps) => {
  const { t } = useSettings();
  const buttonClasses = isAffordable && !isPurchased
    ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
    : isPurchased
    ? 'bg-green-700 cursor-not-allowed'
    : 'bg-gray-700 cursor-not-allowed';

  const animationDelay = useMemo(() => `${Math.random() * 2.5}s`, []);

  return (
    <div className={`relative flex items-center p-3 bg-gray-800 rounded-lg transition-all duration-200 ${!isAffordable && !isPurchased ? 'opacity-50' : ''}`}>
      {level !== undefined && level > 0 && (
          <span 
              className="absolute top-1 left-1 text-lg animate-ping-fade pointer-events-none"
              style={{ animationDelay }}
              aria-hidden="true"
          >
              ✨
          </span>
      )}
      {emoji && <div className="text-4xl mr-4">{emoji}</div>}
      <div className="flex-grow">
        <h3 className="font-bold text-white">{name} {level !== undefined && <span className="text-sm font-normal text-gray-400">{t('level_short')} {level}</span>}</h3>
        {description && <p className="text-sm text-gray-400">{description}</p>}
        {pps !== undefined && <p className="text-sm text-cyan-300">{t('each')}: {formatNumber(pps)} ⭐/s</p>}
      </div>
      <button
        onClick={onBuy}
        disabled={!isAffordable || isPurchased}
        className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-200 min-w-[140px] text-center ${buttonClasses}`}
      >
        {isPurchased ? t('owned') : `${t('buy')}: ${formatNumber(cost)} ⭐`}
      </button>
    </div>
  );
};

export default memo(ShopItem);