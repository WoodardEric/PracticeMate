import { buildThreeValveBrassChart } from './threeValveBrassFingerings';

export const bbTrumpetFingeringChart = buildThreeValveBrassChart([
  { startMidi: 54, patternIds: ['123', '13', '23', '12', '1', '2', 'open'] },
  { startMidi: 61, patternIds: ['123', '13', '23', '12', '1', '2', 'open'] },
  { startMidi: 68, patternIds: ['23', '12', '1', '2', 'open'] },
  { startMidi: 73, patternIds: ['12', '1', '2', 'open', '1', '2', 'open'] },
  { startMidi: 80, patternIds: ['23', '12', '1', '2', 'open'] },
]);
