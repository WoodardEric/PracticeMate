import type { TimeSignature } from '../types/music';

export const MIN_TIME_SIGNATURE_TOP = 2;
export const MAX_TIME_SIGNATURE_TOP = 16;
export const TIME_SIGNATURE_BOTTOM_OPTIONS = [2, 4, 8, 16] as const;
export const DEFAULT_TIME_SIGNATURE: TimeSignature = '4/4';

function normalizeWholeNumber(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.round(value);
}

export function clampTimeSignatureTop(value: number, fallback = 4) {
  const nextValue = normalizeWholeNumber(value, fallback);
  return Math.min(MAX_TIME_SIGNATURE_TOP, Math.max(MIN_TIME_SIGNATURE_TOP, nextValue));
}

export function clampTimeSignatureBottom(value: number, fallback = 4) {
  const nextValue = normalizeWholeNumber(value, fallback);

  for (const option of TIME_SIGNATURE_BOTTOM_OPTIONS) {
    if (nextValue <= option) {
      return option;
    }
  }

  return TIME_SIGNATURE_BOTTOM_OPTIONS[TIME_SIGNATURE_BOTTOM_OPTIONS.length - 1];
}

export function parseTimeSignature(timeSignature: string) {
  const [rawTop, rawBottom] = timeSignature.split('/');

  return {
    top: clampTimeSignatureTop(Number(rawTop)),
    bottom: clampTimeSignatureBottom(Number(rawBottom)),
  };
}

export function formatTimeSignature(top: number, bottom: number): TimeSignature {
  return `${clampTimeSignatureTop(top)}/${clampTimeSignatureBottom(bottom)}`;
}

export function normalizeTimeSignature(timeSignature: string): TimeSignature {
  const { top, bottom } = parseTimeSignature(timeSignature);
  return formatTimeSignature(top, bottom);
}

export function stepTimeSignatureBottom(input: number, current: number) {
  const currentIndex = TIME_SIGNATURE_BOTTOM_OPTIONS.indexOf(
    clampTimeSignatureBottom(current),
  );
  const nextValue = normalizeWholeNumber(input, current);

  if (TIME_SIGNATURE_BOTTOM_OPTIONS.includes(nextValue as (typeof TIME_SIGNATURE_BOTTOM_OPTIONS)[number])) {
    return nextValue;
  }

  if (nextValue > current) {
    return TIME_SIGNATURE_BOTTOM_OPTIONS[Math.min(currentIndex + 1, TIME_SIGNATURE_BOTTOM_OPTIONS.length - 1)];
  }

  if (nextValue < current) {
    return TIME_SIGNATURE_BOTTOM_OPTIONS[Math.max(currentIndex - 1, 0)];
  }

  return TIME_SIGNATURE_BOTTOM_OPTIONS[currentIndex];
}
