import { useState, FormEvent } from 'react';
import { useSettings } from '../hooks/useSettings';

interface NameInputModalProps {
  onNameSubmit: (name: string) => void;
}

const nameParts = {
    en: {
        adjectives: ['Bouncing', 'Glimmering', 'Whispering', 'Wobbly', 'Zany', 'Galactic', 'Sleepy', 'Grumpy', 'Sparkly', 'Silly', 'Invisible', 'Gigantic', 'Tiny', 'Clumsy', 'Dapper', 'Funky', 'Ghostly', 'Quantum', 'Turbo', 'Legendary'],
        nouns: ['Waffle', 'Potato', 'Ghost', 'Ninja', 'Pineapple', 'Spaceman', 'Puddle', 'Sock', 'Robot', 'Wizard', 'Donut', 'Cactus', 'Marshmallow', 'Sloth', 'Flamingo', 'Gnome', 'Yeti', 'Pancake', 'Unicorn', 'T-Rex']
    },
    tr: {
        adjectives: ['Zıplayan', 'Parıldayan', 'Fısıldayan', 'Yalpalayan', 'Çılgın', 'Galaktik', 'Uykulu', 'Huysuz', 'Işıltılı', 'Şapşal', 'Görünmez', 'Devasa', 'Minik', 'Sakar', ' afili', 'Acayip', 'Hayaletimsi', 'Kuantum', 'Turbo', 'Efsanevi'],
        nouns: ['Gofret', 'Patates', 'Hayalet', 'Ninja', 'Ananas', 'Astronot', 'Gölet', 'Çorap', 'Robot', 'Büyücü', 'Donut', 'Kaktüs', 'Lokum', 'Tembel Hayvan', 'Flamingo', 'Cüce', 'Kocaayak', 'Pankek', 'Tekboynuz', 'T-Rex']
    }
};

const NameInputModal = ({ onNameSubmit }: NameInputModalProps) => {
  const [name, setName] = useState('');
  const { t, language } = useSettings();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };
  
  const handleRandomName = () => {
    const currentAdjectives = nameParts[language].adjectives;
    const currentNouns = nameParts[language].nouns;
    const randomAdjective = currentAdjectives[Math.floor(Math.random() * currentAdjectives.length)];
    const randomNoun = currentNouns[Math.floor(Math.random() * currentNouns.length)];
    const newName = `${randomAdjective} ${randomNoun}`;
    setName(newName.slice(0, 15));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm text-white border border-gray-700 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">{t('welcome_title')}</h1>
        <p className="text-gray-400 mb-6">{t('enter_your_name')}</p>
        <form onSubmit={handleSubmit}>
          <div className="relative w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 15))}
              placeholder={t('name_placeholder') || ''}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-4 pr-12 py-3 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleRandomName}
              className="absolute right-0 top-0 h-full px-4 text-2xl text-gray-400 hover:text-yellow-300 transition-colors"
              aria-label={t('random_name_tooltip')}
              title={t('random_name_tooltip') || ''}
            >
              🎲
            </button>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-6 py-3 rounded-lg font-bold text-white text-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {t('start_playing')}
          </button>
        </form>
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

export default NameInputModal;