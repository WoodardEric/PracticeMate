import { useEffect, useState } from 'react';
import { MetronomePanel } from './components/MetronomePanel';
import { StatusBanner } from './components/StatusBanner';
import { TunerPanel } from './components/TunerPanel';
import { loadVexflow } from './components/vexflowLoader';
import { DEFAULT_INSTRUMENT, INSTRUMENTS } from './data/instruments';
import { useMetronome } from './hooks/useMetronome';
import { useTuner } from './hooks/useTuner';
import type { AccidentalPreference } from './types/music';

type WindowWithIdleCallback = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void) => number;
};

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

  useEffect(() => {
    const browserWindow = window as WindowWithIdleCallback;
    let idleCallbackHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const preloadStaffRenderer = () => {
      void loadVexflow();
    };

    if (browserWindow.requestIdleCallback) {
      idleCallbackHandle = browserWindow.requestIdleCallback(preloadStaffRenderer);
    } else {
      timeoutHandle = window.setTimeout(preloadStaffRenderer, 0);
    }

    return () => {
      if (idleCallbackHandle !== null && browserWindow.cancelIdleCallback) {
        browserWindow.cancelIdleCallback(idleCallbackHandle);
      }

      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

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
