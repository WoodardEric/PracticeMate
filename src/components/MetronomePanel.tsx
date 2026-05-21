import type { MetronomeSettings } from '../types/music';
import {
  clampTimeSignatureTop,
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

  return (
    <section className="panel">
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
          <span>BPM</span>
          <div className="bpm-row">
            <input
              type="range"
              min="30"
              max="300"
              value={settings.bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
            />
            <input
              type="number"
              min="30"
              max="300"
              value={settings.bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
            />
          </div>
        </label>

        <label className="field">
          <span>Time signature</span>
          <div className="time-signature-row">
            <input
              type="number"
              min="2"
              max="16"
              aria-label="Time signature top"
              value={top}
              onChange={(event) =>
                onTimeSignatureChange(formatTimeSignature(clampTimeSignatureTop(Number(event.target.value)), bottom))
              }
            />
            <span className="time-signature-separator" aria-hidden="true">
              /
            </span>
            <input
              type="number"
              min="2"
              max="16"
              aria-label="Time signature bottom"
              value={bottom}
              onChange={(event) =>
                onTimeSignatureChange(
                  formatTimeSignature(top, stepTimeSignatureBottom(Number(event.target.value), bottom)),
                )
              }
            />
          </div>
        </label>

        <label className="field field-inline">
          <span>Accent first beat</span>
          <input
            type="checkbox"
            checked={settings.accentEnabled}
            onChange={(event) => onAccentToggle(event.target.checked)}
          />
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
