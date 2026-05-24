import { buildThreeValveBrassChart } from './threeValveBrassFingerings';

export const euphoniumFingeringChart = buildThreeValveBrassChart([
  { startMidi: 41, patternIds: ['13', '23', '12', '1', '2', 'open'] },
  { startMidi: 47, patternIds: ['123', '13', '23', '12', '1', '2', 'open'] },
  { startMidi: 54, patternIds: ['23', '12', '1', '2', 'open'] },
  { startMidi: 59, patternIds: ['12', '1', '2', 'open', '1', '2', 'open'] },
  { startMidi: 66, patternIds: ['23', '12', '1', '2', 'open'] },
]);
