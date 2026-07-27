# Audio Waveform & Tone Generator

An interactive browser-based synthesiser that lets you generate and visualise audio waveforms using the Web Audio API.

## Features

- **4 Wave Types** — Sine, Square, Sawtooth, and Triangle
- **Frequency Control** — adjust pitch from 20 Hz to 2000 Hz via slider
- **Volume Control** — set output level from 0% to 100%
- **Real-time Oscilloscope** — waveform visualisation using AnalyserNode on Canvas
- **Piano Keyboard** — play notes C4 to B4 by clicking keys or using keyboard shortcuts
- **Keyboard Shortcuts** — Space (play/stop), 1–4 (wave types), A–J (piano keys)

## How to Use

1. Open `index.html` in a browser (use a local server for best results).
2. Select a wave type (Sine / Square / Sawtooth / Triangle).
3. Adjust frequency and volume using the sliders.
4. Click **Play** to hear the continuous tone.
5. Click individual **piano keys** to play specific notes.
6. Watch the waveform oscilloscope update in real time.

### Keyboard Shortcuts

| Key   | Action        |
| ----- | ------------- |
| Space | Play / Stop   |
| 1     | Sine wave     |
| 2     | Square wave   |
| 3     | Sawtooth wave |
| 4     | Triangle wave |
| A     | Play C4       |
| S     | Play D4       |
| D     | Play E4       |
| F     | Play F4       |
| G     | Play G4       |
| H     | Play A4       |
| J     | Play B4       |

## Dependencies

None. Uses only native browser APIs (Web Audio API, Canvas API).

## Credits

Built with the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
