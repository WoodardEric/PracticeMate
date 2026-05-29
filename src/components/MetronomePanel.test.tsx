import { fireEvent, render, screen } from '@testing-library/react';
import { MetronomePanel } from './MetronomePanel';
import type { MetronomeSettings } from '../types/music';

const baseSettings: MetronomeSettings = {
  bpm: 80,
  timeSignature: '4/4',
  accentEnabled: true,
  volume: 0.55,
  isRunning: false,
};

function renderMetronomePanel(settings: MetronomeSettings = baseSettings) {
  const onStart = vi.fn();
  const onStop = vi.fn();
  const onBpmChange = vi.fn();
  const onTimeSignatureChange = vi.fn();
  const onAccentToggle = vi.fn();
  const onVolumeChange = vi.fn();

  const view = render(
    <MetronomePanel
      settings={settings}
      onStart={onStart}
      onStop={onStop}
      onBpmChange={onBpmChange}
      onTimeSignatureChange={onTimeSignatureChange}
      onAccentToggle={onAccentToggle}
      onVolumeChange={onVolumeChange}
    />,
  );

  function rerenderWithSettings(nextSettings: MetronomeSettings) {
    view.rerender(
      <MetronomePanel
        settings={nextSettings}
        onStart={onStart}
        onStop={onStop}
        onBpmChange={onBpmChange}
        onTimeSignatureChange={onTimeSignatureChange}
        onAccentToggle={onAccentToggle}
        onVolumeChange={onVolumeChange}
      />,
    );
  }

  return {
    ...view,
    onBpmChange,
    onTimeSignatureChange,
    rerenderWithSettings,
  };
}

describe('MetronomePanel', () => {
  it('keeps a typed BPM draft until blur, then shows the clamped value after rerender', () => {
    const { onBpmChange, rerenderWithSettings } = renderMetronomePanel();
    const bpmInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement;

    fireEvent.focus(bpmInput);
    fireEvent.change(bpmInput, { target: { value: '12' } });

    expect(bpmInput.value).toBe('12');
    expect(onBpmChange).not.toHaveBeenCalled();

    fireEvent.blur(bpmInput);

    expect(onBpmChange).toHaveBeenCalledTimes(1);
    expect(onBpmChange).toHaveBeenCalledWith(12);

    rerenderWithSettings({
      ...baseSettings,
      bpm: 30,
    });

    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(30);
  });

  it('commits high BPM drafts on Enter and does not re-commit on a later blur', () => {
    const { onBpmChange, rerenderWithSettings } = renderMetronomePanel();
    const bpmInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement;

    fireEvent.focus(bpmInput);
    fireEvent.change(bpmInput, { target: { value: '450' } });
    fireEvent.keyDown(bpmInput, { key: 'Enter' });

    expect(onBpmChange).toHaveBeenCalledTimes(1);
    expect(onBpmChange).toHaveBeenCalledWith(450);

    rerenderWithSettings({
      ...baseSettings,
      bpm: 300,
    });

    fireEvent.blur(screen.getAllByRole('spinbutton')[0]);

    expect(onBpmChange).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(300);
  });

  it('keeps the time signature top draft until blur, then commits the normalized value', () => {
    const { onTimeSignatureChange, rerenderWithSettings } = renderMetronomePanel();
    const topInput = screen.getByRole('spinbutton', {
      name: 'Time signature top',
    }) as HTMLInputElement;

    fireEvent.focus(topInput);
    fireEvent.change(topInput, { target: { value: '18' } });

    expect(topInput.value).toBe('18');
    expect(onTimeSignatureChange).not.toHaveBeenCalled();

    fireEvent.blur(topInput);

    expect(onTimeSignatureChange).toHaveBeenCalledTimes(1);
    expect(onTimeSignatureChange).toHaveBeenCalledWith('16/4');

    rerenderWithSettings({
      ...baseSettings,
      timeSignature: '16/4',
    });

    expect(screen.getByRole('spinbutton', { name: 'Time signature top' })).toHaveValue(16);
  });

  it('keeps the time signature bottom draft until Enter, then commits the stepped value', () => {
    const { onTimeSignatureChange, rerenderWithSettings } = renderMetronomePanel();
    const bottomInput = screen.getByRole('spinbutton', {
      name: 'Time signature bottom',
    }) as HTMLInputElement;

    fireEvent.focus(bottomInput);
    fireEvent.change(bottomInput, { target: { value: '15' } });

    expect(bottomInput.value).toBe('15');
    expect(onTimeSignatureChange).not.toHaveBeenCalled();

    fireEvent.keyDown(bottomInput, { key: 'Enter' });

    expect(onTimeSignatureChange).toHaveBeenCalledTimes(1);
    expect(onTimeSignatureChange).toHaveBeenCalledWith('4/8');

    rerenderWithSettings({
      ...baseSettings,
      timeSignature: '4/8',
    });

    expect(screen.getByRole('spinbutton', { name: 'Time signature bottom' })).toHaveValue(8);
  });

  it('updates the BPM slider immediately', () => {
    const { onBpmChange } = renderMetronomePanel();
    const bpmSlider = screen.getAllByRole('slider')[0];

    fireEvent.change(bpmSlider, { target: { value: '140' } });

    expect(onBpmChange).toHaveBeenCalledWith(140);
  });
});
