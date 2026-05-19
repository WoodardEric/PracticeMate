import type { MetronomeSettings } from '../types/music';

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
              max="220"
              value={settings.bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
            />
            <input
              type="number"
              min="30"
              max="220"
              value={settings.bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
            />
          </div>
        </label>

        <label className="field">
          <span>Time signature</span>
          <select
            value={settings.timeSignature}
            onChange={(event) =>
              onTimeSignatureChange(event.target.value as MetronomeSettings['timeSignature'])
            }
          >
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="6/8">6/8</option>
          </select>
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

