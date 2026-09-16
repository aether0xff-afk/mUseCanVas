# mUseCanVas

An iPad-first musical drawing canvas. Draw luminous lines with Apple Pencil and hear them become a continuously looping four-bar phrase.

## Live app

After GitHub Pages is enabled for this repository, the app is published at:

**https://aether0xff-afk.github.io/mUseCanVas/**

## Interaction

- **Apple Pencil:** draw. Pressure controls line width and musical velocity.
- **Finger:** one-finger pan; two-finger pinch zoom. Finger touches never draw notes.
- **Mouse:** draw with fixed velocity.
- **Draw / Erase:** the eraser removes only the touched part of a stroke.
- **Play:** starts or pauses the continuous four-bar loop.
- **X position:** time inside the four-bar loop.
- **Y position:** continuous pitch.
- **Scale mode:** gently attracts pitch toward the selected key/scale while remaining continuous.
- **Chromatic mode:** leaves pitch fully continuous.
- A stroke that crosses the same X position multiple times can play several pitches at once.

The most recent canvas is saved locally in the browser. No account or server is required.

## PWA installation on iPad

1. Open the live app in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Launch `mUseCanVas` from the Home Screen for the full-screen standalone experience.

The service worker caches the app shell after the first successful load, so the installed canvas can reopen offline.

## Local development

No package installation or build step is required. Serve the repository with any static HTTP server, for example:

```bash
python -m http.server 8080
```

Run tests with `node --test tests/*.test.mjs`.

## Architecture

- `src/app.js` — app state, Canvas 2D rendering, Pencil/touch/mouse routing, history and controls
- `src/audio.js` — Web Audio live synth and look-ahead loop scheduler
- `src/music.js` — four-bar timing, MIDI/frequency mapping and smooth scale attraction
- `src/strokes.js` — stroke geometry, multi-intersection playback sampling and partial erasing
- `src/viewport.js` — pan/zoom transforms
- `sw.js` + `manifest.webmanifest` — offline/installable PWA shell

The stroke geometry remains the source of truth; mUseCanVas does not convert the drawing into a conventional piano-roll note list.
