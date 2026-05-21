import { useEffect, useRef } from 'react';
import type { Clef, NamedNote } from '../types/music';
import { toVexNoteSpec } from '../utils/notation';

interface StaffNoteProps {
  note: NamedNote | null;
  clef: Clef;
}

export function StaffNote({ note, clef }: StaffNoteProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const renderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const renderTarget = renderRef.current;

    if (!shell || !renderTarget || !note) {
      return;
    }

    let active = true;
    let resizeObserver: ResizeObserver | null = null;

    void (async () => {
      const { Accidental, Metrics, Renderer, Stave, StaveNote, TickContext } =
        await import('vexflow');

      if (!active || !shellRef.current || !renderRef.current) {
        return;
      }

      const renderStaff = () => {
        if (!shellRef.current || !renderRef.current) {
          return;
        }

        renderRef.current.innerHTML = '';

        const shellWidth = Math.floor(shellRef.current.clientWidth);
        const width = Math.max(280, shellWidth - 16);
        const height = 220;
        const scale = 1.25;
        const logicalWidth = width / scale;
        const logicalHeight = height / scale;
        const renderer = new Renderer(renderRef.current, Renderer.Backends.SVG);
        renderer.resize(width, height);

        const context = renderer.getContext();
        context.scale(scale, scale);

        const staveWidth = Math.max(180, logicalWidth - 40);
        const staveX = Math.floor((logicalWidth - staveWidth) / 2);
        const noteSpec = toVexNoteSpec(note);
        const staveNote = new StaveNote({
          clef,
          keys: [noteSpec.key],
          duration: 'q',
        });

        if (noteSpec.accidental) {
          staveNote.addModifier(new Accidental(noteSpec.accidental), 0);
        }

        const tickContext = new TickContext().addTickable(staveNote).preFormat();
        const positionNote = (stave: InstanceType<typeof Stave>) => {
          const noteStartOffset = stave.getNoteStartX() + Metrics.get('Stave.padding', 0);
          const noteheadHalfWidth = staveNote.getGlyphWidth() / 2;
          const staffCenterX = stave.getX() + stave.getWidth() / 2;
          tickContext.setX(Math.round(staffCenterX - noteStartOffset - noteheadHalfWidth));
          staveNote.setStave(stave);
        };

        const draftStave = new Stave(staveX, 0, staveWidth);
        draftStave.addClef(clef);
        const staffHeight = draftStave.getBoundingBox().getH();
        const staveY = Math.round(logicalHeight / 2 - staffHeight / 2);
        const stave = new Stave(staveX, staveY, staveWidth);
        stave.addClef(clef);
        stave.setContext(context).draw();

        positionNote(stave);
        staveNote.setContext(context).draw();
      };

      renderStaff();

      resizeObserver = new ResizeObserver(() => {
        renderStaff();
      });

      resizeObserver.observe(shellRef.current);
    })();

    return () => {
      active = false;
      resizeObserver?.disconnect();
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
    <div ref={shellRef} className="staff-shell">
      <div
        ref={renderRef}
        className="staff-render"
        aria-label={`${note.display} on ${clef} clef staff`}
      />
    </div>
  );
}
