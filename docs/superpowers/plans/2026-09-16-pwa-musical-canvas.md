# mUseCanVas PWA Musical Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy an iPad-first four-bar musical drawing canvas as a React/TypeScript PWA on GitHub Pages.

**Architecture:** The canvas stores world-space strokes as the source of truth. Canvas 2D renders drawing and playhead visuals, while a separate Web Audio engine handles live Pencil sound and a look-ahead scheduled four-bar loop. Pointer Events route pen/mouse to drawing and touch to viewport navigation. GitHub Actions builds and deploys the static Vite app to GitHub Pages.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Canvas 2D, Pointer Events, native Web Audio API, vite-plugin-pwa, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-09-16-muse-canvas-design.md`

## Global Constraints

- iPad/Safari is the reference interaction target.
- Apple Pencil draws; finger gestures never create strokes.
- Mouse draws with fixed velocity.
- One canvas only; no tracks or layers.
- Four bars are fixed and loop continuously while transport is running.
- X maps continuously to loop time with no rhythmic snapping.
- Y maps to continuous pitch; scale mode uses smooth attraction rather than hard quantization.
- Partial eraser removes only touched geometry.
- Rendering and audio timing remain independent.
- GitHub Pages deployment must work under the repository sub-path `/mUseCanVas/`.
- PWA must be installable and work offline after the first successful load.

---

### Task 1: Project Shell, Tests, and PWA Build

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `public/icon.svg`

**Interfaces:**
- Produces a Vite React app with `npm test`, `npm run build`, and PWA manifest/service-worker generation.

- [ ] Write a failing smoke test asserting the app title and primary controls render.
- [ ] Run Vitest and confirm failure before `App` implementation exists.
- [ ] Add the minimal React shell, PWA plugin configuration, icon, and global luminous-glass styling.
- [ ] Run tests and build; verify both pass and `dist/manifest.webmanifest` exists.
- [ ] Commit with `feat: scaffold musical canvas PWA`.

### Task 2: Pure Music Mapping and Viewport Math

**Files:**
- Create: `src/music/types.ts`
- Create: `src/music/mapping.ts`
- Create: `src/music/mapping.test.ts`
- Create: `src/canvas/viewport.ts`
- Create: `src/canvas/viewport.test.ts`

**Interfaces:**
- Produces `worldXToLoopSeconds(x, bpm): number`.
- Produces `worldYToFrequency(y, viewport, pitchSettings): number`.
- Produces `applyScaleAttraction(midi, settings): number`.
- Produces screen/world transform helpers used by the drawing surface.

- [ ] Add failing tests for four-bar timing, chromatic mapping, smooth scale attraction, and reversible viewport transforms.
- [ ] Run the focused tests and confirm expected failures.
- [ ] Implement only the pure functions needed to pass them.
- [ ] Run focused and full tests.
- [ ] Commit with `feat: add pitch timing and viewport mapping`.

### Task 3: Stroke Geometry and Partial Erasing

**Files:**
- Create: `src/canvas/strokes.ts`
- Create: `src/canvas/strokes.test.ts`

**Interfaces:**
- Produces `StrokePoint`, `Stroke`, `appendPoint`, `decimateStroke`, `eraseStrokeSegments`, and `sampleStrokeIntersections`.
- `sampleStrokeIntersections(strokes, x, tolerance)` returns every Y/pressure intersection for polyphonic playback.

- [ ] Add failing tests for point decimation, self-intersection playback, and partial erasing that splits geometry without deleting untouched segments.
- [ ] Verify tests fail for missing behavior.
- [ ] Implement geometry helpers.
- [ ] Run tests and refactor while green.
- [ ] Commit with `feat: add stroke geometry and partial eraser`.

### Task 4: Audio Engine and Four-Bar Transport

**Files:**
- Create: `src/audio/transport.ts`
- Create: `src/audio/transport.test.ts`
- Create: `src/audio/AudioEngine.ts`

**Interfaces:**
- Produces pure `getLoopDurationSeconds(bpm)`, `getLoopPhase(contextTime, startTime, bpm)`, and `phaseToWorldX(phase)`.
- `AudioEngine` exposes `resume()`, `startLiveVoice()`, `updateLiveVoice()`, `stopLiveVoice()`, `startLoop()`, `stopLoop()`, `setBpm()`, and `dispose()`.

- [ ] Add failing pure tests for loop duration and wraparound phase behavior.
- [ ] Verify the tests fail.
- [ ] Implement transport math, then the browser-only Web Audio engine with oscillator, gain envelope, low-pass filter, master limiter, and short look-ahead loop scheduling.
- [ ] Run unit tests and TypeScript build.
- [ ] Commit with `feat: add synth audio engine and loop transport`.

### Task 5: iPad-First Musical Drawing Canvas

**Files:**
- Create: `src/canvas/DrawingCanvas.tsx`
- Create: `src/canvas/useCanvasRenderer.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- `DrawingCanvas` receives strokes, tool mode, transport phase, viewport, musical settings, and callbacks for stroke commits/eraser mutations/live audio.
- Pen and mouse events draw; touch events update viewport only.

- [ ] Add component-level tests for pointer routing where feasible with synthetic PointerEvents.
- [ ] Verify a pen/mouse-vs-touch routing test fails before implementation.
- [ ] Implement real-time draft rendering, committed glowing strokes, playhead, minimal four-bar hints, Pencil pressure width, mouse fixed velocity, one-finger pan, and two-finger zoom.
- [ ] Integrate live audio independent of the loop transport.
- [ ] Run tests and production build.
- [ ] Commit with `feat: add iPad musical drawing canvas`.

### Task 6: Controls, Scale Settings, Undo/Redo, and Offline UX

**Files:**
- Modify: `src/App.tsx`
- Create: `src/ui/ControlPill.tsx`
- Create: `src/ui/SettingsPanel.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Bottom pill exposes Play/Pause, BPM, Key, Scale/Chromatic, Draw/Eraser, Clear.
- Top-right controls expose Undo/Redo/Settings.

- [ ] Add failing UI tests for play state, BPM bounds, mode toggles, and clear/undo/redo behavior.
- [ ] Verify expected failures.
- [ ] Implement state transitions and the luminous-glass responsive UI with touch-safe hit areas.
- [ ] Verify PWA install metadata and offline precache output during build.
- [ ] Run full test/build suite.
- [ ] Commit with `feat: finish musical canvas controls and PWA UX`.

### Task 7: GitHub Pages Deployment and Acceptance Verification

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `README.md`

**Interfaces:**
- Pushes to `main` build and deploy `dist` to GitHub Pages using official Pages actions.
- README documents the live URL, local commands, iPad controls, and PWA install steps.

- [ ] Add workflow YAML with Node setup, `npm ci`, tests, build, Pages artifact upload, and Pages deployment.
- [ ] Run local `npm ci`, `npm test`, and `npm run build` from a clean checkout-equivalent directory.
- [ ] Verify generated HTML/assets use `/mUseCanVas/` base paths and PWA manifest/service worker are present.
- [ ] Open a PR from `feature/pwa-musical-canvas` to `main`, review its diff, and merge only after verification.
- [ ] Inspect the GitHub Actions deployment run and verify the live Pages URL responds successfully.
