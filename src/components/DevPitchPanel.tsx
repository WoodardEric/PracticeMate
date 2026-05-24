import type { InstrumentProfile, NamedNote } from '../types/music';

interface DevPitchPanelProps {
  instruments: InstrumentProfile[];
  selectedInstrumentId: string;
  writtenNote: NamedNote | null;
  concertNote: NamedNote | null;
  writtenMidi: number | null;
  onInstrumentChange: (instrumentId: string) => void;
  onStepDown: () => void;
  onStepUp: () => void;
  onClose: () => void;
}

function formatNoteLabel(note: NamedNote | null): string {
  return note?.display ?? '--';
}

function formatMidiLabel(writtenMidi: number | null): string {
  return writtenMidi === null ? '--' : String(writtenMidi);
}

export function DevPitchPanel({
  instruments,
  selectedInstrumentId,
  writtenNote,
  concertNote,
  writtenMidi,
  onInstrumentChange,
  onStepDown,
  onStepUp,
  onClose,
}: DevPitchPanelProps) {
  return (
    <section className="panel dev-pitch-panel" data-testid="dev-pitch-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Developer</p>
          <h2>Pitch preview</h2>
        </div>
        <button type="button" className="button button-secondary" onClick={onClose}>
          Close preview
        </button>
      </div>

      <div className="dev-pitch-grid">
        <label className="field">
          <span>Preview instrument</span>
          <select
            value={selectedInstrumentId}
            onChange={(event) => onInstrumentChange(event.target.value)}
            aria-label="Select preview instrument"
          >
            {instruments.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.label}
              </option>
            ))}
          </select>
        </label>

        <div className="readout-card">
          <div className="readout-row">
            <span>Written note</span>
            <strong>{formatNoteLabel(writtenNote)}</strong>
          </div>
          <div className="readout-row">
            <span>Concert note</span>
            <strong>{formatNoteLabel(concertNote)}</strong>
          </div>
          <div className="readout-row">
            <span>Written MIDI</span>
            <strong>{formatMidiLabel(writtenMidi)}</strong>
          </div>
        </div>

        <div className="dev-pitch-actions">
          <div className="dev-pitch-stepper" aria-label="Preview pitch stepper">
            <button type="button" className="button button-secondary" onClick={onStepDown}>
              - semitone
            </button>
            <button type="button" className="button button-secondary" onClick={onStepUp}>
              + semitone
            </button>
          </div>
          <p className="dev-pitch-shortcuts">
            `Ctrl+Shift+D` toggle, `Left/Right` step, `Escape` close
          </p>
        </div>
      </div>
    </section>
  );
}
