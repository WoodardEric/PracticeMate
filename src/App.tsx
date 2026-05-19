import { useState } from 'react';
import { InstrumentSelect } from './components/InstrumentSelect';
import { MetronomePanel } from './components/MetronomePanel';
import { StatusBanner } from './components/StatusBanner';
import { TunerPanel } from './components/TunerPanel';
import { DEFAULT_INSTRUMENT, INSTRUMENTS } from './data/instruments';
import { useMetronome } from './hooks/useMetronome';
import { useTuner } from './hooks/useTuner';

export default function App() {
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(DEFAULT_INSTRUMENT.id);

  const selectedInstrument =
    INSTRUMENTS.find((instrument) => instrument.id === selectedInstrumentId) ?? DEFAULT_INSTRUMENT;

  const { pitchState, start: startTuner, stop: stopTuner } = useTuner(selectedInstrument);
  const {
    settings,
    start: startMetronome,
    stop: stopMetronome,
    setBpm,
    setTimeSignature,
    setAccentEnabled,
    setVolume,
  } = useMetronome();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">PracticeMate</p>
        <h1>Browser-based tuner and metronome for ensemble practice.</h1>
        <p className="hero-copy">
          Pick your instrument, tune to a steady note, and keep time without installing anything.
          The tuner shows the written note in the clef your part uses.
        </p>
      </section>

      <StatusBanner
        permission={pitchState.permission}
        tunerListening={pitchState.listening}
        metronomeRunning={settings.isRunning}
      />

      <div className="layout-grid">
        <InstrumentSelect
          instruments={INSTRUMENTS}
          selectedId={selectedInstrument.id}
          onChange={setSelectedInstrumentId}
        />

        <TunerPanel
          instrumentLabel={selectedInstrument.label}
          clef={selectedInstrument.clef}
          pitchState={pitchState}
          onStart={startTuner}
          onStop={stopTuner}
        />

        <MetronomePanel
          settings={settings}
          onStart={startMetronome}
          onStop={stopMetronome}
          onBpmChange={setBpm}
          onTimeSignatureChange={setTimeSignature}
          onAccentToggle={setAccentEnabled}
          onVolumeChange={setVolume}
        />
      </div>
    </main>
  );
}
