import type {
  InstrumentFingeringChart,
  ResolvedInstrumentFingeringChart,
} from '../types/fingering';
import type { NamedNote } from '../types/music';
import { findGroupedFingering } from '../utils/fingering';
import { bbTrumpetFingeringChart } from './bbTrumpetFingeringChart';

const FINGERING_CHARTS_BY_INSTRUMENT_ID: Record<string, InstrumentFingeringChart> = {
  'bb-trumpet': bbTrumpetFingeringChart,
};

export function lookupInstrumentFingeringChart(
  instrumentId: string,
  note: NamedNote,
): ResolvedInstrumentFingeringChart | null {
  const chart = FINGERING_CHARTS_BY_INSTRUMENT_ID[instrumentId];

  if (!chart) {
    return null;
  }

  const groupedFingering = findGroupedFingering(chart.groupedFingerings, note);

  if (!groupedFingering) {
    return null;
  }

  return {
    svgMarkup: chart.svgMarkup,
    renderer: chart.renderer,
    keyPresses: groupedFingering.keyPresses,
  };
}
