# AGENTS.md

## Project Overview

PracticeMate is an educational music teaching tool built with React and TypeScript, using Vite as the build tool and pnpm as the package manager.

The goal is clarity, usability, and maintainability over cleverness or abstraction-heavy architecture.

Favor readable code and straightforward implementations.

---

## Project Structure

```text
src/
|- components/   # React UI components (flat files, one component per file)
|- data/         # Static data, constants, and seed content
|- hooks/        # Custom React hooks
|- test/         # Test setup and global test config only
|- types/        # Shared TypeScript types and interfaces
`- utils/        # Pure utility functions (no React, no side effects)
```

**Rules:**
- Components live as flat files directly in `components/` - no per-component subfolders.
  - `components/Metronome.tsx`
  - `components/Metronome/Metronome.tsx`
- Tests live next to the file they test, not in the `test/` folder.
  - `components/MetronomePanel.test.tsx`
  - `utils/note.test.ts`
- The `test/` folder is for setup and configuration only (e.g. `setup.ts`).
- Types shared across multiple files belong in `types/`. Types used only inside one file can be defined locally.
- Utility functions in `utils/` must be pure - no React imports, no side effects, no component logic.

---

## TypeScript Guidelines

- Use strict TypeScript typing throughout.
- Avoid `any` unless there is a strong justification; leave a comment explaining why if you use it.
- Prefer explicit types for component props, hook return values, and anything in `types/`.
- Name props interfaces after the component: `TunerPanelProps`, `MetronomePanelProps`.
- Keep types simple and readable. If a type definition needs a comment to explain it, consider simplifying the structure.

---

## Naming

Use descriptive variable and function names. Prefer clarity over brevity.

**Variables and state:**

| Good | Avoid |
| --- | --- |
| `selectedInstrumentId` | `x`, `tmp`, `d`, `obj` |
| `accidentalPreference` | Single letters except loop indices (`i`, `j`) |
| `isMetronomeRunning` | Vague abbreviations |

**Functions:**
- Event handlers: `handleTempoChange`, `handlePlayToggle`
- Boolean-returning: `isValidNote`, `hasActiveSession`
- Pure helpers (top of component file): `formatFrequency`, `centsClass`, `indicatorLeft`

**Components:** PascalCase. `TunerPanel`, `MetronomePanel`, `StaffNote`, `StatusBanner`.

**Hooks:** Prefix with `use`. `useTuner`, `useMetronome`.

---

## Application Architecture

All application state lives in `App.tsx`. This is intentional - the component tree is shallow and there is no prop drilling problem.

```text
App.tsx                  <- owns all state, calls all hooks
|- StatusBanner         <- receives permission + isRunning
|- TunerPanel           <- receives pitchState, instrument, accidental preference
`- MetronomePanel       <- receives settings, all setter functions
```

**Do not introduce React Context** unless the tree genuinely grows deep enough that props must pass through intermediate components that do not use them. The current architecture does not need it. Do not introduce external state libraries (Zustand, Redux, Jotai, etc.) without explicit discussion.

`App.tsx` calls `useTuner` and `useMetronome` and passes their return values directly to the relevant panel components. This is the correct pattern - hooks own logic, panels own layout, `App` connects them.

---

## Component Guidelines

- Use functional components with hooks. No class components.
- Define props as an explicit interface directly above the component.
- Keep components focused. If a component is doing more than one clear job, consider splitting it.
- Pure display logic (formatting, class name derivation, geometry calculations) belongs in plain helper functions at the top of the file, not inline in JSX.

```tsx
// Good - helper function at the top, clean JSX below
function formatFrequency(frequencyHz: number | null): string {
  return frequencyHz ? `${frequencyHz.toFixed(1)} Hz` : 'Waiting';
}

export function FrequencyDisplay({ frequencyHz }: FrequencyDisplayProps) {
  return <strong>{formatFrequency(frequencyHz)}</strong>;
}

// Avoid - logic inline in JSX
export function FrequencyDisplay({ frequencyHz }: FrequencyDisplayProps) {
  return <strong>{frequencyHz ? `${frequencyHz.toFixed(1)} Hz` : 'Waiting'}</strong>;
}
```

---

## Hooks

Custom hooks in `hooks/` encapsulate one complex concern each and expose a clean, simple interface to components. The existing hooks are good examples of this pattern:

- `useTuner` - owns the entire audio pipeline: microphone access, Web Audio graph, pitch detection loop, and cleanup. Returns `{ pitchState, start, stop }`.
- `useMetronome` - owns the scheduling engine: Web Audio context, lookahead scheduler, beat timing. Returns `{ settings, start, stop, setBpm, setTimeSignature, setAccentEnabled, setVolume }`.

**Rules:**
- Hooks return explicitly typed objects, not bare values.
- A hook that is only used by one component still belongs in `hooks/` - it keeps the component file thin and the logic independently testable.
- Do not reach into Context from a hook unless that is its stated purpose.

### The ref escape hatch pattern

Both `useTuner` and `useMetronome` use this pattern - do not remove or "clean up" these refs:

```ts
const settingsRef = useRef(settings);
useEffect(() => {
  settingsRef.current = settings;
}, [settings]);
```

This exists because `setInterval` and `requestAnimationFrame` callbacks close over stale values from when they were created. Reading from `someRef.current` inside a callback guarantees access to the latest value. This is intentional and correct.

### Audio context lifecycle

`useTuner` and `useMetronome` manage their Web Audio contexts differently on purpose:

- `useTuner` closes its `AudioContext` on stop - mic access is released entirely.
- `useMetronome` suspends its `AudioContext` on stop - the context is reused on next start, which is cheaper than reconstructing it.

Do not make these consistent with each other. The difference is intentional.

---

## Testing

This project uses Vitest and `@testing-library/react`.

Global test setup lives in `test/setup.ts`. Do not add test files to the `test/` folder - they go next to their source files.

**When to write tests:**
- All utility functions in `utils/` should have tests.
- New hooks should have tests covering their core behavior.
- Components: write tests for meaningful interactions or conditional rendering. Do not test that React renders correctly - test that your logic works.

**When not to write tests:**
- Do not write tests for pure presentational components with no logic.
- Do not write snapshot tests.

**What makes a good test:**
- Tests behavior, not implementation. If you rename an internal variable, the test should not break.
- Has a descriptive name: `"disables the play button when tempo is out of range"`, not `"renders correctly"`.
- Covers the realistic ways a user or other code would interact with the thing.

---

## Dependencies

- Package manager is pnpm. Use `pnpm add` - never `npm install` or `yarn add`.
- Do not add new dependencies without explicitly proposing them first and getting approval. Many things can be solved with a small utility function instead.
- If you believe a dependency is the right call, say which package, why, and what the alternative would be.

---

## Change Discipline

- Make the minimal change to accomplish the task. Do not refactor things you were not asked to touch.
- If you notice something unrelated that should be fixed, mention it as a separate suggestion rather than fixing it inline.
- Do not reorganize file structure, rename files, or move things between folders unless explicitly asked.
- If a task is ambiguous, especially one that touches audio lifecycle or component architecture, stop and ask rather than guessing.

---

## UI Philosophy

PracticeMate is an educational tool. Users may be students, beginners, or non-technical musicians. Interfaces should feel approachable and understandable.

**Favor:**
- Clear labeling - controls should say what they do
- Readable layouts - do not make users hunt for things
- Predictable interactions - no clever surprises

**Avoid:**
- Overly flashy or animated UI behavior
- Jargon in labels or error messages
- Interactions that behave differently than a user would expect
