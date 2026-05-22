import {
  BAR_SMOOTHING_ALPHA,
  nextSmoothedScaleCents,
  stabilizeScaleDisplayCents,
} from './tunerScale';

describe('nextSmoothedScaleCents', () => {
  it('seeds the smoothed value from the raw cents when no previous value exists', () => {
    expect(
      nextSmoothedScaleCents({
        previousSmoothedCents: null,
        rawCents: 12.4,
        noteChanged: false,
      }),
    ).toBe(12.4);
  });

  it('applies exponential smoothing for sustained offsets', () => {
    expect(
      nextSmoothedScaleCents({
        previousSmoothedCents: 0,
        rawCents: 10,
        noteChanged: false,
      }),
    ).toBeCloseTo(10 * BAR_SMOOTHING_ALPHA, 6);
  });

  it('does not flip sides immediately on a large opposing frame', () => {
    const nextValue = nextSmoothedScaleCents({
      previousSmoothedCents: 5,
      rawCents: -5,
      noteChanged: false,
    });

    expect(nextValue).toBeGreaterThan(0);
    expect(stabilizeScaleDisplayCents(nextValue)).toBe(3);
  });

  it('reseeds immediately when the detected note changes', () => {
    expect(
      nextSmoothedScaleCents({
        previousSmoothedCents: 8,
        rawCents: -2.6,
        noteChanged: true,
      }),
    ).toBe(-2.6);
  });

  it('resets cleanly when the raw cents value disappears', () => {
    expect(
      nextSmoothedScaleCents({
        previousSmoothedCents: 4.2,
        rawCents: null,
        noteChanged: false,
      }),
    ).toBeNull();
  });
});

describe('stabilizeScaleDisplayCents', () => {
  it('locks sub-cent drift to dead center', () => {
    expect(stabilizeScaleDisplayCents(0.5)).toBe(0);
    expect(stabilizeScaleDisplayCents(-1)).toBe(0);
  });

  it('snaps the bar to 0.5-cent increments after smoothing', () => {
    expect(stabilizeScaleDisplayCents(1.24)).toBe(1);
    expect(stabilizeScaleDisplayCents(1.26)).toBe(1.5);
    expect(stabilizeScaleDisplayCents(-3.74)).toBe(-3.5);
  });
});
