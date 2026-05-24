import type { InstrumentProfile, NamedNote } from '../types/music';
import type {
  FingeringKeyPress,
  FingeringRendererId,
  ResolvedInstrumentFingeringChart,
} from '../types/fingering';
import { lookupInstrumentFingeringChart } from '../data/fingeringCharts';

interface FingeringChartProps {
  instrument: InstrumentProfile;
  note: NamedNote | null;
}

function renderFilledPathsSvg(svgMarkup: string, keyPresses: FingeringKeyPress[]): string {
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const activePathIds = new Set(
    keyPresses
      .filter((keyPress) => keyPress.state !== 'half')
      .map((keyPress) => keyPress.pathId),
  );
  const svgRoot = svgDocument.documentElement;

  svgRoot.removeAttribute('width');
  svgRoot.removeAttribute('height');
  svgRoot.setAttribute('class', 'fingering-chart-svg');
  svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  svgDocument.querySelectorAll<SVGPathElement>('path[id]').forEach((pathElement) => {
    pathElement.setAttribute('fill', activePathIds.has(pathElement.id) ? '#000' : 'none');
    pathElement.setAttribute('data-active', activePathIds.has(pathElement.id) ? 'true' : 'false');
  });

  return new XMLSerializer().serializeToString(svgRoot);
}

const FINGERING_RENDERERS: Record<
  FingeringRendererId,
  (chart: ResolvedInstrumentFingeringChart) => string
> = {
  'filled-paths': ({ svgMarkup, keyPresses }) => renderFilledPathsSvg(svgMarkup, keyPresses),
};

export function FingeringChart({ instrument, note }: FingeringChartProps) {
  const resolvedChart = note ? lookupInstrumentFingeringChart(instrument.id, note) : null;
  const renderedChartMarkup = resolvedChart
    ? FINGERING_RENDERERS[resolvedChart.renderer](resolvedChart)
    : null;

  return (
    <div className="note-card fingering-card" data-testid="fingering-chart-shell">
      <p className="label note-card-label">Fingering</p>
      {renderedChartMarkup ? (
        <div
          className="fingering-chart-render"
          data-testid="fingering-chart-render"
          aria-label={`${instrument.label} fingering for ${note?.display ?? ''}`}
          dangerouslySetInnerHTML={{ __html: renderedChartMarkup }}
        />
      ) : (
        <div className="fingering-chart-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
