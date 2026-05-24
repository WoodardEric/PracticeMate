import valveChartSvgMarkup from '../assets/charts/valve.svg?raw';
import type { FingeringKeyPress, InstrumentFingeringChart, GroupedFingering } from '../types/fingering';
import { midiToNote } from '../utils/note';

type ThreeValvePatternId = '123' | '13' | '23' | '12' | '1' | '2' | 'open';

interface ThreeValveChartSegment {
  startMidi: number;
  patternIds: ThreeValvePatternId[];
}

const PATTERN_KEY_PRESSES: Record<ThreeValvePatternId, FingeringKeyPress[]> = {
  '123': [{ pathId: 'valve-1' }, { pathId: 'valve-2' }, { pathId: 'valve-3' }],
  '13': [{ pathId: 'valve-1' }, { pathId: 'valve-3' }],
  '23': [{ pathId: 'valve-2' }, { pathId: 'valve-3' }],
  '12': [{ pathId: 'valve-1' }, { pathId: 'valve-2' }],
  '1': [{ pathId: 'valve-1' }],
  '2': [{ pathId: 'valve-2' }],
  open: [],
};

function buildGroupedFingerings(segments: ThreeValveChartSegment[]): GroupedFingering[] {
  const noteNamesByPatternId = new Map<ThreeValvePatternId, string[]>();

  segments.forEach(({ startMidi, patternIds }) => {
    patternIds.forEach((patternId, offset) => {
      const note = midiToNote(startMidi + offset, 'flat');
      const noteName = `${note.name}${note.octave}`;
      const noteNames = noteNamesByPatternId.get(patternId) ?? [];

      noteNames.push(noteName);
      noteNamesByPatternId.set(patternId, noteNames);
    });
  });

  return Object.entries(PATTERN_KEY_PRESSES).map(([patternId, keyPresses]) => ({
    noteNames: noteNamesByPatternId.get(patternId as ThreeValvePatternId) ?? [],
    keyPresses,
  }));
}

export function buildThreeValveBrassChart(
  segments: ThreeValveChartSegment[],
): InstrumentFingeringChart {
  return {
    svgMarkup: valveChartSvgMarkup,
    renderer: 'filled-paths',
    groupedFingerings: buildGroupedFingerings(segments),
  };
}
