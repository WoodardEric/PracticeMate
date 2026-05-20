import { render, screen } from '@testing-library/react';
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

describe('TunerPanel', () => {
  it('shows idle guidance when no stable pitch is present', () => {
    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        clef="alto"
        pitchState={baseState}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByText('Written note')).toBeInTheDocument();
    expect(screen.getByText('No stable pitch')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Select instrument' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start tuner' })).toBeInTheDocument();
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
});
