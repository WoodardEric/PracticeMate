import { useEffect, useRef } from 'react';
import type { Clef, NamedNote } from '../types/music';
import { toVexNoteSpec } from '../utils/notation';
import { loadVexflow } from './vexflowLoader';

const MIN_RENDER_WIDTH = 296;
const RENDER_HORIZONTAL_PADDING = 16;
const RENDER_HEIGHT = 272;
const RENDER_SCALE = 1.45;
const MIN_STAVE_WIDTH = 188;
const STAVE_HORIZONTAL_INSET = 28;

const STAFF_LINE_STYLE = {
  lineWidth: 1.2,
  strokeStyle: 'rgba(16, 33, 52, 0.24)',
};

const STAFF_MODIFIER_STYLE = {
  fillStyle: 'rgba(16, 33, 52, 0.34)',
  strokeStyle: 'rgba(16, 33, 52, 0.34)',
};

const NOTE_STYLE = {
  fillStyle: '#102134',
  lineWidth: 1.8,
  strokeStyle: '#102134',
};

const LEDGER_LINE_STYLE = {
  lineWidth: 2.4,
  strokeStyle: '#102134',
};

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
      const { Accidental, BarlineType, Metrics, Renderer, Stave, StaveNote, TickContext } =
        await loadVexflow();

      if (!active || !shellRef.current || !renderRef.current) {
        return;
      }

      const renderStaff = () => {
        if (!shellRef.current || !renderRef.current) {
          return;
        }

        renderRef.current.innerHTML = '';

        const shellWidth = Math.floor(shellRef.current.clientWidth);
        const width = Math.max(MIN_RENDER_WIDTH, shellWidth - RENDER_HORIZONTAL_PADDING);
        const height = RENDER_HEIGHT;
        const scale = RENDER_SCALE;
        const logicalWidth = width / scale;
        const logicalHeight = height / scale;
        const renderer = new Renderer(renderRef.current, Renderer.Backends.SVG);
        renderer.resize(width, height);

        const context = renderer.getContext();
        context.scale(scale, scale);

        const staveWidth = Math.max(MIN_STAVE_WIDTH, logicalWidth - STAVE_HORIZONTAL_INSET);
        const staveX = Math.floor((logicalWidth - staveWidth) / 2);
        const noteSpec = toVexNoteSpec(note);
        const staveNote = new StaveNote({
          clef,
          keys: [noteSpec.key],
          duration: 'q',
        });
        staveNote.setStyle(NOTE_STYLE);
        staveNote.setStemStyle(NOTE_STYLE);
        staveNote.setLedgerLineStyle(LEDGER_LINE_STYLE);
        staveNote.setKeyStyle(0, NOTE_STYLE);

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
        draftStave.setBegBarType(BarlineType.NONE);
        draftStave.setEndBarType(BarlineType.NONE);
        draftStave.addClef(clef);
        const staffHeight = draftStave.getBoundingBox().getH();
        const staveY = Math.round(logicalHeight / 2 - staffHeight / 2);
        const stave = new Stave(staveX, staveY, staveWidth);
        stave.setStyle(STAFF_LINE_STYLE);
        stave.setConfigForLines(
          Array.from({ length: stave.getNumLines() }, () => ({
            visible: true,
          })),
        );
        stave.setBegBarType(BarlineType.NONE);
        stave.setEndBarType(BarlineType.NONE);
        stave.addClef(clef);
        stave
          .getModifiers(undefined, 'Clef')
          .forEach((modifier) => modifier.setStyle(STAFF_MODIFIER_STYLE));
        stave.setContext(context).draw();

        positionNote(stave);
        staveNote.setContext(context).drawWithStyle();
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
