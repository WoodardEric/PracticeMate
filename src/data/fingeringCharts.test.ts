import { midiToNote } from '../utils/note';
import { lookupInstrumentFingeringChart } from './fingeringCharts';

function getActivePathIds(noteMidi: number, accidentalPreference: 'flat' | 'sharp' = 'flat') {
  const note = midiToNote(noteMidi, accidentalPreference);
  const chart = lookupInstrumentFingeringChart('bb-trumpet', note);

  return chart?.keyPresses.map((keyPress) => keyPress.pathId) ?? null;
}

describe('lookupInstrumentFingeringChart', () => {
  it('returns the same trumpet fingering for enharmonic spellings', () => {
    expect(getActivePathIds(58, 'flat')).toEqual(['valve-1']);
    expect(getActivePathIds(58, 'sharp')).toEqual(['valve-1']);
  });

  it('returns the expected trumpet valve combinations for representative notes', () => {
    expect(getActivePathIds(60)).toEqual([]);
    expect(getActivePathIds(62)).toEqual(['valve-1', 'valve-3']);
    expect(getActivePathIds(66)).toEqual(['valve-2']);
  });

  it('returns no fingering outside the supported Bb trumpet prototype range', () => {
    expect(getActivePathIds(53)).toBeNull();
    expect(getActivePathIds(85)).toBeNull();
  });
});
