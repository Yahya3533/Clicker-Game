import { useSettings } from '../hooks/useSettings';
import { formatNumber } from '../utils/format';

interface OfflineProgressModalProps {
  earnedPoints: number;
  duration: number; // in milliseconds
  onClose: () => void;
}

const formatDuration = (ms: number): string => {
    if (ms < 0) ms = 0;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

const OfflineProgressModal = ({ earnedPoints, duration, onClose }: OfflineProgressModalProps) => {
  const { t } = useSettings();

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm text-white border border-yellow-400 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">{t('offline_progress_title')}</h1>
        <p className="text-gray-400 mb-6">{t('offline_earnings_desc', { duration: formatDuration(duration) })}</p>
        
        <div className="bg-gray-900/50 p-6 rounded-lg mb-8">
            <p className="text-4xl font-bold text-yellow-300 animate-pulse">
                +{formatNumber(earnedPoints)} ⭐
            </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-lg font-bold text-white text-lg transition-all duration-300 bg-blue-600 hover:bg-blue-500"
        >
          {t('collect')}
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OfflineProgressModal;
