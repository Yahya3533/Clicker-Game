// A very simple sound effect generator using the Web Audio API.
// This avoids needing to host audio files.
let audioCtx: AudioContext | null = null;
let globalSfxVolume = 0.5; // Default volume
let globalMusicVolume = 0.5; // Default volume

export const setSfxVolume = (vol: number) => {
    globalSfxVolume = vol;
};

const createAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (audioCtx) return audioCtx;
    try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        return null;
    }
    return audioCtx;
};

// This function will be called on the first user interaction to unlock the AudioContext
const resumeAudioContextIfNeeded = () => {
    const ctx = createAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('click', resumeAudioContextIfNeeded, { once: true });
    window.addEventListener('touchstart', resumeAudioContextIfNeeded, { once: true });
    window.addEventListener('keydown', resumeAudioContextIfNeeded, { once: true });
}

const getAudioContext = (): AudioContext | null => {
  return createAudioContext();
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', baseVolume = 0.05, freqSweep = 0, attackTime = 0.005) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  
  const now = ctx.currentTime;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (freqSweep !== 0) {
      // Create a downward pitch sweep for a "pop" or "click" sound
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(0.01, frequency - freqSweep), now + duration / 1000);
  }
  
  const finalVolume = baseVolume * globalSfxVolume;
  // ADSR-like envelope: quick attack, then exponential decay
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(finalVolume, now + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);

  oscillator.start(now);
  oscillator.stop(now + duration / 1000);
};

export const playClickSound = () => {
    // A sharper, more percussive "zap" sound
    playTone(1200, 70, 'triangle', 0.04, 1100);
};
export const playBuySound = () => {
    // A pleasant, rising two-tone sound for confirmation
    playTone(523.25, 80, 'sawtooth', 0.08); // C5
    setTimeout(() => playTone(783.99, 80, 'sawtooth', 0.08), 50); // G5
};
export const playRebirthSound = () => {
    // A more grand, ascending arpeggio
    playTone(261.63, 200, 'sawtooth', 0.1); // C4
    setTimeout(() => playTone(329.63, 200, 'sawtooth', 0.1), 100); // E4
    setTimeout(() => playTone(392.00, 200, 'sawtooth', 0.1), 200); // G4
    setTimeout(() => playTone(523.25, 300, 'sawtooth', 0.1), 300); // C5
};
export const playGoldenEmojiSound = () => {
    // A magical, sparkly, fast ascending arpeggio
    playTone(1046.50, 80, 'triangle', 0.1); // C6
    setTimeout(() => playTone(1318.51, 80, 'triangle', 0.1), 60); // E6
    setTimeout(() => playTone(1567.98, 80, 'triangle', 0.1), 120); // G6
    setTimeout(() => playTone(2093.00, 100, 'triangle', 0.1), 180); // C7
};

// --- Background Music Logic ---
let musicArpeggioInterval: number | null = null;
let musicBassInterval: number | null = null;
let musicKickInterval: number | null = null;
let masterMusicGain: GainNode | null = null;
let isMusicPlaying = false;

const MASTER_MUSIC_BASE_GAIN = 0.06;

export const setMusicVolume = (vol: number) => {
    globalMusicVolume = vol;
    const ctx = getAudioContext();
    if (ctx && masterMusicGain && isMusicPlaying) {
        masterMusicGain.gain.cancelScheduledValues(ctx.currentTime);
        masterMusicGain.gain.linearRampToValueAtTime(MASTER_MUSIC_BASE_GAIN * globalMusicVolume, ctx.currentTime + 0.1);
    }
};

const playNote = (frequency: number, duration: number, type: OscillatorType = 'triangle', volume = 1.0) => {
    const ctx = getAudioContext();
    if (!ctx || !masterMusicGain) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterMusicGain);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
};

const playKick = () => {
    const ctx = getAudioContext();
    if (!ctx || !masterMusicGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(masterMusicGain);

    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, ctx.currentTime); // Subtle volume
    // Fix: Corrected typo in method name from 'exponentialRapToValueAtTime' to 'exponentialRampToValueAtTime'.
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
};


export const startMusic = () => {
    const ctx = getAudioContext();
    if (!ctx || isMusicPlaying) return;

    // Fix: Corrected typo from musicArpegeioInterval to musicArpeggioInterval
    if (musicArpeggioInterval) clearInterval(musicArpeggioInterval);
    if (musicBassInterval) clearInterval(musicBassInterval);
    if (musicKickInterval) clearInterval(musicKickInterval);
    
    isMusicPlaying = true;

    masterMusicGain = ctx.createGain();
    masterMusicGain.connect(ctx.destination);
    masterMusicGain.gain.setValueAtTime(0, ctx.currentTime);
    masterMusicGain.gain.linearRampToValueAtTime(MASTER_MUSIC_BASE_GAIN * globalMusicVolume, ctx.currentTime + 3);

    const noteInterval = 450;

    // Expanded 8-bar progression: I-V-vi-iii-IV-I-IV-V (C-G-Am-Em-F-C-F-G)
    const melody = [
        // C Major
        261.63, 329.63, 392.00, 329.63,
        // G Major
        196.00, 246.94, 293.66, 246.94,
        // A Minor
        220.00, 261.63, 329.63, 261.63,
        // E Minor
        164.81, 196.00, 246.94, 196.00,
        // F Major
        174.61, 220.00, 261.63, 220.00,
        // C Major
        261.63, 329.63, 392.00, 523.25, // Variation
        // F Major
        174.61, 220.00, 261.63, 349.23, // Variation
        // G Major
        196.00, 246.94, 293.66, 392.00, // Variation
    ];
    let arpeggioIndex = 0;

    musicArpeggioInterval = window.setInterval(() => {
        const freq = melody[arpeggioIndex % melody.length];
        playNote(freq, noteInterval * 1.5, 'triangle', 0.8);
        arpeggioIndex++;
    }, noteInterval);

    const bassline = [
        130.81, // C3
        98.00,  // G2
        110.00, // A2
        164.81, // E3
        87.31,  // F2
        130.81, // C3
        87.31,  // F2
        98.00,  // G2
    ];
    let bassIndex = 0;
    const bassInterval = noteInterval * 4;

    musicBassInterval = window.setInterval(() => {
        const freq = bassline[bassIndex % bassline.length];
        playNote(freq, bassInterval * 0.95, 'sine', 1.1);
        bassIndex++;
    }, bassInterval);

    musicKickInterval = window.setInterval(() => {
        playKick();
    }, noteInterval * 2); // Kick on every half note
};

export const stopMusic = () => {
    if (!isMusicPlaying) return;
    
    isMusicPlaying = false;

    if (musicArpeggioInterval) {
        clearInterval(musicArpeggioInterval);
        musicArpeggioInterval = null;
    }
    if (musicBassInterval) {
        clearInterval(musicBassInterval);
        musicBassInterval = null;
    }
    if (musicKickInterval) {
        clearInterval(musicKickInterval);
        musicKickInterval = null;
    }

    if (masterMusicGain) {
        const ctx = getAudioContext();
        if (ctx) {
            masterMusicGain.gain.cancelScheduledValues(ctx.currentTime);
            masterMusicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

            setTimeout(() => {
                masterMusicGain?.disconnect();
                masterMusicGain = null;
            }, 2100);
        } else {
            masterMusicGain.disconnect();
            masterMusicGain = null;
        }
    }
};