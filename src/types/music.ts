export type Clef = 'treble' | 'bass' | 'alto';

export type PermissionState =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface InstrumentProfile {
  id: string;
  label: string;
  clef: Clef;
  writtenPitchOffsetSemitones: number;
  writtenOctaveShift: number;
  shortLabel?: string;
}

export interface NamedNote {
  midi: number;
  name: string;
  letter: string;
  accidental: '#' | 'b' | null;
  octave: number;
  display: string;
  frequency: number;
}

export interface DetectedPitch {
  permission: PermissionState;
  listening: boolean;
  frequencyHz: number | null;
  concertNote: NamedNote | null;
  writtenNote: NamedNote | null;
  centsOff: number | null;
  signalConfidence: number;
}

export interface MetronomeSettings {
  bpm: number;
  timeSignature: '2/4' | '3/4' | '4/4' | '6/8';
  accentEnabled: boolean;
  volume: number;
  isRunning: boolean;
}

