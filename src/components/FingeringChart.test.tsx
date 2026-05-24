import { render, screen } from '@testing-library/react';
import { INSTRUMENTS } from '../data/instruments';
import { midiToNote } from '../utils/note';
import { FingeringChart } from './FingeringChart';

const trumpet = INSTRUMENTS.find((instrument) => instrument.id === 'bb-trumpet')!;
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
});
