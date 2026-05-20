import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { INSTRUMENTS } from '../data/instruments';
import type { AccidentalPreference } from '../types/music';
import { useTuner } from './useTuner';

const findPitchMock = vi.fn(() => [233.08, 0.99] as const);
const getUserMediaMock = vi.fn();

vi.mock('pitchy', () => ({
  PitchDetector: {
    forFloat32Array: () => ({
      findPitch: findPitchMock,
    }),
  },
}));

class MockAudioContext {
  currentTime = 0;
  sampleRate = 48_000;
  state: AudioContextState = 'suspended';
  destination = {};

  resume = vi.fn(async () => {
    this.state = 'running';
  });

  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });

  close = vi.fn(async () => {
    this.state = 'closed';
  });

  createMediaStreamSource() {
    return {
      connect: vi.fn(),
    };
  }

  createAnalyser() {
    return {
      fftSize: 0,
      smoothingTimeConstant: 0,
      disconnect: vi.fn(),
      getFloatTimeDomainData(buffer: Float32Array) {
        buffer.fill(0.1);
      },
    } as unknown as AnalyserNode;
  }
}

function Harness({
  accidentalPreference,
  instrumentId = 'trombone',
}: {
  accidentalPreference: AccidentalPreference;
  instrumentId?: string;
}) {
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)!;
  const { pitchState, start } = useTuner(instrument, accidentalPreference);

  return (
    <div>
      <button type="button" onClick={() => void start()}>
        Start
      </button>
      <output data-testid="written-note">{pitchState.writtenNote?.display ?? '--'}</output>
    </div>
  );
}

describe('useTuner', () => {
  let nextAnimationFrame: FrameRequestCallback | null = null;

  beforeEach(() => {
    findPitchMock.mockClear();
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: MockAudioContext,
    });

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: getUserMediaMock,
      },
    });

    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        nextAnimationFrame = callback;
        return 1;
      }),
    });

    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  it('uses the latest enharmonic preference for subsequent detections', async () => {
    const { rerender } = render(<Harness accidentalPreference="flat" />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    await waitFor(() => {
      expect(screen.getByTestId('written-note')).toHaveTextContent('B\u266D3');
    });

    rerender(<Harness accidentalPreference="sharp" />);

    await waitFor(() => {
      expect(screen.getByTestId('written-note')).toHaveTextContent('A\u266F3');
    });

    expect(nextAnimationFrame).not.toBeNull();

    await act(async () => {
      nextAnimationFrame?.(16);
    });

    await waitFor(() => {
      expect(screen.getByTestId('written-note')).toHaveTextContent('A\u266F3');
    });
  });

  it('retransposes the written note when switching instruments live', async () => {
    const { rerender } = render(
      <Harness accidentalPreference="flat" instrumentId="trombone" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    await waitFor(() => {
      expect(screen.getByTestId('written-note')).toHaveTextContent('B\u266D3');
    });

    rerender(<Harness accidentalPreference="flat" instrumentId="bb-clarinet" />);

    await waitFor(() => {
      expect(screen.getByTestId('written-note')).toHaveTextContent('C4');
    });

    expect(nextAnimationFrame).not.toBeNull();

    await act(async () => {
      nextAnimationFrame?.(16);
    });

    await waitFor(() => {
      expect(screen.getByTestId('written-note')).toHaveTextContent('C4');
    });
  });
});
