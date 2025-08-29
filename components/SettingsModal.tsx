import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { Language } from '../i18n/locales';
import { playClickSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheat: () => void;
  onHardReset: () => void;
  playerName: string | null;
}

const SettingsModal = ({ isOpen, onClose, onCheat, onHardReset, playerName }: SettingsModalProps) => {
  const { 
    isSoundOn, setIsSoundOn, 
    isMusicOn, setIsMusicOn, 
    language, setLanguage, 
    sfxVolume, setSfxVolume,
    musicVolume, setMusicVolume,
    t 
  } = useSettings();

  const [isConfirmingCheat, setIsConfirmingCheat] = useState(false);
  const cheatTimeoutRef = useRef<number | null>(null);
  
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);


  const handleCheatClick = () => {
    if (isConfirmingCheat) {
        if (cheatTimeoutRef.current) {
            clearTimeout(cheatTimeoutRef.current);
            cheatTimeoutRef.current = null;
        }
        onCheat();
        setIsConfirmingCheat(false);
    } else {
        setIsConfirmingCheat(true);
        cheatTimeoutRef.current = window.setTimeout(() => {
            setIsConfirmingCheat(false);
            cheatTimeoutRef.current = null;
        }, 3000); // Reverts after 3 seconds
    }
  };
  
  const handleResetClick = () => {
    if (isConfirmingReset) {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = null;
        }
        onHardReset();
        setIsConfirmingReset(false);
    } else {
        setIsConfirmingReset(true);
        resetTimeoutRef.current = window.setTimeout(() => {
            setIsConfirmingReset(false);
            resetTimeoutRef.current = null;
        }, 3000);
    }
  };

  useEffect(() => {
    if (!isOpen) {
        // Reset confirmation states when modal is closed
        setIsConfirmingCheat(false);
        if (cheatTimeoutRef.current) {
            clearTimeout(cheatTimeoutRef.current);
            cheatTimeoutRef.current = null;
        }
        
        setIsConfirmingReset(false);
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = null;
        }
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md text-white border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-300">{t('game_settings')}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white transition-colors" aria-label={t('close')}>
            &times;
          </button>
        </div>

        {/* Sound Settings */}
        <div className="bg-gray-700/50 rounded-lg mb-4">
            <div className="flex items-center justify-between p-4">
                <span className="font-semibold">{t('sound')}</span>
                <label htmlFor="sound-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="sound-toggle" 
                        className="sr-only peer" 
                        checked={isSoundOn}
                        onChange={(e) => setIsSoundOn(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
             <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSoundOn ? 'max-h-20 opacity-100 p-4 border-t border-gray-600' : 'max-h-0 opacity-0 p-0 border-t-0'}`}>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">🔊 Volume</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={sfxVolume}
                        onChange={(e) => setSfxVolume(Number(e.target.value))}
                        onMouseUp={() => isSoundOn && playClickSound()}
                        onTouchEnd={() => isSoundOn && playClickSound()}
                        className="w-2/3 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        aria-label="Sound volume"
                    />
                </div>
            </div>
        </div>
        
        {/* Music Settings */}
        <div className="bg-gray-700/50 rounded-lg mb-4">
            <div className="flex items-center justify-between p-4">
                <span className="font-semibold">{t('background_music')}</span>
                <label htmlFor="music-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="music-toggle" 
                        className="sr-only peer" 
                        checked={isMusicOn}
                        onChange={(e) => setIsMusicOn(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isMusicOn ? 'max-h-20 opacity-100 p-4 border-t border-gray-600' : 'max-h-0 opacity-0 p-0 border-t-0'}`}>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">🎵 Volume</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(Number(e.target.value))}
                        className="w-2/3 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        aria-label="Music volume"
                    />
                </div>
            </div>
        </div>

        {/* Language Settings */}
        <div className="p-4 bg-gray-700/50 rounded-lg">
            <span className="font-semibold block mb-3">{t('language')}</span>
            <div className="flex space-x-2">
                <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    English
                </button>
                <button
                    onClick={() => handleLanguageChange('tr')}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'tr' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    Türkçe
                </button>
            </div>
        </div>

        {/* Dev / Reset Buttons */}
        {playerName === 'Yhy3533' && (
            <div className="mt-6 pt-4 border-t border-gray-600 space-y-3">
                <button
                    onClick={handleCheatClick}
                    className={`w-full py-2 px-4 rounded-md font-bold text-white transition-colors ${
                        isConfirmingCheat
                            ? 'bg-yellow-500 hover:bg-yellow-400'
                            : 'bg-red-600 hover:bg-red-500'
                    }`}
                >
                    {isConfirmingCheat ? t('unlock_confirm_short') : t('unlock_everything')}
                </button>
                <div className="text-center">
                    <button
                        onClick={handleResetClick}
                        className={`w-full py-2 px-4 rounded-md font-bold text-white transition-colors ${
                            isConfirmingReset
                                ? 'bg-orange-600 hover:bg-orange-500'
                                : 'bg-red-800 hover:bg-red-700'
                        }`}
                    >
                        {isConfirmingReset ? t('hard_reset_confirm_short') : t('hard_reset')}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">{t('hard_reset_desc')}</p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default SettingsModal;