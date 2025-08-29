import { useSettings } from '../hooks/useSettings';
import type { TranslationKey } from '../i18n/locales';
import { ACHIEVEMENTS } from '../achievements';

interface AchievementsViewProps {
    unlockedAchievements: { [key: string]: boolean };
}

const AchievementsView = ({ unlockedAchievements }: AchievementsViewProps) => {
    const { t } = useSettings();
    const nonSecretAchievements = ACHIEVEMENTS.filter(a => !a.secret);
    const unlockedCount = nonSecretAchievements.filter(ach => unlockedAchievements[ach.id]).length;
    const totalCount = nonSecretAchievements.length;
    const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg flex-1 flex flex-col min-h-0">
            <h2 className="text-3xl font-bold mb-2 text-center text-yellow-300">{t('achievements')} 🏅</h2>
            <p className="text-center text-gray-400 mb-6">
                {unlockedCount} / {totalCount} {t('owned')}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 mb-8 shadow-inner">
                <div
                    className="bg-yellow-400 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            {/* Achievements List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 hide-scrollbar">
                {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = !!unlockedAchievements[ach.id];

                    if (ach.secret && !isUnlocked) {
                        return null; // Completely hide locked secret achievements
                    }

                    return (
                        <div
                            key={ach.id}
                            className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${isUnlocked ? 'bg-gray-700' : 'bg-gray-900/50 opacity-60'}`}
                        >
                            <div className={`text-4xl transition-all duration-300 ${!isUnlocked ? 'filter grayscale' : ''}`}>
                                {ach.icon}
                            </div>
                            <div className="flex-grow">
                                <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                    {t(`achievement_${ach.id}_name` as TranslationKey)}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {t(`achievement_${ach.id}_desc` as TranslationKey)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsView;