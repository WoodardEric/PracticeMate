import { useEffect, useState } from 'react';
import { DevPitchPanel } from './components/DevPitchPanel';
import { MetronomePanel } from './components/MetronomePanel';
import { StatusBanner } from './components/StatusBanner';
import { TunerPanel } from './components/TunerPanel';
import { loadVexflow } from './components/vexflowLoader';
import { DEFAULT_INSTRUMENT, INSTRUMENTS } from './data/instruments';
import { useMetronome } from './hooks/useMetronome';
import { useTuner } from './hooks/useTuner';
import type { AccidentalPreference, DetectedPitch } from './types/music';
import {
  derivePitch,
  midiToFrequency,
  midiToNote,
  transposeWrittenNoteToConcert,
  writtenMidiToConcertMidi,
} from './utils/note';

type WindowWithIdleCallback = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void) => number;
};

const DEV_PREVIEW_DEFAULT_WRITTEN_MIDI = 60;
const MIN_MIDI = 0;
const MAX_MIDI = 127;

function clampMidi(midi: number): number {
  return Math.min(MAX_MIDI, Math.max(MIN_MIDI, Math.round(midi)));
}

function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !== null
  );
}

export default function App() {
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(DEFAULT_INSTRUMENT.id);
  const [accidentalPreference, setAccidentalPreference] =
    useState<AccidentalPreference>('flat');
  const [isDevPitchPanelOpen, setIsDevPitchPanelOpen] = useState(false);
  const [devWrittenMidi, setDevWrittenMidi] = useState<number | null>(null);

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
  const liveDerivedPitch = derivePitch(
    pitchState.frequencyHz,
    selectedInstrument,
    accidentalPreference,
  );
  const resolvedDevWrittenMidi = devWrittenMidi ?? DEV_PREVIEW_DEFAULT_WRITTEN_MIDI;
  const devWrittenNote = midiToNote(resolvedDevWrittenMidi, accidentalPreference);
  const devConcertNote = transposeWrittenNoteToConcert(
    devWrittenNote,
    selectedInstrument,
    accidentalPreference,
  );
  const effectivePitchState: DetectedPitch =
    import.meta.env.DEV && isDevPitchPanelOpen
      ? {
          ...pitchState,
          frequencyHz: midiToFrequency(writtenMidiToConcertMidi(resolvedDevWrittenMidi, selectedInstrument)),
          signalConfidence: 1,
        }
      : pitchState;

  function toggleDevPitchPanel() {
    setIsDevPitchPanelOpen((currentOpen) => {
      if (currentOpen) {
        return false;
      }

      setDevWrittenMidi((currentWrittenMidi) =>
        currentWrittenMidi ?? liveDerivedPitch.writtenNote?.midi ?? DEV_PREVIEW_DEFAULT_WRITTEN_MIDI,
      );

      return true;
    });
  }

  function closeDevPitchPanel() {
    setIsDevPitchPanelOpen(false);
  }

  function stepDevWrittenMidi(step: number) {
    setDevWrittenMidi((currentWrittenMidi) =>
      clampMidi((currentWrittenMidi ?? DEV_PREVIEW_DEFAULT_WRITTEN_MIDI) + step),
    );
  }

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

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableEventTarget(event.target)) {
        return;
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        toggleDevPitchPanel();
        return;
      }

      if (!isDevPitchPanelOpen) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeDevPitchPanel();
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        stepDevWrittenMidi(-1);
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        stepDevWrittenMidi(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDevPitchPanelOpen, liveDerivedPitch.writtenNote?.midi]);

  return (
    <main className="app-shell">
      <StatusBanner
        permission={pitchState.permission}
        tunerListening={pitchState.listening}
        metronomeRunning={settings.isRunning}
      />

      <div className="layout-grid">
        <div className="tuner-stack">
          {import.meta.env.DEV && isDevPitchPanelOpen ? (
            <DevPitchPanel
              instruments={INSTRUMENTS}
              selectedInstrumentId={selectedInstrument.id}
              writtenNote={devWrittenNote}
              concertNote={devConcertNote}
              writtenMidi={resolvedDevWrittenMidi}
              onInstrumentChange={setSelectedInstrumentId}
              onStepDown={() => stepDevWrittenMidi(-1)}
              onStepUp={() => stepDevWrittenMidi(1)}
              onClose={closeDevPitchPanel}
            />
          ) : null}

          <TunerPanel
            instruments={INSTRUMENTS}
            instrument={selectedInstrument}
            selectedInstrumentId={selectedInstrument.id}
            onInstrumentChange={setSelectedInstrumentId}
            pitchState={effectivePitchState}
            accidentalPreference={accidentalPreference}
            onAccidentalPreferenceChange={setAccidentalPreference}
            onStart={startTuner}
            onStop={stopTuner}
          />
        </div>

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
