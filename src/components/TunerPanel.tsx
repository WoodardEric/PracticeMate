import { useEffect, useRef, useState } from 'react';
import type { AccidentalPreference, DetectedPitch, InstrumentProfile } from '../types/music';
import { derivePitch } from '../utils/note';
import { nextSmoothedScaleCents, stabilizeScaleDisplayCents } from './tunerScale';
import { StaffNote } from './StaffNote';

const FLAT_SYMBOL = '\u266D';
const SHARP_SYMBOL = '\u266F';
const MIN_CENTS = -50;
const MAX_CENTS = 50;
const IN_TUNE_THRESHOLD = 5;
const CLOSE_THRESHOLD = 15;
const SCALE_TRACK_PADDING_REM = 0.75;
const SCALE_SUBTICKS = [-40, -30, -20, -10, 10, 20, 30, 40] as const;

interface TunerPanelProps {
  instruments: InstrumentProfile[];
  instrument: InstrumentProfile;
  selectedInstrumentId: string;
  onInstrumentChange: (instrumentId: string) => void;
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

  if (Math.abs(centsOff) <= IN_TUNE_THRESHOLD) {
    return 'in-tune';
  }

  return centsOff > 0 ? 'sharp' : 'flat';
}

function centsScaleState(centsOff: number | null) {
  if (centsOff === null) {
    return 'neutral';
  }

  const absoluteCentsOff = Math.abs(centsOff);

  if (absoluteCentsOff <= IN_TUNE_THRESHOLD) {
    return 'in-tune';
  }

  if (absoluteCentsOff <= CLOSE_THRESHOLD) {
    return 'close';
  }

  return 'out-of-tune';
}

function clampCents(centsOff: number | null) {
  if (centsOff === null) {
    return 0;
  }

  return Math.min(MAX_CENTS, Math.max(MIN_CENTS, centsOff));
}

function indicatorLeft(centsOff: number | null) {
  const clampedCentsOff = clampCents(centsOff);
  const ratio = Number(((clampedCentsOff - MIN_CENTS) / (MAX_CENTS - MIN_CENTS)).toFixed(4));

  return `calc(${SCALE_TRACK_PADDING_REM}rem + ${ratio} * (100% - ${SCALE_TRACK_PADDING_REM * 2}rem))`;
}

export function TunerPanel({
  instruments,
  instrument,
  selectedInstrumentId,
  onInstrumentChange,
  pitchState,
  accidentalPreference,
  onAccidentalPreferenceChange,
  onStart,
  onStop,
}: TunerPanelProps) {
  const { concertNote, writtenNote, centsOff } = derivePitch(
    pitchState.frequencyHz,
    instrument,
    accidentalPreference,
  );
  const [smoothedScaleCents, setSmoothedScaleCents] = useState<number | null>(centsOff);
  const previousConcertMidiRef = useRef<number | null>(concertNote?.midi ?? null);

  useEffect(() => {
    const currentConcertMidi = concertNote?.midi ?? null;
    const noteChanged =
      previousConcertMidiRef.current !== null &&
      currentConcertMidi !== null &&
      previousConcertMidiRef.current !== currentConcertMidi;

    setSmoothedScaleCents((previousSmoothedCents) =>
      nextSmoothedScaleCents({
        previousSmoothedCents,
        rawCents: centsOff,
        noteChanged,
      }),
    );

    previousConcertMidiRef.current = currentConcertMidi;
  }, [centsOff, concertNote?.midi]);

  const noteLabel = writtenNote?.display ?? '--';
  const concertLabel = concertNote?.display ?? 'No stable pitch';
  const nextAccidentalPreference = accidentalPreference === 'flat' ? 'sharp' : 'flat';
  const scaleCentsOff = stabilizeScaleDisplayCents(smoothedScaleCents);
  const scaleState = centsScaleState(scaleCentsOff);
  const showDebugReadout = !import.meta.env.PROD;
  const centsLabel =
    centsOff === null
      ? '--'
      : `${centsOff > 0 ? '+' : ''}${centsOff.toFixed(1)} cents`;

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

      {showDebugReadout ? (
        <div className="tuner-grid">
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
      ) : null}

      <div className="staff-layout">
        <div className="staff-main-row">
          <div className="note-card note-card-side">
            <p className="label note-card-label">Written note</p>
            <p className="hero-note">{noteLabel}</p>
          </div>

          <StaffNote note={writtenNote} clef={instrument.clef} />
          <div className="enharmonic-toggle-row" role="group" aria-label="Enharmonic spelling">
            <button
              type="button"
              className={`enharmonic-option ${accidentalPreference === 'flat' ? 'is-active' : ''}`}
              aria-pressed={accidentalPreference === 'flat'}
              onClick={() => onAccidentalPreferenceChange(nextAccidentalPreference)}
            >
              {FLAT_SYMBOL}
            </button>
            <button
              type="button"
              className={`enharmonic-option ${accidentalPreference === 'sharp' ? 'is-active' : ''}`}
              aria-pressed={accidentalPreference === 'sharp'}
              onClick={() => onAccidentalPreferenceChange(nextAccidentalPreference)}
            >
              {SHARP_SYMBOL}
            </button>
          </div>
        </div>
      </div>

      <div className="tuner-cents-scale">
        <div
          className="tuner-cents-scale-track"
          role="meter"
          aria-label="Cents deviation scale"
          aria-valuemin={MIN_CENTS}
          aria-valuemax={MAX_CENTS}
          aria-valuenow={clampCents(scaleCentsOff)}
          aria-valuetext={centsOff === null ? 'No stable pitch' : `${centsOff.toFixed(1)} cents`}
        >
          {SCALE_SUBTICKS.map((tick) => (
            <div
              key={tick}
              className="tuner-cents-scale-subtick"
              style={{ left: indicatorLeft(tick) }}
              data-testid="cents-scale-subtick"
              aria-hidden="true"
            />
          ))}
          <div className="tuner-cents-scale-center-tick" aria-hidden="true" />
          <div
            className={`tuner-cents-scale-indicator tuner-cents-scale-indicator-${scaleState}`}
            style={{ left: indicatorLeft(scaleCentsOff) }}
            data-testid="cents-scale-indicator"
          />
        </div>
        <div className="tuner-cents-scale-labels" aria-hidden="true">
          <span>-50</span>
          <span>0</span>
          <span>+50</span>
        </div>
      </div>
    </section>
  );
}
