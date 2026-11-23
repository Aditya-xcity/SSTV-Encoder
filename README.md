# SSTV Encoder

Convert a photo into sound in your browser, then reconstruct it on an Android phone with Robot36. Slow-scan television (SSTV) encodes an image as a sequence of audio tones. This project uses Martin M1 and exports a 320 × 256 image as a 16-bit, 11,025 Hz mono WAV. Encoding runs locally in the browser and requires no dependencies.

## Run locally

1. Clone this repository or download and extract the source ZIP from GitHub.
2. Open `index.html` in a modern browser. Keep `sstv.js` in the same folder.
3. Choose a JPG or PNG. The preview preserves the image’s aspect ratio and fills the unused space with black.
4. Select **Generate SSTV WAV**, then play the result or select **Download WAV**.

## Test with Robot36 on Android

1. Generate a WAV on a computer. For a first test, choose a bright image with large colored shapes so changes in color or alignment are easy to spot.
2. Open **Robot36** on your Android phone and grant microphone access. Use automatic mode detection if available, or select **Martin M1** manually.
3. Put the phone microphone near the computer speaker. Start playback from the beginning at moderate volume so Robot36 can hear the mode-identification tones.
4. Let the full transmission play for roughly 115 seconds. Check that Robot36 reconstructs the preview, including its colors and framing, from top to bottom.

If the decoder fails to lock, replay from the start in a quiet room, move the microphone closer, and turn off audio enhancements. If the image looks noisy or distorted, try adjusting the speaker volume and check that playback is at normal speed.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Image picker, preview, encoding controls, playback, and WAV download |
| `sstv.js` | Martin M1 tone generation and PCM WAV serialization |
