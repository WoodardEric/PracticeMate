import { render, screen, waitFor } from '@testing-library/react';
import { midiToNote } from '../utils/note';
import { StaffNote } from './StaffNote';

vi.mock('./vexflowLoader', () => {
  class MockContext {
    svg: SVGSVGElement;

    constructor(svg: SVGSVGElement) {
      this.svg = svg;
    }

    scale(): void {}
  }

  class MockRenderer {
    context: MockContext;

    constructor(element: HTMLDivElement) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      element.appendChild(svg);
      this.context = new MockContext(svg);
    }

    resize(width: number, height: number): void {
      this.context.svg.setAttribute('width', String(width));
      this.context.svg.setAttribute('height', String(height));
    }

    getContext(): MockContext {
      return this.context;
    }
  }

  class MockAccidental {
    symbol: string;

    constructor(symbol: string) {
      this.symbol = symbol;
    }
  }

  class MockStave {
    x: number;
    width: number;
    clefModifiers: Array<{ setStyle: (style: unknown) => void }>;

    constructor(x: number, _y: number, width: number) {
      this.x = x;
      this.width = width;
      this.clefModifiers = [];
    }

    setBegBarType(): this {
      return this;
    }

    setEndBarType(): this {
      return this;
    }

    addClef(): this {
      this.clefModifiers.push({
        setStyle: () => undefined,
      });

      return this;
    }

    getBoundingBox() {
      return {
        getH: () => 64,
      };
    }

    setStyle(): this {
      return this;
    }

    setConfigForLines(): this {
      return this;
    }

    getNumLines(): number {
      return 5;
    }

    getModifiers(_position?: number, category?: string) {
      return category === 'Clef' ? this.clefModifiers : [];
    }

    setContext(): this {
      return this;
    }

    draw(): this {
      return this;
    }

    getNoteStartX(): number {
      return 28;
    }

    getX(): number {
      return this.x;
    }

    getWidth(): number {
      return this.width;
    }
  }

  class MockStaveNote {
    key: string;
    modifiers: MockAccidental[];
    context: MockContext | null;
    x: number;

    constructor({ keys }: { keys: string[] }) {
      this.key = keys[0];
      this.modifiers = [];
      this.context = null;
      this.x = 0;
    }

    addModifier(modifier: MockAccidental): this {
      this.modifiers.push(modifier);
      return this;
    }

    setStyle(): this {
      return this;
    }

    setStemStyle(): this {
      return this;
    }

    setLedgerLineStyle(): void {}

    setKeyStyle(): this {
      return this;
    }

    getGlyphWidth(): number {
      return 22;
    }

    setStave(): this {
      return this;
    }

    setContext(context: MockContext): this {
      this.context = context;
      return this;
    }

    drawWithStyle(): this {
      this.draw();
      return this;
    }

    draw(): void {
      if (!this.context) {
        throw new Error('No context');
      }

      const noteElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      noteElement.setAttribute('data-note-key', this.key);
      noteElement.setAttribute('data-note-x', String(this.x));
      this.context.svg.appendChild(noteElement);

      this.modifiers.forEach((modifier) => {
        const accidentalElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        accidentalElement.setAttribute('data-accidental', modifier.symbol);
        this.context?.svg.appendChild(accidentalElement);
      });
    }
  }

  class MockTickContext {
    note: MockStaveNote | null;

    constructor() {
      this.note = null;
    }

    addTickable(note: MockStaveNote): this {
      this.note = note;
      return this;
    }

    preFormat(): this {
      return this;
    }

    setX(x: number): this {
      if (this.note) {
        this.note.x = x;
      }

      return this;
    }
  }

  return {
    loadVexflow: async () => ({
      Accidental: MockAccidental,
      BarlineType: { NONE: 0 },
      Metrics: {
        get: () => 0,
      },
      Renderer: Object.assign(MockRenderer, {
        Backends: {
          SVG: 'svg',
        },
      }),
      Stave: MockStave,
      StaveNote: MockStaveNote,
      TickContext: MockTickContext,
    }),
  };
});

describe('StaffNote', () => {
  beforeEach(() => {
    class MockResizeObserver {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }

    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 340;
      },
    });
  });

  afterEach(() => {
    delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  });

  it('shows empty guidance when no note is available', () => {
    render(<StaffNote note={null} clef="treble" />);

    expect(
      screen.getByText('Start the tuner and play a steady pitch to see the note on the staff.'),
    ).toBeInTheDocument();
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders an svg note and accidental for a sharp pitch', async () => {
    const { container } = render(<StaffNote note={midiToNote(66, 'sharp')} clef="treble" />);

    await waitFor(() => {
      expect(container.querySelector('.staff-render svg')).toBeInTheDocument();
    });

    expect(container.querySelector('.staff-render')).toHaveAttribute(
      'aria-label',
      'F\u266F4 on treble clef staff',
    );
    expect(container.querySelector('[data-note-key="f/4"]')).toBeInTheDocument();
    expect(container.querySelector('[data-accidental="#"]')).toBeInTheDocument();
  });
});
