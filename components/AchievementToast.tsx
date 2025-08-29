import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { TranslationKey } from '../i18n/locales';

interface AchievementToastProps {
  icon: string;
  achievementId: string;
  onClose: () => void;
}

const AchievementToast = ({ icon, achievementId, onClose }: AchievementToastProps) => {
    const { t } = useSettings();

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 1500); // Disappears after 1.5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="bg-gray-800 border border-yellow-400 rounded-lg shadow-2xl p-4 flex items-center gap-4 animate-slide-up-out w-max">
            <span className="text-3xl">{icon}</span>
            <div>
                <p className="font-bold text-yellow-300">{t('achievement_unlocked')}</p>
                <p className="text-sm text-white">{t(`achievement_${achievementId}_name` as TranslationKey)}</p>
            </div>
            <style>{`
                @keyframes slide-up-out {
                    0% {
                        transform: translateY(150%);
                        opacity: 0;
                    }
                    15%, 85% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(150%);
                        opacity: 0;
                    }
                }
                .animate-slide-up-out {
                    animation: slide-up-out 1.5s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AchievementToast;