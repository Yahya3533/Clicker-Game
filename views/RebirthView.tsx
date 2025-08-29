import { useSettings } from '../hooks/useSettings';
import { formatNumber } from '../utils/format';
import { PRESTIGE_COST_BASE, PRESTIGE_COST_SCALING, PRESTIGE_BONUS_PER_LEVEL } from '../constants';

interface RebirthViewProps {
    points: number;
    gems: number;
    prestigeLevel: number;
    nextRebirthCost: number;
    onRebirth: () => void;
    onPrestige: () => void;
}

const RebirthView = ({ points, gems, prestigeLevel, nextRebirthCost, onRebirth, onPrestige }: RebirthViewProps) => {
    const { t } = useSettings();
    const prestigeCost = PRESTIGE_COST_BASE + prestigeLevel * PRESTIGE_COST_SCALING;
    const currentPrestigeBonus = prestigeLevel * PRESTIGE_BONUS_PER_LEVEL * 100;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Rebirth Section */}
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg text-center w-full lg:flex-1">
                <h2 className="text-3xl font-bold mb-4 text-purple-400">{t('rebirth')} 💎</h2>
                <div className="max-w-md mx-auto">
                    <p className="text-gray-300 mb-6">{t('rebirth_desc')}</p>
                    <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-400 mb-1">{t('next_gem')}</p>
                        <p className="text-2xl font-bold text-yellow-300">{formatNumber(nextRebirthCost)} ⭐</p>
                    </div>
                    <button
                        onClick={onRebirth}
                        disabled={points < nextRebirthCost}
                        className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-lg"
                    >
                        {t('rebirth_btn')}
                    </button>
                </div>
            </div>

            {/* Prestige Section */}
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg text-center w-full lg:flex-1">
                 <h2 className="text-3xl font-bold mb-4 text-yellow-400">{t('prestige')} ✨</h2>
                 <div className="max-w-md mx-auto">
                    <p className="text-gray-300 mb-6">{t('prestige_desc')}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                             <p className="text-sm text-gray-400 mb-1">{t('prestige_bonus')}</p>
                             <p className="text-2xl font-bold text-green-400">+{currentPrestigeBonus}%</p>
                        </div>
                         <div className="bg-gray-900/50 p-4 rounded-lg">
                             <p className="text-sm text-gray-400 mb-1">{t('next_prestige_cost')}</p>
                             <p className="text-2xl font-bold text-purple-400">{formatNumber(prestigeCost)} 💎</p>
                        </div>
                    </div>
                    <button
                        onClick={onPrestige}
                        disabled={gems < prestigeCost}
                        className="w-full py-3 rounded-lg font-bold text-black transition-all duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-lg"
                    >
                        {t('prestige_btn')}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default RebirthView;