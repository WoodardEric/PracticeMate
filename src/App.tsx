import { useState } from 'react';
import { MetronomePanel } from './components/MetronomePanel';
import { StatusBanner } from './components/StatusBanner';
import { TunerPanel } from './components/TunerPanel';
import { DEFAULT_INSTRUMENT, INSTRUMENTS } from './data/instruments';
import { useMetronome } from './hooks/useMetronome';
import { useTuner } from './hooks/useTuner';
import type { AccidentalPreference } from './types/music';

export default function App() {
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(DEFAULT_INSTRUMENT.id);
  const [accidentalPreference, setAccidentalPreference] =
    useState<AccidentalPreference>('flat');

  const selectedInstrument =
    INSTRUMENTS.find((instrument) => instrument.id === selectedInstrumentId) ?? DEFAULT_INSTRUMENT;

  const { pitchState, start: startTuner, stop: stopTuner } = useTuner();
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
      <StatusBanner
        permission={pitchState.permission}
        tunerListening={pitchState.listening}
        metronomeRunning={settings.isRunning}
      />

      <div className="layout-grid">
        <TunerPanel
          instruments={INSTRUMENTS}
          instrument={selectedInstrument}
          selectedInstrumentId={selectedInstrument.id}
          onInstrumentChange={setSelectedInstrumentId}
          pitchState={pitchState}
          accidentalPreference={accidentalPreference}
          onAccidentalPreferenceChange={setAccidentalPreference}
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
