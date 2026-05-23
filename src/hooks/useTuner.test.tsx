import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTuner } from './useTuner';

const findPitchMock = vi.fn();
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

function Harness() {
  const { pitchState, start } = useTuner();

  return (
    <div>
      <button type="button" onClick={() => void start()}>
        Start
      </button>
      <output data-testid="frequency">{pitchState.frequencyHz?.toFixed(2) ?? '--'}</output>
      <output data-testid="confidence">{pitchState.signalConfidence.toFixed(2)}</output>
    </div>
  );
}

describe('useTuner', () => {
  let nextAnimationFrame: FrameRequestCallback | null = null;

  beforeEach(() => {
    findPitchMock.mockClear();
    findPitchMock.mockReturnValue([233.08, 0.99] as const);
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

  it('reports the detected frequency from the pitch detector', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    await waitFor(() => {
      expect(screen.getByTestId('frequency')).toHaveTextContent('233.08');
      expect(screen.getByTestId('confidence')).toHaveTextContent('0.99');
    });
  });

  it('keeps the last stable frequency when a later frame has no reliable pitch lock', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    await waitFor(() => {
      expect(screen.getByTestId('frequency')).toHaveTextContent('233.08');
      expect(screen.getByTestId('confidence')).toHaveTextContent('0.99');
    });

    expect(nextAnimationFrame).not.toBeNull();
    findPitchMock.mockReturnValue([233.08, 0.2] as const);

    await act(async () => {
      nextAnimationFrame?.(16);
    });

    await waitFor(() => {
      expect(screen.getByTestId('frequency')).toHaveTextContent('233.08');
      expect(screen.getByTestId('confidence')).toHaveTextContent('0.20');
    });
  });
});
