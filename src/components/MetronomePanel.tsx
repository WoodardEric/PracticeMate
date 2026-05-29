import { useEffect, useState, type KeyboardEvent } from 'react';
import type { MetronomeSettings } from '../types/music';
import {
  formatTimeSignature,
  parseTimeSignature,
  stepTimeSignatureBottom,
} from '../utils/metronome';

interface MetronomePanelProps {
  settings: MetronomeSettings;
  onStart: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
  onTimeSignatureChange: (timeSignature: MetronomeSettings['timeSignature']) => void;
  onAccentToggle: (accentEnabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

function parseDraftNumber(draft: string): number | null {
  if (draft.trim() === '') {
    return null;
  }

  const parsedValue = Number(draft);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function MetronomePanel({
  settings,
  onStart,
  onStop,
  onBpmChange,
  onTimeSignatureChange,
  onAccentToggle,
  onVolumeChange,
}: MetronomePanelProps) {
  const { top, bottom } = parseTimeSignature(settings.timeSignature);
  const [bpmDraft, setBpmDraft] = useState(String(settings.bpm));
  const [timeSignatureTopDraft, setTimeSignatureTopDraft] = useState(String(top));
  const [timeSignatureBottomDraft, setTimeSignatureBottomDraft] = useState(String(bottom));
  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [isEditingTimeSignatureTop, setIsEditingTimeSignatureTop] = useState(false);
  const [isEditingTimeSignatureBottom, setIsEditingTimeSignatureBottom] = useState(false);

  useEffect(() => {
    if (!isEditingBpm) {
      setBpmDraft(String(settings.bpm));
    }
  }, [isEditingBpm, settings.bpm]);

  useEffect(() => {
    if (!isEditingTimeSignatureTop) {
      setTimeSignatureTopDraft(String(top));
    }
  }, [isEditingTimeSignatureTop, top]);

  useEffect(() => {
    if (!isEditingTimeSignatureBottom) {
      setTimeSignatureBottomDraft(String(bottom));
    }
  }, [bottom, isEditingTimeSignatureBottom]);

  function handleCommitOnEnter(
    event: KeyboardEvent<HTMLInputElement>,
    commitDraft: () => void,
  ) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    commitDraft();
  }

  function commitBpmDraft() {
    setIsEditingBpm(false);

    const parsedBpm = parseDraftNumber(bpmDraft);

    if (parsedBpm === null) {
      setBpmDraft(String(settings.bpm));
      return;
    }

    if (parsedBpm === settings.bpm) {
      setBpmDraft(String(settings.bpm));
      return;
    }

    onBpmChange(parsedBpm);
  }

  function commitTimeSignatureTopDraft() {
    setIsEditingTimeSignatureTop(false);

    const parsedTop = parseDraftNumber(timeSignatureTopDraft);

    if (parsedTop === null) {
      setTimeSignatureTopDraft(String(top));
      return;
    }

    const nextTimeSignature = formatTimeSignature(parsedTop, bottom);
    const nextParsedTimeSignature = parseTimeSignature(nextTimeSignature);

    setTimeSignatureTopDraft(String(nextParsedTimeSignature.top));
    setTimeSignatureBottomDraft(String(nextParsedTimeSignature.bottom));

    if (nextTimeSignature === settings.timeSignature) {
      return;
    }

    onTimeSignatureChange(nextTimeSignature);
  }

  function commitTimeSignatureBottomDraft() {
    setIsEditingTimeSignatureBottom(false);

    const parsedBottom = parseDraftNumber(timeSignatureBottomDraft);

    if (parsedBottom === null) {
      setTimeSignatureBottomDraft(String(bottom));
      return;
    }

    const nextTimeSignature = formatTimeSignature(
      top,
      stepTimeSignatureBottom(parsedBottom, bottom),
    );
    const nextParsedTimeSignature = parseTimeSignature(nextTimeSignature);

    setTimeSignatureTopDraft(String(nextParsedTimeSignature.top));
    setTimeSignatureBottomDraft(String(nextParsedTimeSignature.bottom));

    if (nextTimeSignature === settings.timeSignature) {
      return;
    }

    onTimeSignatureChange(nextTimeSignature);
  }

  return (
    <section className="panel metronome-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Metronome</p>
          <h2>Steady pulse</h2>
        </div>
        <button
          type="button"
          className={`button ${settings.isRunning ? 'button-secondary' : 'button-primary'}`}
          onClick={settings.isRunning ? onStop : onStart}
        >
          {settings.isRunning ? 'Stop metronome' : 'Start metronome'}
        </button>
      </div>

      <div className="metronome-grid">
        <label className="field">
          <span className="field-header">
            <span>BPM</span>
            <input
              className="bpm-input"
              type="number"
              min="30"
              max="300"
              value={bpmDraft}
              onFocus={() => setIsEditingBpm(true)}
              onChange={(event) => setBpmDraft(event.target.value)}
              onBlur={commitBpmDraft}
              onKeyDown={(event) => handleCommitOnEnter(event, commitBpmDraft)}
            />
          </span>
          <div className="bpm-row">
            <input
              type="range"
              min="30"
              max="300"
              value={settings.bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
            />
          </div>
        </label>

        <label className="field">
          <span>Time signature</span>
          <div className="time-signature-stack">
            <div className="time-signature-row">
              <input
                type="number"
                min="2"
                max="16"
                aria-label="Time signature top"
                value={timeSignatureTopDraft}
                onFocus={() => setIsEditingTimeSignatureTop(true)}
                onChange={(event) => setTimeSignatureTopDraft(event.target.value)}
                onBlur={commitTimeSignatureTopDraft}
                onKeyDown={(event) => handleCommitOnEnter(event, commitTimeSignatureTopDraft)}
              />
              <span className="time-signature-separator" aria-hidden="true">
                /
              </span>
              <input
                type="number"
                min="2"
                max="16"
                aria-label="Time signature bottom"
                value={timeSignatureBottomDraft}
                onFocus={() => setIsEditingTimeSignatureBottom(true)}
                onChange={(event) => setTimeSignatureBottomDraft(event.target.value)}
                onBlur={commitTimeSignatureBottomDraft}
                onKeyDown={(event) => handleCommitOnEnter(event, commitTimeSignatureBottomDraft)}
              />
            </div>
            <span className="accent-toggle">
              <span>Accent first beat</span>
              <input
                type="checkbox"
                checked={settings.accentEnabled}
                onChange={(event) => onAccentToggle(event.target.checked)}
              />
            </span>
          </div>
        </label>

        <label className="field">
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
