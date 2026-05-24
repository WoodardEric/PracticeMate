import { render, screen } from '@testing-library/react';
import { INSTRUMENTS } from '../data/instruments';
import { midiToNote } from '../utils/note';
import { FingeringChart } from './FingeringChart';

const trumpet = INSTRUMENTS.find((instrument) => instrument.id === 'bb-trumpet')!;
const euphonium = INSTRUMENTS.find((instrument) => instrument.id === 'euphonium')!;
const flute = INSTRUMENTS.find((instrument) => instrument.id === 'flute')!;
const viola = INSTRUMENTS.find((instrument) => instrument.id === 'viola')!;

describe('FingeringChart', () => {
  it('renders a blank shell when no stable pitch is available', () => {
    render(<FingeringChart instrument={trumpet} note={null} />);

    expect(screen.getByTestId('fingering-chart-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('fingering-chart-render')).not.toBeInTheDocument();
  });

  it('renders a blank shell for instruments without a fingering chart', () => {
    render(<FingeringChart instrument={viola} note={midiToNote(60, 'flat')} />);

    expect(screen.getByTestId('fingering-chart-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('fingering-chart-render')).not.toBeInTheDocument();
  });

  it('fills the expected trumpet valve paths for a supported note', () => {
    const { container } = render(
      <FingeringChart instrument={trumpet} note={midiToNote(62, 'flat')} />,
    );

    expect(screen.getByTestId('fingering-chart-render')).toBeInTheDocument();
    expect(container.querySelector('#valve-1')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#valve-2')).toHaveAttribute('fill', 'none');
    expect(container.querySelector('#valve-3')).toHaveAttribute('fill', '#000');
  });

  it('renders active valves for a supported euphonium note', () => {
    const { container } = render(
      <FingeringChart instrument={euphonium} note={midiToNote(60, 'flat')} />,
    );

    expect(screen.getByTestId('fingering-chart-render')).toBeInTheDocument();
    expect(container.querySelector('#valve-1')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#valve-2')).toHaveAttribute('fill', 'none');
    expect(container.querySelector('#valve-3')).toHaveAttribute('fill', 'none');
  });

  it('fills the expected flute key paths for a supported note', () => {
    const { container } = render(
      <FingeringChart instrument={flute} note={midiToNote(95, 'flat')} />,
    );

    expect(screen.getByTestId('fingering-chart-render')).toBeInTheDocument();
    expect(container.querySelector('#thumb-B')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#LH-1')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#LH-3')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#G-sharp')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#trill-2')).toHaveAttribute('fill', '#000');
    expect(container.querySelector('#D-sharp')).toHaveAttribute('fill', 'none');
    expect(container.querySelector('#RH-1')).toHaveAttribute('fill', 'none');
  });
});
