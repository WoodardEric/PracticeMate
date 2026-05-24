import valveChartSvgMarkup from '../assets/charts/valve.svg?raw';
import type { FingeringKeyPress, InstrumentFingeringChart } from '../types/fingering';

function createValvePresses(...pathIds: string[]): FingeringKeyPress[] {
  return pathIds.map((pathId) => ({ pathId }));
}

export const bbTrumpetFingeringChart: InstrumentFingeringChart = {
  svgMarkup: valveChartSvgMarkup,
  renderer: 'filled-paths',
  groupedFingerings: [
    {
      noteNames: ['Gb3', 'Db4'],
      keyPresses: createValvePresses('valve-1', 'valve-2', 'valve-3'),
    },
    {
      noteNames: ['G3', 'D4'],
      keyPresses: createValvePresses('valve-1', 'valve-3'),
    },
    {
      noteNames: ['Ab3', 'Eb4', 'Ab4', 'Ab5'],
      keyPresses: createValvePresses('valve-2', 'valve-3'),
    },
    {
      noteNames: ['A3', 'E4', 'A4', 'Db5', 'A5'],
      keyPresses: createValvePresses('valve-1', 'valve-2'),
    },
    {
      noteNames: ['Bb3', 'F4', 'Bb4', 'D5', 'F5', 'Bb5'],
      keyPresses: createValvePresses('valve-1'),
    },
    {
      noteNames: ['B3', 'Gb4', 'B4', 'Eb5', 'Gb5', 'B5'],
      keyPresses: createValvePresses('valve-2'),
    },
    {
      noteNames: ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'],
      keyPresses: [],
    },
  ],
};
