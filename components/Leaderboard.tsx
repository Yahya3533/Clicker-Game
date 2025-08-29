import type { LeaderboardEntry, LeaderboardCategory } from '../types';
import type { TranslationKey } from '../i18n/locales';
import { useSettings } from '../hooks/useSettings';
import { formatNumber } from '../utils/format';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  category: LeaderboardCategory;
  onCategoryChange: (category: LeaderboardCategory) => void;
}

const Leaderboard = ({
  data,
  category,
  onCategoryChange,
}: LeaderboardProps) => {
  const { t } = useSettings();

  const categories: { key: LeaderboardCategory; label: TranslationKey }[] = [
    { key: 'points', label: 'points' },
    { key: 'totalClicks', label: 'total_clicks' },
    { key: 'gems', label: 'gems' },
  ];

  return (
    <aside className="lg:col-span-12 bg-gray-800/50 p-4 rounded-lg shadow-lg flex-1 flex flex-col min-h-0">
      <h2 className="text-xl font-bold mb-4 text-center text-green-300">{t('leaderboard')}</h2>

      <div className="flex justify-center mb-3 bg-gray-900/50 rounded-lg p-1">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
              category === cat.key
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t(cat.label)}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto flex-1 hide-scrollbar">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-green-300 uppercase bg-gray-700 sticky top-0">
                <tr>
                    <th scope="col" className="px-4 py-2 text-center w-1/6">{t('rank')}</th>
                    <th scope="col" className="px-4 py-2 w-3/6">{t('player')}</th>
                    <th scope="col" className="px-4 py-2 text-right w-2/6">{t(category === 'totalClicks' ? 'total_clicks' : category === 'gems' ? 'gems' : 'points')}</th>
                </tr>
            </thead>
            <tbody>
                {data.map((entry) => (
                    <tr key={`${entry.rank}-${entry.name}`} className={`border-b border-gray-700 ${entry.isPlayer ? 'bg-green-500/20' : 'hover:bg-gray-700/50'}`}>
                        <td className="px-4 py-2 font-medium text-center">{entry.rank}</td>
                        <td className="px-4 py-2 font-bold truncate">{entry.name}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatNumber(entry.score)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </aside>
  );
};

export default Leaderboard;