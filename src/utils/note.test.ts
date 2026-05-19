import { INSTRUMENTS } from '../data/instruments';
import { frequencyToConcertNote, midiToNote, transposeConcertNote } from './note';

describe('frequencyToConcertNote', () => {
  it('maps A4 correctly with zero cents offset', () => {
    const note = frequencyToConcertNote(440);

    expect(note?.display).toBe('A4');
    expect(note?.centsOff).toBeCloseTo(0, 6);
  });

  it('rounds to the closest note near semitone boundaries', () => {
    const note = frequencyToConcertNote(455);

    expect(note?.display).toBe('Bb4');
    expect(note?.centsOff).toBeLessThan(0);
  });
});

describe('transposeConcertNote', () => {
  const concertBb3 = midiToNote(58);

  it('transposes Bb clarinet to written C4', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'bb-clarinet')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('C4');
  });

  it('transposes alto sax to written G4', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'eb-alto-sax')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('G4');
  });

  it('transposes horn in F to written F4', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'f-horn')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('F4');
  });

  it('keeps trombone in concert pitch', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'trombone')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('Bb3');
  });

  it('keeps viola in concert pitch', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'viola')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('Bb3');
  });

  it('writes double bass one octave above sounding pitch', () => {
    const instrument = INSTRUMENTS.find((item) => item.id === 'double-bass')!;
    expect(transposeConcertNote(concertBb3, instrument).display).toBe('Bb4');
  });
});

