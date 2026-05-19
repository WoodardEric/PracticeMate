import type { NamedNote } from '../types/music';

export interface VexNoteSpec {
  key: string;
  accidental: '#' | 'b' | null;
  label: string;
}

export function toVexNoteSpec(note: NamedNote): VexNoteSpec {
  return {
    key: `${note.letter.toLowerCase()}/${note.octave}`,
    accidental: note.accidental,
    label: note.display,
  };
}

