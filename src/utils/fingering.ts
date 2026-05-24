import type { GroupedFingering } from '../types/fingering';
import type { NamedNote } from '../types/music';
import { midiToNote } from './note';

export function toCanonicalFingeringNoteName(note: NamedNote): string {
  const canonicalNote = midiToNote(note.midi, 'flat');

  return `${canonicalNote.name}${canonicalNote.octave}`;
}

export function findGroupedFingering(
  groupedFingerings: GroupedFingering[],
  note: NamedNote,
): GroupedFingering | null {
  const canonicalNoteName = toCanonicalFingeringNoteName(note);

  return groupedFingerings.find((groupedFingering) =>
    groupedFingering.noteNames.includes(canonicalNoteName),
  ) ?? null;
}
