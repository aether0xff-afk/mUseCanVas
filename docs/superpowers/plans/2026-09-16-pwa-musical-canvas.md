# mUseCanVas PWA Musical Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy an iPad-first four-bar musical drawing canvas as an installable GitHub Pages PWA.

**Architecture:** The canvas stores world-space strokes as the source of truth. Canvas 2D renders drawing and playhead visuals, while a separate native Web Audio engine handles live Pencil sound and scheduled four-bar playback. Pointer Events route pen/mouse to drawing and touch to viewport navigation. The shipped app is a zero-dependency ES-module PWA so GitHub Pages can serve it without a build step and iPad Safari can cache it offline reliably.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, Canvas 2D, Pointer Events, native Web Audio API, Service Worker, Web App Manifest, Node built-in test runner, GitHub Actions, GitHub Pages

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
- The app must work correctly from the repository sub-path `/mUseCanVas/`.
- PWA must be installable and work offline after the first successful load.
- No runtime CDN or package-manager dependency is allowed.

---

### Task 1: Pure Music Mapping, Transport, and Viewport Math

**Files:**
- Create: `src/music.js`
- Create: `src/viewport.js`
- Create: `tests/music.test.mjs`
- Create: `tests/viewport.test.mjs`

**Interfaces:**
- `getLoopDurationSeconds(bpm): number`
- `getLoopPhase(contextTime, startTime, bpm): number`
- `worldXToLoopSeconds(x, bpm): number`
- `midiToFrequency(midi): number`
- `applyScaleAttraction(midi, settings): number`
- `screenToWorld(point, viewport, size)` and `worldToScreen(point, viewport, size)`.

- [ ] Write failing Node tests for four-bar duration, wraparound phase, chromatic frequency, smooth scale attraction, and reversible viewport transforms.
- [ ] Run `node --test tests/*.test.mjs` and confirm missing-module failures.
- [ ] Implement the minimal pure modules.
- [ ] Run the tests and confirm all pass.

### Task 2: Stroke Geometry and Partial Erasing

**Files:**
- Create: `src/strokes.js`
- Create: `tests/strokes.test.mjs`

**Interfaces:**
- `appendPoint(stroke, point, minDistance)`
- `eraseStrokeSegments(strokes, eraserPoint, radius)`
- `sampleStrokeIntersections(strokes, x, tolerance)` returning every Y/pressure hit for polyphonic playback.

- [ ] Add failing tests for point decimation, self-intersection playback, and partial erasing that preserves untouched segments.
- [ ] Run the focused test and confirm failure.
- [ ] Implement geometry helpers.
- [ ] Run all tests and refactor only while green.

### Task 3: Static PWA Shell and Luminous Glass UI

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `manifest.webmanifest`
- Create: `icon.svg`
- Create: `sw.js`

**Interfaces:**
- Provides the full-screen canvas, bottom control pill, top-right undo/redo/settings controls, settings sheet, and installable offline metadata.

- [ ] Add semantic markup with canvas and all required controls.
- [ ] Add the near-black blue-violet Luminous Glass visual system, touch-safe controls, responsive iPad landscape/portrait behavior, and safe-area handling.
- [ ] Add relative-path manifest and service worker caching so deployment works below `/mUseCanVas/`.
- [ ] Validate JavaScript syntax with `node --check sw.js` and inspect all URLs for relative paths.

### Task 4: Web Audio Engine and Musical Canvas Interaction

**Files:**
- Create: `src/audio.js`
- Create: `src/app.js`

**Interfaces:**
- `AudioEngine` owns AudioContext, live oscillator voice, master graph, loop look-ahead scheduler, and polyphonic transient voices.
- `app.js` owns app state, pointer routing, canvas rendering, viewport gestures, history, and controls.

- [ ] Implement `AudioEngine` with user-gesture resume, oscillator/filter/gain chain, safe master dynamics, live pitch/velocity updates, and short look-ahead loop scheduling.
- [ ] Implement Pencil/mouse real-time strokes, Pencil pressure velocity, fixed mouse velocity, live sound independent of transport, committed-stroke looping, and multi-Y polyphony.
- [ ] Implement touch-only one-finger pan and two-finger pinch zoom without drawing.
- [ ] Implement partial eraser, undo/redo, clear, BPM 40–240, key selection, scale/chromatic mode, waveform and ambience settings.
- [ ] Render minimal bar hints, glowing strokes, and a smooth looping playhead.
- [ ] Run `node --check src/*.js` and `node --test tests/*.test.mjs`.

### Task 5: Documentation and GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `README.md`

**Interfaces:**
- Pushes to `main` run tests, stage the static PWA, upload a Pages artifact, and deploy it.

- [ ] Add GitHub Pages workflow using official Pages actions and required permissions.
- [ ] Document the live URL, iPad/Pencil controls, PWA installation, desktop fallback, and local static-server usage.
- [ ] Run a local static integrity check: tests, JS syntax checks, required-file existence, and relative URL scan.

### Task 6: Review, Merge, and Live Verification

- [ ] Push all implementation files to `feature/pwa-musical-canvas`.
- [ ] Open a PR to `main` and review the full diff for spec coverage, accidental absolute paths, unsafe audio scheduling, and touch/Pencil routing mistakes.
- [ ] Merge after verification.
- [ ] Inspect the GitHub Actions Pages run and fix any deployment failure.
- [ ] Verify the published URL responds and contains the PWA manifest/service worker references.
