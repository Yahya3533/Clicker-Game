import type { GameState } from '../types';
import type { TranslationKey } from '../i18n/locales';
import ShopItem from '../components/ShopItem';
import { useSettings } from '../hooks/useSettings';

interface ShopViewProps {
    gameState: GameState;
    getUpgradeMultiplier: (targetId: string) => number;
    onBuyGenerator: (generatorId: string) => void;
    onBuyUpgrade: (upgradeId: string) => void;
}

const ShopView = ({ gameState, getUpgradeMultiplier, onBuyGenerator, onBuyUpgrade }: ShopViewProps) => {
    const { t } = useSettings();
    const availableUpgrades = gameState.upgrades.filter(u => !u.purchased && (gameState.points > u.cost / 4 || u.cost <= 100));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generators Column */}
            <div className="bg-gray-800/50 p-4 rounded-lg shadow-inner">
                <h2 className="text-xl font-bold mb-4 text-center text-cyan-300">{t('generators')}</h2>
                <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
                    {gameState.generators.map((gen) => {
                        const cost = gen.baseCost * Math.pow(gen.costMultiplier, gen.level);
                        return (
                            <ShopItem
                                key={gen.id}
                                emoji={gen.emoji}
                                name={t(`generator_${gen.id}_name` as TranslationKey)}
                                level={gen.level}
                                cost={cost}
                                pps={gen.basePps * getUpgradeMultiplier(gen.id)}
                                isAffordable={gameState.points >= cost}
                                onBuy={() => onBuyGenerator(gen.id)}
                            />
                        );
                    })}
                </div>
            </div>
            
            {/* Upgrades Column */}
            <div className="bg-gray-800/50 p-4 rounded-lg shadow-inner">
                <h2 className="text-xl font-bold mb-4 text-center text-yellow-300">{t('upgrades')}</h2>
                <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
                    {availableUpgrades.length > 0 ? (
                        availableUpgrades.map((upgrade) => (
                            <ShopItem
                                key={upgrade.id}
                                name={t(`upgrade_${upgrade.id}_name` as TranslationKey)}
                                description={t(`upgrade_${upgrade.id}_desc` as TranslationKey)}
                                cost={upgrade.cost}
                                isAffordable={gameState.points >= upgrade.cost}
                                isPurchased={upgrade.purchased}
                                onBuy={() => onBuyUpgrade(upgrade.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-400 italic mt-4">{t('no_upgrades_available')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopView;