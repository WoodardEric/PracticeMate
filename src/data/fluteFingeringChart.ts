import fluteChartSvgMarkup from '../assets/charts/flute.svg?raw';
import type { FingeringKeyPress, GroupedFingering, InstrumentFingeringChart } from '../types/fingering';

interface FluteNoteFingering {
  noteName: string;
  pathIds: string[];
}

function createKeyPresses(pathIds: string[]): FingeringKeyPress[] {
  return pathIds.map((pathId) => ({ pathId }));
}

function buildGroupedFingerings(noteFingerings: FluteNoteFingering[]): GroupedFingering[] {
  const noteNamesByKeySet = new Map<string, string[]>();
  const keyPressesByKeySet = new Map<string, FingeringKeyPress[]>();

  noteFingerings.forEach(({ noteName, pathIds }) => {
    const keySet = pathIds.join('|');
    const noteNames = noteNamesByKeySet.get(keySet) ?? [];

    noteNames.push(noteName);
    noteNamesByKeySet.set(keySet, noteNames);

    if (!keyPressesByKeySet.has(keySet)) {
      keyPressesByKeySet.set(keySet, createKeyPresses(pathIds));
    }
  });

  return Array.from(noteNamesByKeySet.entries()).map(([keySet, noteNames]) => ({
    noteNames,
    keyPresses: keyPressesByKeySet.get(keySet) ?? createKeyPresses(keySet.split('|').filter(Boolean)),
  }));
}

const FLUTE_NOTE_FINGERINGS: FluteNoteFingering[] = [
  {
    noteName: 'C4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'RH-3', 'low-C', 'low-B'],
  },
  {
    noteName: 'Db4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'RH-3', 'low-D-flat'],
  },
  {
    noteName: 'D4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'RH-3'],
  },
  {
    noteName: 'Eb4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'RH-3', 'D-sharp'],
  },
  {
    noteName: 'E4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'D-sharp'],
  },
  {
    noteName: 'F4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'D-sharp'],
  },
  {
    noteName: 'Gb4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-3', 'D-sharp'],
  },
  {
    noteName: 'G4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'D-sharp'],
  },
  {
    noteName: 'Ab4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'G-sharp', 'D-sharp'],
  },
  {
    noteName: 'A4',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'D-sharp'],
  },
  {
    noteName: 'Bb4',
    pathIds: ['thumb-B', 'LH-1', 'RH-1', 'D-sharp'],
  },
  {
    noteName: 'B4',
    pathIds: ['thumb-B', 'LH-1', 'D-sharp'],
  },
  {
    noteName: 'C5',
    pathIds: ['LH-1', 'D-sharp'],
  },
  {
    noteName: 'Db5',
    pathIds: ['D-sharp'],
  },
  {
    noteName: 'D5',
    pathIds: ['thumb-B', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'RH-3'],
  },
  {
    noteName: 'Eb5',
    pathIds: ['thumb-B', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'RH-3', 'D-sharp'],
  },
  {
    noteName: 'E5',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'RH-2', 'D-sharp'],
  },
  {
    noteName: 'F5',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-1', 'D-sharp'],
  },
  {
    noteName: 'Gb5',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'RH-3', 'D-sharp'],
  },
  {
    noteName: 'G5',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'D-sharp'],
  },
  {
    noteName: 'Ab5',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'G-sharp', 'D-sharp'],
  },
  {
    noteName: 'A5',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'D-sharp'],
  },
  {
    noteName: 'Bb5',
    pathIds: ['thumb-B', 'LH-1', 'RH-1', 'D-sharp'],
  },
  {
    noteName: 'B5',
    pathIds: ['thumb-B', 'LH-1', 'D-sharp'],
  },
  {
    noteName: 'C6',
    pathIds: ['LH-1', 'D-sharp'],
  },
  {
    noteName: 'Db6',
    pathIds: ['D-sharp'],
  },
  {
    noteName: 'D6',
    pathIds: ['thumb-B', 'LH-2', 'LH-3', 'D-sharp'],
  },
  {
    noteName: 'Eb6',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'LH-3', 'G-sharp', 'RH-1', 'RH-2', 'RH-3', 'D-sharp'],
  },
  {
    noteName: 'E6',
    pathIds: ['thumb-B', 'LH-1', 'LH-2', 'RH-1', 'RH-2', 'D-sharp'],
  },
  {
    noteName: 'F6',
    pathIds: ['thumb-B', 'LH-1', 'LH-3', 'RH-1', 'D-sharp'],
  },
  {
    noteName: 'Gb6',
    pathIds: ['thumb-B', 'LH-1', 'LH-3', 'RH-3', 'D-sharp'],
  },
  {
    noteName: 'G6',
    pathIds: ['LH-1', 'LH-2', 'LH-3', 'D-sharp'],
  },
  {
    noteName: 'Ab6',
    pathIds: ['LH-2', 'LH-3', 'G-sharp', 'D-sharp'],
  },
  {
    noteName: 'A6',
    pathIds: ['thumb-B', 'LH-2', 'RH-1', 'D-sharp'],
  },
  {
    noteName: 'Bb6',
    pathIds: ['thumb-B', 'RH-1', 'trill-1'],
  },
  {
    noteName: 'B6',
    pathIds: ['thumb-B', 'LH-1', 'LH-3', 'G-sharp', 'trill-2'],
  },
  {
    noteName: 'C7',
    pathIds: ['thumb-B-flat', 'LH-1', 'LH-2', 'LH-3', 'G-sharp', 'RH-1'],
  },
];

export const fluteFingeringChart: InstrumentFingeringChart = {
  svgMarkup: fluteChartSvgMarkup,
  renderer: 'filled-paths',
  groupedFingerings: buildGroupedFingerings(FLUTE_NOTE_FINGERINGS),
};
