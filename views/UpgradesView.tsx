import type { GameState } from '../types';
import type { TranslationKey } from '../i18n/locales';
import ShopItem from '../components/ShopItem';
import { useSettings } from '../hooks/useSettings';

interface UpgradesViewProps {
    gameState: GameState;
    onBuyUpgrade: (upgradeId: string) => void;
}

const UpgradesView = ({ gameState, onBuyUpgrade }: UpgradesViewProps) => {
    const { t } = useSettings();
    const availableUpgrades = gameState.upgrades.filter(u => !u.purchased && (gameState.points > u.cost / 4 || u.cost <= 100));

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg shadow-inner h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-center text-yellow-300">{t('upgrades')}</h2>
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
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
    );
};

export default UpgradesView;