# PracticeMate

PracticeMate is a browser-based tuner and metronome for band and orchestra students. It is built with React, TypeScript, and Vite, and is designed to stay clear, approachable, and easy to maintain.

The app runs entirely in the browser. The tuner requests microphone access only when the user starts listening, and the metronome can run independently.

## Features

- Chromatic tuner with live pitch detection
- Instrument-aware written note display for transposing and concert-pitch instruments
- Staff notation rendering for the selected instrument
- Adjustable accidental preference for flat or sharp spellings
- Metronome with BPM, time signature, accent, and volume controls
- Status messaging for microphone permissions and active audio tools

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest
- Testing Library
- `pitchy` for pitch detection
- `vexflow` for staff notation

## Getting Started

### Prerequisites

- Node.js
- pnpm

### Install

```bash
pnpm install
```

### Run the app

```bash
pnpm dev
```

### Build for production

```bash
pnpm build
```

### Run tests

```bash
pnpm test:run
```

## Available Scripts

- `pnpm dev` starts the Vite development server
- `pnpm build` runs TypeScript compilation and creates a production build
- `pnpm preview` serves the production build locally
- `pnpm lint` runs ESLint
- `pnpm test` starts Vitest in watch mode
- `pnpm test:run` runs the test suite once

## Project Structure

```text
src/
|- components/   React UI components
|- data/         Static instrument data and seed content
|- hooks/        Audio and scheduling logic
|- test/         Global test setup only
|- types/        Shared TypeScript types
`- utils/        Pure utility functions
```

Application state is intentionally coordinated in `src/App.tsx`, with `useTuner` and `useMetronome` handling the main audio logic.

## Browser Notes

- The tuner requires microphone access and Web Audio support.
- If microphone permission is denied, the metronome still works.
- For the most accurate tuner behavior, use a modern desktop or mobile browser.

## Assets and Attribution

- Favicon: [public/favicon.ico](public/favicon.ico)
- Favicon attribution file: [public/favicon-attribution.txt](public/favicon-attribution.txt)
- Icon creator: [Freepik on Flaticon](https://www.flaticon.com/free-icons/quarter-note)
- Fingering chart SVGs: [src/assets/charts/](src/assets/charts/)
- Fingering chart attribution file: [src/assets/charts/attribution.txt](src/assets/charts/attribution.txt)
- Fingering chart creator: [Bret Pimentel](https://fingering.bretpimentel.com/)
- Fingering charts were downloaded from the Fingering Diagram Builder for this non-commercial educational open-source project and are licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
