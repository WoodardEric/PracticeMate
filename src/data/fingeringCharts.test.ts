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
});
