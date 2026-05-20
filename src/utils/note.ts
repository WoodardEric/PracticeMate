import type { AccidentalPreference, InstrumentProfile, NamedNote } from '../types/music';

const A4_FREQUENCY = 440;
const A4_MIDI = 69;
const FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const SHARP_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_SYMBOL = '\u266D';
const SHARP_SYMBOL = '\u266F';

function formatDisplayName(noteName: string, octave: number) {
  return `${noteName.replace('b', FLAT_SYMBOL).replace('#', SHARP_SYMBOL)}${octave}`;
}

export function midiToFrequency(midi: number): number {
  return A4_FREQUENCY * 2 ** ((midi - A4_MIDI) / 12);
}

export function frequencyToMidi(frequencyHz: number): number | null {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) {
    return null;
  }

  return Math.round(A4_MIDI + 12 * Math.log2(frequencyHz / A4_FREQUENCY));
}

export function midiToNote(midi: number, accidentalPreference: AccidentalPreference = 'flat'): NamedNote {
  const roundedMidi = Math.round(midi);
  const noteNames = accidentalPreference === 'sharp' ? SHARP_NOTE_NAMES : FLAT_NOTE_NAMES;
  const noteName = noteNames[((roundedMidi % 12) + 12) % 12];
  const octave = Math.floor(roundedMidi / 12) - 1;
  const letter = noteName[0];
  const accidental = noteName.length > 1 ? (noteName[1] as '#' | 'b') : null;

  return {
    midi: roundedMidi,
    name: noteName,
    letter,
    accidental,
    octave,
    display: formatDisplayName(noteName, octave),
    frequency: midiToFrequency(roundedMidi),
  };
}

export function frequencyToConcertNote(
  frequencyHz: number,
  accidentalPreference: AccidentalPreference = 'flat',
): (NamedNote & { centsOff: number }) | null {
  const midi = frequencyToMidi(frequencyHz);

  if (midi === null) {
    return null;
  }

  const note = midiToNote(midi, accidentalPreference);
  const centsOff = 1200 * Math.log2(frequencyHz / note.frequency);

  return {
    ...note,
    centsOff,
  };
}

export function transposeConcertNote(
  note: NamedNote,
  instrument: InstrumentProfile,
  accidentalPreference: AccidentalPreference = 'flat',
): NamedNote {
  const transposedMidi =
    note.midi + instrument.writtenPitchOffsetSemitones + instrument.writtenOctaveShift * 12;

  return midiToNote(transposedMidi, accidentalPreference);
}

export function clampBpm(value: number): number {
  if (!Number.isFinite(value)) {
    return 60;
  }

  return Math.min(300, Math.max(30, Math.round(value)));
}
