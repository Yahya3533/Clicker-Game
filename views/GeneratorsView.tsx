import type { GameState } from '../types';
import type { TranslationKey } from '../i18n/locales';
import ShopItem from '../components/ShopItem';
import { useSettings } from '../hooks/useSettings';

interface GeneratorsViewProps {
    gameState: GameState;
    getUpgradeMultiplier: (targetId: string) => number;
    onBuyGenerator: (generatorId: string) => void;
}

const GeneratorsView = ({ gameState, getUpgradeMultiplier, onBuyGenerator }: GeneratorsViewProps) => {
    const { t } = useSettings();

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg shadow-inner h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-center text-cyan-300">{t('generators')}</h2>
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
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
    );
};

export default GeneratorsView;