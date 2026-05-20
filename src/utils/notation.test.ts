import { midiToNote } from './note';
import { toVexNoteSpec } from './notation';

describe('toVexNoteSpec', () => {
  it('formats a flat note for VexFlow', () => {
    const spec = toVexNoteSpec(midiToNote(58));

    expect(spec).toEqual({
      key: 'b/3',
      accidental: 'b',
      label: 'B\u266D3',
    });
  });

  it('formats an alto clef-range note with no accidental', () => {
    const spec = toVexNoteSpec(midiToNote(60));

    expect(spec).toEqual({
      key: 'c/4',
      accidental: null,
      label: 'C4',
    });
  });

  it('formats a sharp-compatible pitch as its flat spelling', () => {
    const spec = toVexNoteSpec(midiToNote(66));

    expect(spec).toEqual({
      key: 'g/4',
      accidental: 'b',
      label: 'G\u266D4',
    });
  });

  it('formats a sharp-compatible pitch as its sharp spelling', () => {
    const spec = toVexNoteSpec(midiToNote(66, 'sharp'));

    expect(spec).toEqual({
      key: 'f/4',
      accidental: '#',
      label: 'F\u266F4',
    });
  });
});
