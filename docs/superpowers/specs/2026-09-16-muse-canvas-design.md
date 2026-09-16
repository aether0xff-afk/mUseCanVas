# mUseCanVas — iPad-first musical drawing canvas

Date: 2026-09-16
Status: approved concept, pre-implementation design

## 1. Product idea

mUseCanVas is an iPad-first web instrument where the user draws directly on a nearly empty canvas and the drawing itself becomes a looping musical phrase.

The app should feel like a luminous sketchbook or playable artwork rather than a DAW. The canvas is the primary interface; controls stay visually quiet and secondary.

## 2. Primary interaction

### Input model

- Apple Pencil is the primary drawing input on iPad.
- Finger input is reserved for viewport pan and pinch zoom.
- Mouse input is supported on desktop.
- Mouse velocity is fixed.
- Apple Pencil pressure controls musical velocity and visible stroke thickness.

### Drawing behavior

- A stroke appears continuously while the Pencil/mouse moves; it is never deferred until pointer-up.
- While drawing, the current pointer position produces live sound immediately, independently from the loop transport.
- When the pointer is released, the stroke becomes part of the looping canvas.
- Editing is intentionally minimal: there is no selection/transform tool.
- Eraser removes only the touched portions of a stroke rather than deleting the whole stroke.

## 3. Musical mapping

### Time

- The canvas represents a fixed four-bar loop.
- Horizontal position maps continuously to time inside those four bars.
- There is no rhythmic snapping.
- A subtle playhead continuously sweeps left to right while transport is running.
- Existing strokes are read by the playhead and loop indefinitely.
- Live drawing sound is independent of the playhead.

### Pitch

- Vertical position maps to continuous pitch.
- Two pitch modes are available:
  1. Scale mode (default)
  2. Chromatic mode
- In scale mode, pitch is attracted smoothly toward notes in the selected key/scale rather than hard-quantized into discrete steps.
- The rendered stroke shape is not geometrically snapped or rewritten.
- If a stroke intersects the same X coordinate at multiple Y positions, all corresponding pitches may sound simultaneously. This allows a single stroke to create harmony.

### Velocity

- Apple Pencil pressure maps to velocity.
- Visual stroke width follows the resulting velocity.
- Mouse input uses a constant velocity.

## 4. Canvas and navigation

- One single musical canvas; no tracks or layers in v1.
- The interface is nearly gridless.
- Only minimal structural hints should remain visible, such as faint four-bar boundaries and the playhead.
- Vertical and horizontal zoom are both supported.
- Finger gestures on iPad:
  - one-finger pan
  - two-finger pinch zoom
- Apple Pencil continues to draw while finger gestures remain navigation-only.
- Initial viewport should show approximately two octaves vertically and all four bars horizontally.

## 5. Transport

- Initial state is stopped.
- Pressing Play starts the four-bar loop.
- Once started, the transport repeats continuously until paused.
- BPM is user-adjustable with a simple control; no tap-tempo in v1.
- Suggested initial BPM range: 40–240 BPM.

## 6. Audio engine

Use the native Web Audio API.

### Synthesis

- Oscillator-based polyphonic synth.
- Initial oscillator options may include sine, triangle, sawtooth, and square.
- Basic amplitude envelope.
- Optional lightweight low-pass filter and ambience/reverb if performance permits.

### Live voice

During drawing, a live voice follows the pointer path continuously and responds to Pencil pressure.

### Loop voices

Committed strokes are sampled by transport time. At each playhead X position, every active Y intersection can contribute a simultaneous voice.

The audio engine must avoid scheduling directly from animation frames. Rendering and audio timing are separate; audio scheduling uses AudioContext time with a short look-ahead scheduler so looping remains stable on iPad/Safari.

## 7. Stroke data model

The stroke remains the source of truth; the project is not converted into a conventional MIDI-note list internally.

Suggested model:

```ts
interface StrokePoint {
  x: number;       // normalized canvas/world X
  y: number;       // normalized canvas/world Y
  pressure: number; // 0..1
  t: number;       // capture timestamp, useful for live rendering/cleanup
}

interface Stroke {
  id: string;
  points: StrokePoint[];
}
```

Coordinates should be stored in world space rather than screen pixels so zoom/pan never modifies musical content.

Partial erasing splits or clips stroke geometry while preserving the remaining portions.

## 8. Architecture

Recommended stack:

- React
- TypeScript
- Vite
- Canvas 2D
- Pointer Events
- Web Audio API
- PWA metadata/service worker after core interaction is stable

### Main modules

#### `DrawingCanvas`

Responsibilities:
- Canvas rendering
- Pencil/mouse stroke capture
- finger pan/zoom gesture handling
- live draft stroke rendering
- committed stroke rendering
- partial eraser interaction
- playhead rendering

#### `StrokeEngine`

Responsibilities:
- world/screen coordinate transforms
- X-to-loop-time mapping
- Y-to-pitch mapping
- smooth scale attraction
- pressure-to-velocity mapping
- stroke sampling/intersection queries for playback
- eraser geometry operations

#### `AudioEngine`

Responsibilities:
- AudioContext lifecycle
- synth voice creation
- live drawing voice
- polyphonic loop playback
- envelope/filter graph
- master gain and safety limiting

#### `Transport`

Responsibilities:
- play/pause
- BPM
- four-bar phase
- stable AudioContext-based timing
- visual playhead phase exposure

#### `AppState`

Small centralized state only for settings and stroke collection. Avoid a heavy state library in v1 unless interaction complexity proves it necessary.

## 9. Visual design

Design direction: **Luminous Glass**.

### Principles

- Canvas occupies roughly 90%+ of the visual attention.
- Near-black, slightly blue-violet background.
- Very limited chrome.
- Strokes glow softly without becoming neon-noisy.
- Pitch can subtly influence stroke hue/brightness.
- Higher velocity appears thicker and slightly brighter.
- The segment currently touched by the playhead may briefly bloom/glow.
- Motion uses soft fade/slide transitions rather than bouncy UI animation.

### Main controls

A compact translucent pill floats near the bottom center.

Primary controls:
- Play / Pause
- BPM
- Key
- Scale / Chromatic
- Draw / Eraser
- Clear

Secondary controls in a subtle top-right cluster:
- Undo
- Redo
- Settings

Export is not required for the first functional milestone and should not block drawing/audio quality.

## 10. iPad-specific requirements

- Safari/iPadOS is the reference browser for input behavior and performance.
- `touch-action` and Pointer Event handling must prevent finger gestures from accidentally drawing.
- Distinguish `pointerType === "pen"`, `"touch"`, and `"mouse"`.
- AudioContext must be created/resumed through a user gesture to satisfy Safari autoplay rules.
- Canvas resolution must account for devicePixelRatio without rendering excessive offscreen pixels when zoomed.
- Prevent page scrolling/bouncing while interacting with the instrument surface.
- Keep hit targets large enough for touch while visually maintaining a minimal interface.

## 11. Performance strategy

- Canvas 2D rather than SVG DOM paths.
- Keep rendering in requestAnimationFrame.
- Decimate overly dense pointer samples while preserving curvature.
- Cache committed stroke paths where useful.
- Separate audio scheduling from paint timing.
- Avoid creating/destroying excessive AudioNodes every frame; reuse or pool voices where practical.
- Use a master dynamics/limiter stage to reduce clipping when many simultaneous intersections occur.

## 12. Error and edge-case handling

- Audio unavailable/suspended: canvas remains usable and Play offers a clear resume action.
- Very dense harmony: cap maximum simultaneous voices and prefer graceful voice stealing over UI lockup.
- Rapid erase/draw alternation: state mutations remain atomic so a partial stroke cannot become corrupt.
- Window resize/orientation change: preserve world-space stroke coordinates and viewport center.
- Pointer cancellation: finalize or discard the active draft safely without corrupting committed strokes.

## 13. Testing strategy

### Unit tests

- coordinate transforms
- loop-time mapping
- pitch mapping
- scale attraction
- eraser segmentation
- transport phase calculations

### Interaction tests

- Pencil draws while finger does not
- finger pan/zoom works without modifying strokes
- mouse draws with fixed velocity
- partial eraser removes only touched geometry
- play/pause state remains stable across BPM changes

### Manual iPad acceptance tests

- Apple Pencil latency feels immediate
- pressure visibly and audibly changes velocity
- two-finger zoom/pan never creates notes
- four-bar loop remains rhythmically stable for several minutes
- dense self-intersecting strokes can create polyphony without severe crackle or UI hitching

## 14. Initial implementation milestones

1. Project shell and full-screen iPad canvas
2. Pointer routing (pen/touch/mouse) and world-space drawing
3. Pan/zoom viewport
4. Web Audio live drawing synth
5. Four-bar transport and playhead
6. Stroke-to-loop playback including multi-Y intersections
7. Scale/chromatic pitch mapping and smooth attraction
8. Partial eraser
9. Luminous Glass UI polish and settings controls
10. iPad performance/touch/audio hardening

## 15. Explicitly out of scope for v1

- Track/layer system
- Piano-roll editing
- selecting/moving/resizing strokes
- rhythmic quantization
- MIDI editor
- sample-based instruments
- collaboration/accounts/cloud sync
- full DAW mixer
- infinite timeline
- tap tempo

These can be reconsidered only after the core experience — drawing a line and immediately hearing a beautiful, stable four-bar musical loop — feels excellent.
