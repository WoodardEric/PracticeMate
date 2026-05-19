import type { InstrumentProfile } from '../types/music';

interface InstrumentSelectProps {
  instruments: InstrumentProfile[];
  selectedId: string;
  onChange: (instrumentId: string) => void;
}

export function InstrumentSelect({
  instruments,
  selectedId,
  onChange,
}: InstrumentSelectProps) {
  return (
    <section className="panel panel-compact">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Instrument</p>
          <h2>Choose your setup</h2>
        </div>
      </div>

      <label className="field">
        <span>Band / orchestra instrument</span>
        <select
          value={selectedId}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Select instrument"
        >
          {instruments.map((instrument) => (
            <option key={instrument.id} value={instrument.id}>
              {instrument.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

