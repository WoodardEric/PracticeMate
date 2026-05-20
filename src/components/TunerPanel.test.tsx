import { render, screen } from '@testing-library/react';
import { TunerPanel } from './TunerPanel';
import type { DetectedPitch } from '../types/music';
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
        instrumentLabel="Viola"
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
    expect(screen.getByRole('button', { name: 'Start tuner' })).toBeInTheDocument();
  });

  it('renders the detected written and concert notes', () => {
    render(
      <TunerPanel
        instrumentLabel="Bb Clarinet"
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
        instrumentLabel="Trumpet in Bb"
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
});
