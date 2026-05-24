export type FingeringRendererId = 'filled-paths';

export type FingeringKeyState = 'full' | 'half';

export interface FingeringKeyPress {
  pathId: string;
  state?: FingeringKeyState;
}

export interface GroupedFingering {
  noteNames: string[];
  keyPresses: FingeringKeyPress[];
}

export interface InstrumentFingeringChart {
  svgMarkup: string;
  renderer: FingeringRendererId;
  groupedFingerings: GroupedFingering[];
}

export interface ResolvedInstrumentFingeringChart {
  svgMarkup: string;
  renderer: FingeringRendererId;
  keyPresses: FingeringKeyPress[];
}
