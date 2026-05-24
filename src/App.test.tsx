import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import type { DetectedPitch, MetronomeSettings, NamedNote } from './types/music';

const tunerStart = vi.fn();
const tunerStop = vi.fn();
const metronomeStart = vi.fn();
const metronomeStop = vi.fn();
const setBpm = vi.fn();
const setTimeSignature = vi.fn();
const setAccentEnabled = vi.fn();
const setVolume = vi.fn();

const basePitchState: DetectedPitch = {
  permission: 'idle',
  listening: false,
  frequencyHz: null,
  signalConfidence: 0,
};

const baseMetronomeSettings: MetronomeSettings = {
  bpm: 80,
  timeSignature: '4/4',
  accentEnabled: true,
  volume: 0.55,
  isRunning: false,
};

let currentPitchState: DetectedPitch = basePitchState;

vi.mock('./hooks/useTuner', () => ({
  useTuner: () => ({
    pitchState: currentPitchState,
    start: tunerStart,
    stop: tunerStop,
  }),
}));

vi.mock('./hooks/useMetronome', () => ({
  useMetronome: () => ({
    settings: baseMetronomeSettings,
    start: metronomeStart,
    stop: metronomeStop,
    setBpm,
    setTimeSignature,
    setAccentEnabled,
    setVolume,
  }),
}));

vi.mock('./components/vexflowLoader', () => ({
  loadVexflow: vi.fn(async () => undefined),
}));

vi.mock('./components/StaffNote', () => ({
  StaffNote: ({ note }: { note: NamedNote | null }) => (
    <div data-testid="staff-note">{note?.display ?? 'empty staff'}</div>
  ),
}));

describe('App dev pitch preview', () => {
  beforeEach(() => {
    currentPitchState = basePitchState;
    tunerStart.mockReset();
    tunerStop.mockReset();
    metronomeStart.mockReset();
    metronomeStop.mockReset();
    setBpm.mockReset();
    setTimeSignature.mockReset();
    setAccentEnabled.mockReset();
    setVolume.mockReset();
  });

  it('opens and closes the dev pitch panel with the keyboard shortcut', () => {
    render(<App />);

    expect(screen.queryByTestId('dev-pitch-panel')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });

    expect(screen.getByTestId('dev-pitch-panel')).toBeInTheDocument();
    expect(screen.getAllByText('C4').length).toBeGreaterThan(0);
    expect(within(screen.getByTestId('dev-pitch-panel')).getByText('60')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByTestId('dev-pitch-panel')).not.toBeInTheDocument();
  });

  it('seeds from the current live written note when a stable pitch exists', () => {
    currentPitchState = {
      permission: 'granted',
      listening: true,
      frequencyHz: 233.243496812918,
      signalConfidence: 0.97,
    };

    render(<App />);
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });

    const panel = screen.getByTestId('dev-pitch-panel');

    expect(within(panel).getAllByText('B\u266D3').length).toBeGreaterThan(0);
    expect(within(panel).getByText('58')).toBeInTheDocument();
  });

  it('preserves the last preview note when the panel is reopened', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(screen.getAllByText('D\u266D4').length).toBeGreaterThan(0);

    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });

    expect(screen.getAllByText('D\u266D4').length).toBeGreaterThan(0);
    expect(within(screen.getByTestId('dev-pitch-panel')).getByText('61')).toBeInTheDocument();
  });

  it('steps the existing tuner display by semitone with arrow keys', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });

    expect(screen.getAllByText('C4').length).toBeGreaterThan(0);
    expect(screen.getByTestId('staff-note')).toHaveTextContent('C4');

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(screen.getAllByText('D\u266D4').length).toBeGreaterThan(0);
    expect(screen.getByTestId('staff-note')).toHaveTextContent('D\u266D4');
  });

  it('updates the displayed fingering when the preview instrument changes', () => {
    const { container } = render(<App />);

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    fireEvent.change(screen.getByRole('combobox', { name: 'Select preview instrument' }), {
      target: { value: 'bb-trumpet' },
    });

    expect(screen.getAllByDisplayValue('Bb Trumpet')).toHaveLength(2);
    expect(container.querySelector('#valve-1')).toHaveAttribute('fill', 'none');
    expect(container.querySelector('#valve-2')).toHaveAttribute('fill', 'none');
    expect(container.querySelector('#valve-3')).toHaveAttribute('fill', 'none');
  });

  it('keeps the note visible while blanking out unsupported fingerings', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    expect(screen.getAllByText('B3').length).toBeGreaterThan(0);
    expect(screen.getByTestId('staff-note')).toHaveTextContent('B3');
    expect(screen.queryByTestId('fingering-chart-render')).not.toBeInTheDocument();
  });

  it('does not step the preview note while focus is inside an editable control', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });

    const previewInstrumentSelect = screen.getByRole('combobox', {
      name: 'Select preview instrument',
    });

    previewInstrumentSelect.focus();
    fireEvent.keyDown(previewInstrumentSelect, { key: 'ArrowRight' });

    expect(screen.getAllByText('C4').length).toBeGreaterThan(0);
    expect(screen.queryByText('D\u266D4')).not.toBeInTheDocument();
  });
});
