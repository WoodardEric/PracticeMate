import { fireEvent, render, screen } from '@testing-library/react';
import { TunerPanel } from './TunerPanel';
import type { DetectedPitch } from '../types/music';
import { INSTRUMENTS } from '../data/instruments';
import { midiToNote } from '../utils/note';

vi.mock('./StaffNote', () => ({
  StaffNote: () => <div data-testid="staff-note" />,
}));

const baseState: DetectedPitch = {
  permission: 'idle',
  listening: false,
  frequencyHz: null,
  concertNote: null,
  writtenNote: null,
  centsOff: null,
  signalConfidence: 0,
};

function renderTunerPanel(pitchState: DetectedPitch = baseState) {
  render(
    <TunerPanel
      instruments={INSTRUMENTS}
      selectedInstrumentId="viola"
      onInstrumentChange={() => undefined}
      clef="alto"
      pitchState={pitchState}
      accidentalPreference="flat"
      onAccidentalPreferenceChange={() => undefined}
      onStart={() => undefined}
      onStop={() => undefined}
    />,
  );
}

describe('TunerPanel', () => {
  it('shows idle guidance when no stable pitch is present', () => {
    renderTunerPanel();

    expect(screen.getByText('Written note')).toBeInTheDocument();
    expect(screen.getByText('No stable pitch')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Select instrument' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start tuner' })).toBeInTheDocument();
    expect(screen.getByText('+50')).toBeInTheDocument();
    expect(screen.getAllByTestId('cents-scale-subtick')).toHaveLength(8);
    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-neutral');
    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0.5 * (100% - 1.5rem))',
    });
  });

  it('renders the detected written and concert notes', () => {
    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="bb-clarinet"
        onInstrumentChange={() => undefined}
        clef="treble"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 233.08,
          concertNote: midiToNote(58),
          writtenNote: midiToNote(60),
          centsOff: 1.2,
          signalConfidence: 0.97,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByText('C4')).toBeInTheDocument();
    expect(screen.getByText('B\u266D3')).toBeInTheDocument();
    expect(screen.getByText('+1.2 cents')).toBeInTheDocument();
    expect(screen.queryByText('0 = B\u266D3')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop tuner' })).toBeInTheDocument();
  });

  it('surfaces waiting state while listening without a lock', () => {
    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="bb-trumpet"
        onInstrumentChange={() => undefined}
        clef="treble"
        pitchState={{
          ...baseState,
          permission: 'granted',
          listening: true,
          signalConfidence: 0.31,
        }}
        accidentalPreference="sharp"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByText('Waiting')).toBeInTheDocument();
    expect(screen.getByText('31%')).toBeInTheDocument();
  });

  it('keeps showing the last locked pitch when confidence drops', () => {
    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 369.99,
          concertNote: midiToNote(66, 'sharp'),
          writtenNote: midiToNote(66, 'sharp'),
          centsOff: -2.4,
          signalConfidence: 0.12,
        }}
        accidentalPreference="sharp"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getAllByText('F\u266F4')).toHaveLength(2);
    expect(screen.getByText('370.0 Hz')).toBeInTheDocument();
    expect(screen.getByText('-2.4 cents')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('renders a green indicator when the pitch is in tune', () => {
    renderTunerPanel({
      permission: 'granted',
      listening: true,
      frequencyHz: 440,
      concertNote: midiToNote(69),
      writtenNote: midiToNote(69),
      centsOff: 3.4,
      signalConfidence: 0.98,
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-in-tune');
  });

  it('locks the indicator at center for sub-cent drift', () => {
    renderTunerPanel({
      permission: 'granted',
      listening: true,
      frequencyHz: 440,
      concertNote: midiToNote(69),
      writtenNote: midiToNote(69),
      centsOff: 0.5,
      signalConfidence: 0.98,
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0.5 * (100% - 1.5rem))',
    });
  });

  it('renders a yellow indicator when the pitch is close', () => {
    renderTunerPanel({
      permission: 'granted',
      listening: true,
      frequencyHz: 440,
      concertNote: midiToNote(69),
      writtenNote: midiToNote(69),
      centsOff: 11.8,
      signalConfidence: 0.98,
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-close');
  });

  it('renders a red indicator when the pitch is out of tune', () => {
    renderTunerPanel({
      permission: 'granted',
      listening: true,
      frequencyHz: 440,
      concertNote: midiToNote(69),
      writtenNote: midiToNote(69),
      centsOff: -22.1,
      signalConfidence: 0.98,
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-out-of-tune');
  });

  it('moves the indicator gradually toward a new target on the same note', () => {
    const { rerender } = render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 440,
          concertNote: midiToNote(69),
          writtenNote: midiToNote(69),
          centsOff: -25,
          signalConfidence: 0.98,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0.25 * (100% - 1.5rem))',
    });

    rerender(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 440,
          concertNote: midiToNote(69),
          writtenNote: midiToNote(69),
          centsOff: 25,
          signalConfidence: 0.98,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0.34 * (100% - 1.5rem))',
    });
  });

  it('clamps the indicator at the negative edge when seeded beyond the scale', () => {
    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 440,
          concertNote: midiToNote(69),
          writtenNote: midiToNote(69),
          centsOff: -80,
          signalConfidence: 0.98,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0 * (100% - 1.5rem))',
    });
  });

  it('reseeds and clamps the indicator at the positive edge when the note changes', () => {
    const { rerender } = render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 440,
          concertNote: midiToNote(69),
          writtenNote: midiToNote(69),
          centsOff: -80,
          signalConfidence: 0.98,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0 * (100% - 1.5rem))',
    });

    rerender(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 466.16,
          concertNote: midiToNote(70),
          writtenNote: midiToNote(70),
          centsOff: 80,
          signalConfidence: 0.98,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 1 * (100% - 1.5rem))',
    });
  });

  it('toggles enharmonic preference even when clicking the active segment', () => {
    const onAccidentalPreferenceChange = vi.fn();

    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={baseState}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={onAccidentalPreferenceChange}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '\u266D' }));

    expect(onAccidentalPreferenceChange).toHaveBeenCalledWith('sharp');
  });
});
