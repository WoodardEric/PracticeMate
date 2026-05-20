import { useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import type { AccidentalPreference, DetectedPitch, InstrumentProfile } from '../types/music';
import { frequencyToConcertNote, transposeConcertNote } from '../utils/note';

const ANALYSER_SIZE = 2048;
const MIN_CLARITY = 0.92;
const MIN_RMS = 0.008;
const MIN_PITCH_HZ = 45;
const MAX_PITCH_HZ = 1600;

const EMPTY_STATE: DetectedPitch = {
  permission: 'idle',
  listening: false,
  frequencyHz: null,
  concertNote: null,
  writtenNote: null,
  centsOff: null,
  signalConfidence: 0,
};

function getRootAudioContext(): typeof AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.AudioContext ?? ((window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null);
}

export function useTuner(
  instrument: InstrumentProfile,
  accidentalPreference: AccidentalPreference = 'flat',
) {
  const [pitchState, setPitchState] = useState<DetectedPitch>(EMPTY_STATE);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef(PitchDetector.forFloat32Array(ANALYSER_SIZE));
  const inputBufferRef = useRef(new Float32Array(ANALYSER_SIZE));
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  useEffect(() => {
    setPitchState((current) => {
      if (!current.concertNote) {
        return current;
      }

      return {
        ...current,
        concertNote: frequencyToConcertNote(current.frequencyHz ?? current.concertNote.frequency, accidentalPreference),
        writtenNote: transposeConcertNote(current.concertNote, instrument, accidentalPreference),
      };
    });
  }, [accidentalPreference, instrument]);

  const samplePitch = () => {
    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;

    if (!analyser || !audioContext) {
      return;
    }

    analyser.getFloatTimeDomainData(inputBufferRef.current);
    const rms = Math.sqrt(
      inputBufferRef.current.reduce((sum, sample) => sum + sample * sample, 0) /
        inputBufferRef.current.length,
    );

    const [frequencyHz, clarity] = detectorRef.current.findPitch(
      inputBufferRef.current,
      audioContext.sampleRate,
    );

    if (
      rms < MIN_RMS ||
      clarity < MIN_CLARITY ||
      !Number.isFinite(frequencyHz) ||
      frequencyHz < MIN_PITCH_HZ ||
      frequencyHz > MAX_PITCH_HZ
    ) {
      setPitchState((current) => ({
        ...current,
        permission: current.permission === 'requesting' ? 'granted' : current.permission,
        listening: true,
        signalConfidence: clarity,
      }));
    } else {
      const concertNote = frequencyToConcertNote(frequencyHz, accidentalPreference);

      setPitchState({
        permission: 'granted',
        listening: true,
        frequencyHz,
        concertNote,
        writtenNote: concertNote ? transposeConcertNote(concertNote, instrument, accidentalPreference) : null,
        centsOff: concertNote?.centsOff ?? null,
        signalConfidence: clarity,
      });
    }

    animationFrameRef.current = window.requestAnimationFrame(samplePitch);
  };

  async function start() {
    const AudioContextConstructor = getRootAudioContext();

    if (!navigator.mediaDevices?.getUserMedia || !AudioContextConstructor) {
      setPitchState({
        ...EMPTY_STATE,
        permission: 'unsupported',
      });
      return;
    }

    if (pitchState.listening) {
      return;
    }

    setPitchState((current) => ({
      ...current,
      permission: 'requesting',
    }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new AudioContextConstructor();
      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = ANALYSER_SIZE;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setPitchState({
        ...EMPTY_STATE,
        permission: 'granted',
        listening: true,
      });

      samplePitch();
    } catch (error) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError';
      setPitchState({
        ...EMPTY_STATE,
        permission: denied ? 'denied' : 'error',
      });
    }
  }

  async function stop() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setPitchState((current) => ({
      ...EMPTY_STATE,
      permission: current.permission === 'unsupported' ? 'unsupported' : 'idle',
    }));
  }

  return {
    pitchState,
    start,
    stop,
  };
}
