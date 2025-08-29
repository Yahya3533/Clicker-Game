
import type { MusicTrackId, MusicTrack } from '../types';

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

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrack> = {
    stardew_craft: {
        beatDuration: 350,
        instrument: 'sine', // Soft sine for the Minecraft feel
        volume: 0.5,
        theme: [
            { freq: 493.88, duration: 'q' }, { freq: 659.25, duration: 'q' }, { freq: 830.61, duration: 'e' }, { freq: 987.77, duration: 'e' },
            { freq: 880.00, duration: 'q' }, { freq: 830.61, duration: 'q' }, { freq: 659.25, duration: 'h' },
            { freq: 493.88, duration: 'q' }, { freq: 659.25, duration: 'q' }, { freq: 830.61, duration: 'e' }, { freq: 987.77, duration: 'e' },
            { freq: 880.00, duration: 'q' }, { freq: 830.61, duration: 'q' }, { freq: 659.25, duration: 'h' },
            { freq: 554.37, duration: 'q' }, { freq: 493.88, duration: 'q' }, { freq: 440.00, duration: 'q' }, { freq: 415.30, duration: 'q' },
            { freq: 369.99, duration: 'h' }, { freq: 415.30, duration: 'e' }, { freq: 440.00, duration: 'e' },
            { freq: 493.88, duration: 'q' }, { freq: 440.00, duration: 'q' }, { freq: 415.30, duration: 'q' }, { freq: 369.99, duration: 'q' },
            { freq: 329.63, duration: 'w' },
            { freq: null, duration: 'h' }, // Rest
        ],
    },
}

let musicSchedulerTimeout: number | null = null;
let musicNoteIndex = 0;
let masterMusicGain: GainNode | null = null;
let isMusicPlaying = false;
let currentTrack: MusicTrack | null = null;

const MASTER_MUSIC_BASE_GAIN = 0.16;

export const setMusicVolume = (vol: number) => {
    globalMusicVolume = vol;
    const ctx = getAudioContext();
    if (ctx && masterMusicGain && isMusicPlaying) {
        masterMusicGain.gain.cancelScheduledValues(ctx.currentTime);
        masterMusicGain.gain.linearRampToValueAtTime(MASTER_MUSIC_BASE_GAIN * globalMusicVolume, ctx.currentTime + 0.1);
    }
};

const playNote = (frequency: number, duration: number, type: OscillatorType, volume: number) => {
    const ctx = getAudioContext();
    if (!ctx || !masterMusicGain) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterMusicGain);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Quick attack to prevent clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
};

const scheduleNextNote = () => {
    const ctx = getAudioContext();
    if (!isMusicPlaying || !ctx || !currentTrack) return;

    if (musicNoteIndex >= currentTrack.theme.length) {
        // Loop the current track
        musicNoteIndex = 0;
    }

    const noteDurations: { [key: string]: number } = {
        'w': 4 * currentTrack.beatDuration,
        'h': 2 * currentTrack.beatDuration,
        'q': 1 * currentTrack.beatDuration,
        'e': 0.5 * currentTrack.beatDuration,
    };

    const note = currentTrack.theme[musicNoteIndex];
    const durationMs = noteDurations[note.duration];
    
    if (note.freq) {
        playNote(note.freq, durationMs * 0.95, currentTrack.instrument, currentTrack.volume);
    }

    musicNoteIndex++;
    
    musicSchedulerTimeout = window.setTimeout(scheduleNextNote, durationMs);
};

export const startMusic = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (musicSchedulerTimeout) clearTimeout(musicSchedulerTimeout);
    
    isMusicPlaying = true;
    currentTrack = MUSIC_TRACKS['stardew_craft'];
    musicNoteIndex = 0;
    
    if (!masterMusicGain) {
        masterMusicGain = ctx.createGain();
        masterMusicGain.connect(ctx.destination);
        masterMusicGain.gain.setValueAtTime(0, ctx.currentTime);
        masterMusicGain.gain.linearRampToValueAtTime(MASTER_MUSIC_BASE_GAIN * globalMusicVolume, ctx.currentTime + 3);
    } else if (ctx.state === 'running' && masterMusicGain.gain.value === 0) {
         // Faded out, fade back in
         masterMusicGain.gain.linearRampToValueAtTime(MASTER_MUSIC_BASE_GAIN * globalMusicVolume, ctx.currentTime + 3);
    }

    scheduleNextNote();
};

export const stopMusic = () => {
    if (!isMusicPlaying) return;
    
    isMusicPlaying = false;
    
    if (musicSchedulerTimeout) {
        clearTimeout(musicSchedulerTimeout);
        musicSchedulerTimeout = null;
    }

    if (masterMusicGain) {
        const ctx = getAudioContext();
        if (ctx) {
            masterMusicGain.gain.cancelScheduledValues(ctx.currentTime);
            masterMusicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

            // Do not disconnect, just set volume to 0. This way we can fade in again.
        }
    }
};