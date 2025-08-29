import { useState, useCallback, memo, MouseEvent, CSSProperties } from 'react';
import { formatNumber } from '../utils/format';
import { useSettings } from '../hooks/useSettings';

interface MainClickerProps {
  onClick: () => void;
  clickPower: number;
  clickLevel: number;
  clickProgress: number;
  clicksForNextLevel: number;
}

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
}

interface Particle {
    id: number;
    style: CSSProperties;
}

const MainClicker = ({ onClick, clickPower, clickLevel, clickProgress, clicksForNextLevel }: MainClickerProps) => {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { t } = useSettings();

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    onClick();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Floating text logic
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      text: `+${formatNumber(clickPower)}`,
      x,
      y,
    };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);

    // Particle effect logic
    const newParticles = Array.from({ length: 8 }).map(() => {
        const id = Math.random();
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50 + 30;
        const duration = Math.random() * 0.5 + 0.5;
        const size = Math.random() * 6 + 4;

        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, duration * 1000);

        return {
            id,
            style: {
                left: `${x}px`,
                top: `${y}px`,
                width: `${size}px`,
                height: `${size}px`,
                '--angle': `${angle}rad`,
                '--distance': `${distance}px`,
                animationDuration: `${duration}s`,
            } as CSSProperties
        };
    });
    setParticles(prev => [...prev, ...newParticles]);

  }, [onClick, clickPower]);

  const progressPercent = clicksForNextLevel > 0 ? (clickProgress / clicksForNextLevel) * 100 : 0;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-white mb-4">{t('point_factory')}</h2>
      <p className="text-gray-400 mb-4">{t('click_instruction')}</p>
      <button
        onClick={handleClick}
        className="text-8xl md:text-9xl transform transition-transform duration-100 active:scale-90 select-none focus:outline-none relative"
        aria-label={t('click_aria_label')}
      >
        ⭐
         {floatingTexts.map(ft => (
          <span
            key={ft.id}
            className="absolute text-2xl font-bold text-yellow-300 pointer-events-none animate-float-up"
            style={{ left: ft.x, top: ft.y, transform: 'translate(-50%, -50%)' }}
          >
            {ft.text}
          </span>
        ))}
        {particles.map(p => (
            <div
                key={p.id}
                className="absolute rounded-full bg-yellow-200 pointer-events-none animate-burst"
                style={p.style}
            />
        ))}
      </button>
       <div className="w-full max-w-xs mt-6 text-center">
        <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-lg text-white">{t('click_level')} {clickLevel}</span>
            <span className="text-sm text-gray-400">
                {formatNumber(clickProgress)} / {formatNumber(clicksForNextLevel)}
            </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
            <div
                className="bg-yellow-400 h-4 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
        <p className="text-sm text-green-400 mt-2">
            +{((clickLevel - 1) * 50).toFixed(0)}% {t('click_power_bonus')}
        </p>
      </div>
       <style>{`
          @keyframes float-up {
            0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
            100% { transform: translate(-50%, -150%) translateY(-50px); opacity: 0; }
          }
          .animate-float-up {
            animation: float-up 2s ease-out forwards;
          }
          @keyframes burst {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              100% { 
                  transform: translate(calc(-50% + cos(var(--angle)) * var(--distance)), calc(-50% + sin(var(--angle)) * var(--distance))) scale(0);
                  opacity: 0;
              }
          }
          .animate-burst {
              animation-name: burst;
              animation-timing-function: ease-out;
              animation-fill-mode: forwards;
          }
        `}</style>
    </div>
  );
};

export default memo(MainClicker);