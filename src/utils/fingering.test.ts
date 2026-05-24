import { midiToNote } from './note';
import { toCanonicalFingeringNoteName } from './fingering';

describe('toCanonicalFingeringNoteName', () => {
  it('normalizes enharmonic notes to the flat spelling used by fingering charts', () => {
    const writtenNote = midiToNote(58, 'sharp');

    expect(writtenNote.display).toBe('A\u266F3');
    expect(toCanonicalFingeringNoteName(writtenNote)).toBe('Bb3');
  });
});
