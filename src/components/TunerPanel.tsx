import type { Clef, DetectedPitch } from '../types/music';
import { StaffNote } from './StaffNote';

interface TunerPanelProps {
  instrumentLabel: string;
  clef: Clef;
  pitchState: DetectedPitch;
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
  instrumentLabel,
  clef,
  pitchState,
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
        <div>
          <p className="eyebrow">Tuner</p>
          <h2>{instrumentLabel}</h2>
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

      <StaffNote note={pitchState.writtenNote} clef={clef} />
    </section>
  );
}

