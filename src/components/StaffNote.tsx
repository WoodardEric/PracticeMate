import { useEffect, useRef } from 'react';
import type { Clef, NamedNote } from '../types/music';
import { toVexNoteSpec } from '../utils/notation';

interface StaffNoteProps {
  note: NamedNote | null;
  clef: Clef;
}

export function StaffNote({ note, clef }: StaffNoteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !note) {
      return;
    }

    let active = true;

    void (async () => {
      const { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } = await import('vexflow');

      if (!active || !containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = '';

      const width = 280;
      const height = 170;
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
      renderer.resize(width, height);

      const context = renderer.getContext();
      const stave = new Stave(12, 28, width - 24);
      stave.addClef(clef);
      stave.setContext(context).draw();

      const noteSpec = toVexNoteSpec(note);
      const staveNote = new StaveNote({
        clef,
        keys: [noteSpec.key],
        duration: 'q',
      });

      if (noteSpec.accidental) {
        staveNote.addModifier(new Accidental(noteSpec.accidental), 0);
      }

      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.addTickables([staveNote]);

      new Formatter().joinVoices([voice]).format([voice], 110);
      voice.draw(context, stave);
    })();

    return () => {
      active = false;
    };
  }, [clef, note]);

  if (!note) {
    return (
      <div className="staff-shell staff-empty">
        <p>Start the tuner and play a steady pitch to see the note on the staff.</p>
      </div>
    );
  }

  return (
    <div className="staff-shell">
      <div ref={containerRef} aria-label={`${note.display} on ${clef} clef staff`} />
    </div>
  );
}
