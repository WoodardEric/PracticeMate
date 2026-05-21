import { useEffect, useRef, useState } from 'react';
import type { MetronomeSettings } from '../types/music';
import { DEFAULT_TIME_SIGNATURE, normalizeTimeSignature, parseTimeSignature } from '../utils/metronome';
import { clampBpm } from '../utils/note';

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.1;

const DEFAULT_SETTINGS: MetronomeSettings = {
  bpm: 80,
  timeSignature: DEFAULT_TIME_SIGNATURE,
  accentEnabled: true,
  volume: 0.55,
  isRunning: false,
};

export function useMetronome() {
  const [settings, setSettings] = useState<MetronomeSettings>(DEFAULT_SETTINGS);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const beatIndexRef = useRef(0);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  function beatsPerMeasure(timeSignature: MetronomeSettings['timeSignature']): number {
    return parseTimeSignature(timeSignature).top;
  }

  function tickDurationSeconds(currentSettings: MetronomeSettings): number {
    return 60 / currentSettings.bpm;
  }

  function ensureAudioContext() {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const context = new window.AudioContext();
    audioContextRef.current = context;
    return context;
  }

  function scheduleClick(time: number, beatIndex: number) {
    const audioContext = audioContextRef.current;

    if (!audioContext) {
      return;
    }

    const { accentEnabled, volume } = settingsRef.current;
    const isAccentedBeat = accentEnabled && beatIndex === 0;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = isAccentedBeat ? 1320 : 940;

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(time);
    oscillator.stop(time + 0.06);
  }

  function scheduler() {
    const audioContext = audioContextRef.current;
    const currentSettings = settingsRef.current;

    if (!audioContext) {
      return;
    }

    while (nextNoteTimeRef.current < audioContext.currentTime + SCHEDULE_AHEAD_SECONDS) {
      scheduleClick(nextNoteTimeRef.current, beatIndexRef.current);
      nextNoteTimeRef.current += tickDurationSeconds(currentSettings);
      beatIndexRef.current = (beatIndexRef.current + 1) % beatsPerMeasure(currentSettings.timeSignature);
    }
  }

  async function start() {
    if (settingsRef.current.isRunning) {
      return;
    }

    const context = ensureAudioContext();
    await context.resume();

    beatIndexRef.current = 0;
    nextNoteTimeRef.current = context.currentTime + 0.02;

    setSettings((current) => ({
      ...current,
      isRunning: true,
    }));

    scheduler();
    timerRef.current = window.setInterval(scheduler, LOOKAHEAD_MS);
  }

  async function stop() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.suspend();
    }

    setSettings((current) => ({
      ...current,
      isRunning: false,
    }));
  }

  function setBpm(bpm: number) {
    setSettings((current) => ({
      ...current,
      bpm: clampBpm(bpm),
    }));
  }

  function setTimeSignature(timeSignature: MetronomeSettings['timeSignature']) {
    setSettings((current) => ({
      ...current,
      timeSignature: normalizeTimeSignature(timeSignature),
    }));
  }

  function setAccentEnabled(accentEnabled: boolean) {
    setSettings((current) => ({
      ...current,
      accentEnabled,
    }));
  }

  function setVolume(volume: number) {
    setSettings((current) => ({
      ...current,
      volume: Math.min(1, Math.max(0, volume)),
    }));
  }

  return {
    settings,
    start,
    stop,
    setBpm,
    setTimeSignature,
    setAccentEnabled,
    setVolume,
  };
}
