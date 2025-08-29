import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '../i18n/locales';
import { 
    startMusic, 
    stopMusic, 
    setSfxVolume as setAudioSfxVolume, 
    setMusicVolume as setAudioMusicVolume 
} from '../utils/audio';

interface SettingsContextProps {
  isSoundOn: boolean;
  setIsSoundOn: (isOn: boolean) => void;
  isMusicOn: boolean;
  setIsMusicOn: (isOn: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  sfxVolume: number;
  setSfxVolume: (vol: number) => void;
  musicVolume: number;
  setMusicVolume: (vol: number) => void;
  // Fix: Update `t` function signature to accept variables for interpolation.
  t: (key: TranslationKey, vars?: { [key: string]: string | number }) => string;
}

export const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

const getInitialSoundState = (): boolean => {
    const savedSound = localStorage.getItem('emojiClickerSound');
    return savedSound ? JSON.parse(savedSound) : true;
};

const getInitialMusicState = (): boolean => {
    const savedMusic = localStorage.getItem('emojiClickerMusic');
    return savedMusic ? JSON.parse(savedMusic) : false; // Default off
};

const getInitialLanguage = (): Language => {
    const savedLang = localStorage.getItem('emojiClickerLanguage');
    return savedLang === 'en' ? 'en' : 'tr';
};

const getInitialSfxVolume = (): number => {
    const savedVolume = localStorage.getItem('emojiClickerSfxVolume');
    return savedVolume ? JSON.parse(savedVolume) : 0.5;
};

const getInitialMusicVolume = (): number => {
    const savedVolume = localStorage.getItem('emojiClickerMusicVolume');
    return savedVolume ? JSON.parse(savedVolume) : 0.5;
};


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isSoundOn, setIsSoundOnState] = useState<boolean>(getInitialSoundState);
  const [isMusicOn, setIsMusicOnState] = useState<boolean>(getInitialMusicState);
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [sfxVolume, setSfxVolumeState] = useState<number>(getInitialSfxVolume);
  const [musicVolume, setMusicVolumeState] = useState<number>(getInitialMusicVolume);

  useEffect(() => {
    localStorage.setItem('emojiClickerSound', JSON.stringify(isSoundOn));
  }, [isSoundOn]);

  useEffect(() => {
    localStorage.setItem('emojiClickerMusic', JSON.stringify(isMusicOn));
    if (isMusicOn) {
        startMusic();
    } else {
        stopMusic();
    }
    return () => stopMusic();
  }, [isMusicOn]);

  useEffect(() => {
    localStorage.setItem('emojiClickerLanguage', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('emojiClickerSfxVolume', JSON.stringify(sfxVolume));
    setAudioSfxVolume(sfxVolume);
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem('emojiClickerMusicVolume', JSON.stringify(musicVolume));
    setAudioMusicVolume(musicVolume);
  }, [musicVolume]);

  const setIsSoundOn = (isOn: boolean) => {
    setIsSoundOnState(isOn);
  };

  const setIsMusicOn = (isOn: boolean) => {
    setIsMusicOnState(isOn);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setSfxVolume = (vol: number) => {
    setSfxVolumeState(vol);
  }

  const setMusicVolume = (vol: number) => {
    setMusicVolumeState(vol);
  };
  
  // Fix: Update `t` function to handle placeholder replacement for dynamic strings.
  const t = useCallback((key: TranslationKey, vars?: { [key: string]: string | number }): string => {
    let translation = translations[language][key] || translations['en'][key];
    if (!translation) {
      return key;
    }
    
    if (vars) {
      Object.keys(vars).forEach(varKey => {
        const regex = new RegExp(`{${varKey}}`, 'g');
        translation = translation.replace(regex, String(vars[varKey]));
      });
    }
    
    return translation;
  }, [language]);

  return (
    <SettingsContext.Provider value={{ isSoundOn, setIsSoundOn, isMusicOn, setIsMusicOn, language, setLanguage, sfxVolume, setSfxVolume, musicVolume, setMusicVolume, t }}>
      {children}
    </SettingsContext.Provider>
  );
};