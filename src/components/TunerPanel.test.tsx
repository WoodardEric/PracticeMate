import { fireEvent, render, screen } from '@testing-library/react';
import { TunerPanel } from './TunerPanel';
import type { DetectedPitch } from '../types/music';
import { INSTRUMENTS } from '../data/instruments';

vi.mock('./StaffNote', () => ({
  StaffNote: () => <div data-testid="staff-note" />,
}));

const baseState: DetectedPitch = {
  permission: 'idle',
  listening: false,
  frequencyHz: null,
  signalConfidence: 0,
};

function renderTunerPanel({
  instrumentId = 'viola',
  pitchState = baseState,
  accidentalPreference = 'flat' as const,
}: {
  instrumentId?: string;
  pitchState?: DetectedPitch;
  accidentalPreference?: 'flat' | 'sharp';
} = {}) {
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)!;

  render(
    <TunerPanel
      instruments={INSTRUMENTS}
      instrument={instrument}
      selectedInstrumentId={instrumentId}
      onInstrumentChange={() => undefined}
      pitchState={pitchState}
      accidentalPreference={accidentalPreference}
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
    expect(screen.getAllByTestId('cents-scale-subtick')).toHaveLength(4);
    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-neutral');
    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0.5 * (100% - 1.5rem))',
    });
  });

  it('renders the detected written and concert notes', () => {
    renderTunerPanel({
      instrumentId: 'bb-clarinet',
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 233.243496812918,
        signalConfidence: 0.97,
      },
    });

    expect(screen.getByText('C4')).toBeInTheDocument();
    expect(screen.getByText('B\u266D3')).toBeInTheDocument();
    expect(screen.getByText('+1.2 cents')).toBeInTheDocument();
    expect(screen.queryByText('0 = B\u266D3')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop tuner' })).toBeInTheDocument();
  });

  it('surfaces waiting state while listening without a lock', () => {
    renderTunerPanel({
      instrumentId: 'bb-trumpet',
      accidentalPreference: 'sharp',
      pitchState: {
        ...baseState,
        permission: 'granted',
        listening: true,
        signalConfidence: 0.31,
      },
    });

    expect(screen.getByText('Waiting')).toBeInTheDocument();
    expect(screen.getByText('31%')).toBeInTheDocument();
  });

  it('keeps showing the last locked pitch when confidence drops', () => {
    renderTunerPanel({
      instrumentId: 'viola',
      accidentalPreference: 'sharp',
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 369.48185689542174,
        signalConfidence: 0.12,
      },
    });

    expect(screen.getAllByText('F\u266F4')).toHaveLength(2);
    expect(screen.getByText('369.5 Hz')).toBeInTheDocument();
    expect(screen.getByText('-2.4 cents')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('renders a green indicator when the pitch is in tune', () => {
    renderTunerPanel({
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 440,
        signalConfidence: 0.98,
      },
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-in-tune');
  });

  it('locks the indicator at center for sub-cent drift', () => {
    renderTunerPanel({
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 440,
        signalConfidence: 0.98,
      },
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0.5 * (100% - 1.5rem))',
    });
  });

  it('renders a yellow indicator when the pitch is close', () => {
    renderTunerPanel({
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 443,
        signalConfidence: 0.98,
      },
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-close');
  });

  it('renders a red indicator when the pitch is out of tune', () => {
    renderTunerPanel({
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 434.4,
        signalConfidence: 0.98,
      },
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveClass('tuner-cents-scale-indicator-out-of-tune');
  });

  it('moves the indicator gradually toward a new target on the same note', () => {
    const { rerender } = render(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 433.69,
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
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 446.4,
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
    renderTunerPanel({
      pitchState: {
        permission: 'granted',
        listening: true,
        frequencyHz: 427.4740541075866,
        signalConfidence: 0.98,
      },
    });

    expect(screen.getByTestId('cents-scale-indicator')).toHaveStyle({
      left: 'calc(0.75rem + 0 * (100% - 1.5rem))',
    });
  });

  it('reseeds the indicator when the detected note changes', () => {
    const { rerender } = render(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 433.6918074016825,
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
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 452.8929841231365,
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

  it('toggles enharmonic preference even when clicking the active segment', () => {
    const onAccidentalPreferenceChange = vi.fn();

    render(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
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

  it('respells the same concert pitch when enharmonic preference changes', () => {
    const { rerender } = render(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 233.08,
          signalConfidence: 0.98,
        }}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getAllByText('B\u266D3')).toHaveLength(2);

    rerender(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={INSTRUMENTS.find((item) => item.id === 'viola')!}
        selectedInstrumentId="viola"
        onInstrumentChange={() => undefined}
        pitchState={{
          permission: 'granted',
          listening: true,
          frequencyHz: 233.08,
          signalConfidence: 0.98,
        }}
        accidentalPreference="sharp"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getAllByText('A\u266F3')).toHaveLength(2);
  });

  it('retransposes the same concert pitch when the selected instrument changes', () => {
    const viola = INSTRUMENTS.find((item) => item.id === 'viola')!;
    const clarinet = INSTRUMENTS.find((item) => item.id === 'bb-clarinet')!;
    const pitchState = {
      permission: 'granted' as const,
      listening: true,
      frequencyHz: 233.08,
      signalConfidence: 0.98,
    };
    const { rerender } = render(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={viola}
        selectedInstrumentId={viola.id}
        onInstrumentChange={() => undefined}
        pitchState={pitchState}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getAllByText('B\u266D3')).toHaveLength(2);

    rerender(
      <TunerPanel
        instruments={INSTRUMENTS}
        instrument={clarinet}
        selectedInstrumentId={clarinet.id}
        onInstrumentChange={() => undefined}
        pitchState={pitchState}
        accidentalPreference="flat"
        onAccidentalPreferenceChange={() => undefined}
        onStart={() => undefined}
        onStop={() => undefined}
      />,
    );

    expect(screen.getByText('C4')).toBeInTheDocument();
  });
});
