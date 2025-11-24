import { useCallback, useRef, useState } from 'react';

const createContext = (audioContextRef, masterGainRef) => {
  if (typeof window === 'undefined') return null;
  if (audioContextRef.current) return audioContextRef.current;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  const context = new AudioContext();
  const masterGain = context.createGain();
  masterGain.gain.value = 0.08;
  masterGain.connect(context.destination);

  audioContextRef.current = context;
  masterGainRef.current = masterGain;
  return context;
};

const playSequence = (context, masterGain, notes = []) => {
  if (!context || !masterGain) return;
  const startTime = context.currentTime + 0.05;

  notes.forEach((note, index) => {
    const {
      freq,
      duration = 0.25,
      delay = index * 0.08,
      type = 'sine',
      volume = 1,
    } = note;

    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    const actualStart = startTime + delay;
    const actualEnd = actualStart + duration;

    gainNode.gain.value = volume;
    gainNode.gain.setValueAtTime(volume, actualStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, actualEnd);

    osc.connect(gainNode);
    gainNode.connect(masterGain);

    osc.start(actualStart);
    osc.stop(actualEnd + 0.02);
  });
};

const WELCOME_NOTES = [
  { freq: 660, duration: 0.22, type: 'triangle', volume: 0.9 },
  { freq: 880, duration: 0.2, type: 'sine', delay: 0.09 },
  { freq: 990, duration: 0.25, type: 'sine', delay: 0.18 },
];

const FLUTTER_NOTES = [
  { freq: 740, duration: 0.15, type: 'sine', volume: 0.8 },
  { freq: 880, duration: 0.18, type: 'triangle', delay: 0.07 },
  { freq: 988, duration: 0.2, type: 'sine', delay: 0.13 },
];

const SPARKLE_NOTES = [
  { freq: 880, duration: 0.18, type: 'triangle' },
  { freq: 1175, duration: 0.2, type: 'sine', delay: 0.06 },
  { freq: 1397, duration: 0.22, type: 'triangle', delay: 0.12 },
];

const useButterflySounds = (initialEnabled = true) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);

  const ensureContext = useCallback(() => {
    const context = createContext(audioContextRef, masterGainRef);
    if (context && context.state === 'suspended') {
      context.resume();
    }
    return context;
  }, []);

  const playNotes = useCallback(
    (notes) => {
      if (!enabled) return;
      const context = ensureContext();
      const masterGain = masterGainRef.current;
      if (!context || !masterGain) return;
      playSequence(context, masterGain, notes);
    },
    [enabled, ensureContext]
  );

  const toggleSounds = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        ensureContext();
      } else if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
      }
      return next;
    });
  }, [ensureContext]);

  const playWelcomeChime = useCallback(() => playNotes(WELCOME_NOTES), [playNotes]);
  const playFlutterTone = useCallback(() => playNotes(FLUTTER_NOTES), [playNotes]);
  const playSparkleTone = useCallback(() => playNotes(SPARKLE_NOTES), [playNotes]);

  return {
    enabled,
    toggleSounds,
    playWelcomeChime,
    playFlutterTone,
    playSparkleTone,
  };
};

export default useButterflySounds;
