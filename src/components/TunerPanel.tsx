import type { AccidentalPreference, Clef, DetectedPitch, InstrumentProfile } from '../types/music';
import { StaffNote } from './StaffNote';

const FLAT_SYMBOL = '\u266D';
const SHARP_SYMBOL = '\u266F';

interface TunerPanelProps {
  instruments: InstrumentProfile[];
  selectedInstrumentId: string;
  onInstrumentChange: (instrumentId: string) => void;
  clef: Clef;
  pitchState: DetectedPitch;
  accidentalPreference: AccidentalPreference;
  onAccidentalPreferenceChange: (preference: AccidentalPreference) => void;
  onStart: () => void;
  onStop: () => void;
}

function formatFrequency(frequencyHz: number | null): string {
  return frequencyHz ? `${frequencyHz.toFixed(1)} Hz` : 'Waiting';
}

function formatConfidence(signalConfidence: number): string {
  return `${Math.round(signalConfidence * 100)}%`;
}

function centsClass(centsOff: number | null) {
  if (centsOff === null) {
    return 'neutral';
  }

  if (Math.abs(centsOff) <= 5) {
    return 'in-tune';
  }

  return centsOff > 0 ? 'sharp' : 'flat';
}

export function TunerPanel({
  instruments,
  selectedInstrumentId,
  onInstrumentChange,
  clef,
  pitchState,
  accidentalPreference,
  onAccidentalPreferenceChange,
  onStart,
  onStop,
}: TunerPanelProps) {
  const noteLabel = pitchState.writtenNote?.display ?? '--';
  const concertLabel = pitchState.concertNote?.display ?? 'No stable pitch';
  const centsLabel =
    pitchState.centsOff === null
      ? '--'
      : `${pitchState.centsOff > 0 ? '+' : ''}${pitchState.centsOff.toFixed(1)} cents`;

  return (
    <section className="panel tuner-panel">
      <div className="panel-header">
        <div className="tuner-header-copy">
          <p className="eyebrow">Tuner</p>
          <select
            className="tuner-instrument-select"
            value={selectedInstrumentId}
            onChange={(event) => onInstrumentChange(event.target.value)}
            aria-label="Select instrument"
          >
            {instruments.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={`button ${pitchState.listening ? 'button-secondary' : 'button-primary'}`}
          onClick={pitchState.listening ? onStop : onStart}
        >
          {pitchState.listening ? 'Stop tuner' : 'Start tuner'}
        </button>
      </div>

      <div className="tuner-grid">
        <div className="note-card">
          <p className="label">Written note</p>
          <p className="hero-note">{noteLabel}</p>
          <p className="subdued">Shown in {clef} clef for the selected instrument.</p>
        </div>

        <div className="readout-card">
          <div className="readout-row">
            <span>Concert pitch</span>
            <strong>{concertLabel}</strong>
          </div>
          <div className="readout-row">
            <span>Detected frequency</span>
            <strong>{formatFrequency(pitchState.frequencyHz)}</strong>
          </div>
          <div className="readout-row">
            <span>Pitch center</span>
            <strong className={centsClass(pitchState.centsOff)}>{centsLabel}</strong>
          </div>
          <div className="readout-row">
            <span>Signal confidence</span>
            <strong>{formatConfidence(pitchState.signalConfidence)}</strong>
          </div>
        </div>
      </div>

      <div className="staff-panel">
        <StaffNote note={pitchState.writtenNote} clef={clef} />
        <div className="enharmonic-toggle-row">
          <span className="enharmonic-toggle-label">Enharmonic</span>
          <div
            className="enharmonic-toggle"
            role="group"
            aria-label="Enharmonic spelling"
          >
            <button
              type="button"
              className={`enharmonic-option ${accidentalPreference === 'flat' ? 'is-active' : ''}`}
              aria-pressed={accidentalPreference === 'flat'}
              onClick={() => onAccidentalPreferenceChange('flat')}
            >
              {FLAT_SYMBOL}
            </button>
            <button
              type="button"
              className={`enharmonic-option ${accidentalPreference === 'sharp' ? 'is-active' : ''}`}
              aria-pressed={accidentalPreference === 'sharp'}
              onClick={() => onAccidentalPreferenceChange('sharp')}
            >
              {SHARP_SYMBOL}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
