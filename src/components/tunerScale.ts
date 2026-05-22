export const BAR_SMOOTHING_ALPHA = 0.18;
export const SCALE_CENTER_LOCK_THRESHOLD = 1;
export const SCALE_STEP_CENTS = 0.5;

interface NextSmoothedScaleCentsOptions {
  previousSmoothedCents: number | null;
  rawCents: number | null;
  noteChanged: boolean;
  alpha?: number;
}

export function nextSmoothedScaleCents({
  previousSmoothedCents,
  rawCents,
  noteChanged,
  alpha = BAR_SMOOTHING_ALPHA,
}: NextSmoothedScaleCentsOptions): number | null {
  if (rawCents === null) {
    return null;
  }

  if (previousSmoothedCents === null || noteChanged) {
    return rawCents;
  }

  return previousSmoothedCents + alpha * (rawCents - previousSmoothedCents);
}

export function stabilizeScaleDisplayCents(centsOff: number | null): number | null {
  if (centsOff === null) {
    return null;
  }

  if (Math.abs(centsOff) <= SCALE_CENTER_LOCK_THRESHOLD) {
    return 0;
  }

  return Math.round(centsOff / SCALE_STEP_CENTS) * SCALE_STEP_CENTS;
}
