import { midiToNote } from '../utils/note';
import { lookupInstrumentFingeringChart } from './fingeringCharts';

function getActivePathIds(
  instrumentId: string,
  noteMidi: number,
  accidentalPreference: 'flat' | 'sharp' = 'flat',
) {
  const note = midiToNote(noteMidi, accidentalPreference);
  const chart = lookupInstrumentFingeringChart(instrumentId, note);

  return chart?.keyPresses.map((keyPress) => keyPress.pathId) ?? null;
}

describe('lookupInstrumentFingeringChart', () => {
  it('returns the same trumpet fingering for enharmonic spellings', () => {
    expect(getActivePathIds('bb-trumpet', 58, 'flat')).toEqual(['valve-1']);
    expect(getActivePathIds('bb-trumpet', 58, 'sharp')).toEqual(['valve-1']);
  });

  it('returns the expected trumpet valve combinations for representative notes', () => {
    expect(getActivePathIds('bb-trumpet', 60)).toEqual([]);
    expect(getActivePathIds('bb-trumpet', 62)).toEqual(['valve-1', 'valve-3']);
    expect(getActivePathIds('bb-trumpet', 66)).toEqual(['valve-2']);
  });

  it('returns no fingering outside the supported Bb trumpet prototype range', () => {
    expect(getActivePathIds('bb-trumpet', 53)).toBeNull();
    expect(getActivePathIds('bb-trumpet', 85)).toBeNull();
  });

  it('returns the expected euphonium valve combinations across the supported range', () => {
    expect(getActivePathIds('euphonium', 41)).toEqual(['valve-1', 'valve-3']);
    expect(getActivePathIds('euphonium', 53)).toEqual([]);
    expect(getActivePathIds('euphonium', 68)).toEqual(['valve-1']);
  });

  it('returns no fingering outside the supported euphonium range', () => {
    expect(getActivePathIds('euphonium', 40)).toBeNull();
    expect(getActivePathIds('euphonium', 71)).toBeNull();
  });

  it('returns the expected tuba valve combinations across the supported range', () => {
    expect(getActivePathIds('tuba', 29)).toEqual(['valve-1', 'valve-3']);
    expect(getActivePathIds('tuba', 46)).toEqual([]);
    expect(getActivePathIds('tuba', 47)).toEqual(['valve-1', 'valve-2']);
    expect(getActivePathIds('tuba', 48)).toEqual(['valve-1']);
    expect(getActivePathIds('tuba', 49)).toEqual(['valve-2']);
    expect(getActivePathIds('tuba', 50)).toEqual([]);
    expect(getActivePathIds('tuba', 63)).toEqual(['valve-1']);
  });

  it('returns no fingering outside the supported tuba range', () => {
    expect(getActivePathIds('tuba', 28)).toBeNull();
    expect(getActivePathIds('tuba', 66)).toBeNull();
  });

  it('reuses the same valve combinations for euphonium and tuba note classes in different octaves', () => {
    expect(getActivePathIds('euphonium', 59)).toEqual(['valve-1', 'valve-2']);
    expect(getActivePathIds('tuba', 47)).toEqual(['valve-1', 'valve-2']);
    expect(getActivePathIds('euphonium', 60)).toEqual(['valve-1']);
    expect(getActivePathIds('tuba', 48)).toEqual(['valve-1']);
    expect(getActivePathIds('euphonium', 61)).toEqual(['valve-2']);
    expect(getActivePathIds('tuba', 49)).toEqual(['valve-2']);
    expect(getActivePathIds('euphonium', 62)).toEqual([]);
    expect(getActivePathIds('tuba', 50)).toEqual([]);
  });

  it('returns the expected flute key combinations across the supported range', () => {
    expect(getActivePathIds('flute', 60)).toEqual([
      'thumb-B',
      'LH-1',
      'LH-2',
      'LH-3',
      'RH-1',
      'RH-2',
      'RH-3',
      'low-C',
      'low-B',
    ]);
    expect(getActivePathIds('flute', 62)).toEqual([
      'thumb-B',
      'LH-1',
      'LH-2',
      'LH-3',
      'RH-1',
      'RH-2',
      'RH-3',
    ]);
    expect(getActivePathIds('flute', 64)).toEqual([
      'thumb-B',
      'LH-1',
      'LH-2',
      'LH-3',
      'RH-1',
      'RH-2',
      'D-sharp',
    ]);
    expect(getActivePathIds('flute', 69)).toEqual(['thumb-B', 'LH-1', 'LH-2', 'D-sharp']);
    expect(getActivePathIds('flute', 70)).toEqual(['thumb-B', 'LH-1', 'RH-1', 'D-sharp']);
    expect(getActivePathIds('flute', 72)).toEqual(['LH-1', 'D-sharp']);
    expect(getActivePathIds('flute', 77)).toEqual([
      'thumb-B',
      'LH-1',
      'LH-2',
      'LH-3',
      'RH-1',
      'D-sharp',
    ]);
    expect(getActivePathIds('flute', 81)).toEqual(['thumb-B', 'LH-1', 'LH-2', 'D-sharp']);
    expect(getActivePathIds('flute', 82)).toEqual(['thumb-B', 'LH-1', 'RH-1', 'D-sharp']);
    expect(getActivePathIds('flute', 84)).toEqual(['LH-1', 'D-sharp']);
    expect(getActivePathIds('flute', 89)).toEqual([
      'thumb-B',
      'LH-1',
      'LH-3',
      'RH-1',
      'D-sharp',
    ]);
    expect(getActivePathIds('flute', 95)).toEqual([
      'thumb-B',
      'LH-1',
      'LH-3',
      'G-sharp',
      'trill-2',
    ]);
    expect(getActivePathIds('flute', 96)).toEqual([
      'thumb-B-flat',
      'LH-1',
      'LH-2',
      'LH-3',
      'G-sharp',
      'RH-1',
    ]);
  });

  it('returns the same flute fingering for enharmonic spellings after flat normalization', () => {
    expect(getActivePathIds('flute', 70, 'flat')).toEqual(['thumb-B', 'LH-1', 'RH-1', 'D-sharp']);
    expect(getActivePathIds('flute', 70, 'sharp')).toEqual(['thumb-B', 'LH-1', 'RH-1', 'D-sharp']);
  });

  it('returns no fingering outside the supported flute range', () => {
    expect(getActivePathIds('flute', 59)).toBeNull();
    expect(getActivePathIds('flute', 97)).toBeNull();
  });
});
