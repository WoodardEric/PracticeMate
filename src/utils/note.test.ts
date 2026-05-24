import { INSTRUMENTS } from '../data/instruments';
import {
  clampBpm,
  derivePitch,
  frequencyToConcertNote,
  midiToNote,
  midiToFrequency,
  transposeConcertNote,
  transposeWrittenNoteToConcert,
  writtenMidiToConcertMidi,
} from './note';

describe('frequencyToConcertNote', () => {
  it('maps A4 correctly with zero cents offset', () => {
    const note = frequencyToConcertNote(440);

    expect(note?.display).toBe('A4');
    expect(note?.centsOff).toBeCloseTo(0, 6);
  });

  it('rounds to the closest note near semitone boundaries', () => {
    const note = frequencyToConcertNote(455);

    expect(note?.display).toBe('B\u266D4');
    expect(note?.centsOff).toBeLessThan(0);
  });

  it('can prefer sharp spellings for enharmonic notes', () => {
    const note = frequencyToConcertNote(455, 'sharp');

    expect(note?.display).toBe('A\u266F4');
  });
});

describe('transposeConcertNote', () => {
  const concertBb3 = midiToNote(58);

  it('transposes Bb clarinet to written C4', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'bb-clarinet')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('C4');
  });

  it('transposes alto sax to written G4', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'alto-sax')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('G4');
  });

  it('transposes horn in F to written F4', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'f-horn')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('F4');
  });

  it('keeps trombone in concert pitch', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'trombone')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('B\u266D3');
  });

  it('keeps viola in concert pitch', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'viola')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('B\u266D3');
  });

  it('writes double bass one octave above sounding pitch', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'double-bass')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('B\u266D4');
  });

  it('can respell transposed notes with sharps', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'viola')!;
    expect(transposeConcertNote(concertBb3, instrument, 'sharp').display).toBe('A\u266F3');
  });
});

describe('writtenMidiToConcertMidi', () => {
  it('maps written Bb clarinet C4 back to concert Bb3', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'bb-clarinet')!;

    expect(writtenMidiToConcertMidi(60, instrument)).toBe(58);
  });

  it('keeps non-transposing instruments at the same MIDI note', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'viola')!;

    expect(writtenMidiToConcertMidi(60, instrument)).toBe(60);
  });

  it('maps double bass written notes back down one octave', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'double-bass')!;

    expect(writtenMidiToConcertMidi(58, instrument)).toBe(46);
  });
});

describe('transposeWrittenNoteToConcert', () => {
  it('maps written Bb clarinet C4 back to concert Bb3', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'bb-clarinet')!;

    expect(transposeWrittenNoteToConcert(midiToNote(60), instrument).display).toBe('B\u266D3');
  });
});

describe('derivePitch', () => {
  it('derives concert note, written note, and cents from a detected frequency', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'bb-clarinet')!;
    const derivedPitch = derivePitch(233.243496812918, instrument);

    expect(derivedPitch.concertNote?.display).toBe('B\u266D3');
    expect(derivedPitch.writtenNote?.display).toBe('C4');
    expect(derivedPitch.centsOff).toBeCloseTo(1.2, 2);
  });

  it('returns empty derived values when there is no stable frequency', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'viola')!;
    expect(derivePitch(null, instrument)).toEqual({
      concertNote: null,
      writtenNote: null,
      centsOff: null,
    });
  });

  it('round-trips a stepped written note through synthetic concert frequency', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'bb-trumpet')!;
    const writtenMidi = 61;
    const concertFrequency = midiToFrequency(writtenMidiToConcertMidi(writtenMidi, instrument));
    const derivedPitch = derivePitch(concertFrequency, instrument);

    expect(derivedPitch.writtenNote?.display).toBe('D\u266D4');
    expect(derivedPitch.concertNote?.display).toBe('B3');
    expect(derivedPitch.centsOff).toBeCloseTo(0, 6);
  });
});

describe('clampBpm', () => {
  it('limits BPM to the supported metronome range', () => {
    expect(clampBpm(12)).toBe(30);
    expect(clampBpm(301)).toBe(300);
  });

  it('rounds valid BPM values inside the supported range', () => {
    expect(clampBpm(299.6)).toBe(300);
    expect(clampBpm(80.4)).toBe(80);
  });
});
