import { useSettings } from '../hooks/useSettings';

type ActiveTab = 'main' | 'rebirth' | 'leaderboard' | 'achievements';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

interface NavButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ label, icon, isActive, onClick }: NavButtonProps) => {
  const activeClasses = 'text-blue-400';
  const inactiveClasses = 'text-gray-400 hover:text-white';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={label}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { t } = useSettings();

  const navItems = [
    { id: 'main', icon: '⭐', label: t('nav_main') },
    { id: 'rebirth', icon: '💎', label: t('nav_rebirth') },
    { id: 'achievements', icon: '🏅', label: t('nav_achievements') },
    { id: 'leaderboard', icon: '🏆', label: t('nav_leaderboard') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 h-16 flex justify-around items-center z-20">
      {navItems.map(item => (
        <NavButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.id}
          onClick={() => onTabChange(item.id as ActiveTab)}
        />
      ))}
    </nav>
  );
};

export default Navigation;