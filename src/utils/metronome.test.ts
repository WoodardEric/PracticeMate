import {
  clampTimeSignatureTop,
  normalizeTimeSignature,
  parseTimeSignature,
  stepTimeSignatureBottom,
} from './metronome';

describe('metronome utils', () => {
  it('clamps the time signature top to the supported range', () => {
    expect(clampTimeSignatureTop(1)).toBe(2);
    expect(clampTimeSignatureTop(17)).toBe(16);
  });

  it('snaps the time signature bottom to the next supported power of two', () => {
    expect(stepTimeSignatureBottom(5, 4)).toBe(8);
    expect(stepTimeSignatureBottom(7, 8)).toBe(4);
    expect(stepTimeSignatureBottom(15, 8)).toBe(16);
  });

  it('normalizes parsed time signatures before use', () => {
    expect(parseTimeSignature('18/3')).toEqual({ top: 16, bottom: 4 });
    expect(normalizeTimeSignature('18/3')).toBe('16/4');
  });
});
