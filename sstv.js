/* Martin M1 SSTV encoder. Standard 320x256, VIS 44.
   Browser-side PCM WAV generation, no dependencies. */
(() => {
  'use strict';
  const RATE = 11025;
  const WIDTH = 320, HEIGHT = 256;
  const MS = x => Math.round(x * RATE / 1000);
  function encode(imageData, onProgress) {
    const data = imageData.data;
    const total = MS(120000);
    const pcm = new Int16Array(total);
    let cursor = 0, phase = 0;
    const amplitude = 0.72 * 32767;
    function tone(frequency, durationMs) {
      const samples = MS(durationMs);
      const step = 2 * Math.PI * frequency / RATE;
      for (let i = 0; i < samples; i++) {
        if (cursor >= pcm.length) throw Error('Audio buffer exceeded');
        pcm[cursor++] = Math.round(Math.sin(phase) * amplitude);
        phase += step;
        if (phase >= 2 * Math.PI) phase -= 2 * Math.PI;
      }
    }
    function pixels(row, channel) {
      // 146.432ms across 320 samples, sample-accurate duration by segment boundaries.
      const segmentStart = cursor;
      const duration = MS(146.432);
      for (let x = 0; x < WIDTH; x++) {
        const value = data[(row * WIDTH + x) * 4 + channel];
        const freq = 1500 + value * 800 / 255;
        const target = segmentStart + Math.round((x + 1) * duration / WIDTH);
        const step = 2 * Math.PI * freq / RATE;
        while (cursor < target) {
          pcm[cursor++] = Math.round(Math.sin(phase) * amplitude);
          phase += step;
          if (phase >= 2 * Math.PI) phase -= 2 * Math.PI;
        }
      }
    }
    // VIS header: leader, break, leader, start, 7 LSB-first data bits,
    // even parity, stop. Martin M1 VIS code is 44.
    tone(1900, 300); tone(1200, 10); tone(1900, 300); tone(1200, 30);
    const vis = 44;
    let parity = 0;
    for (let i = 0; i < 7; i++) {
      const bit = (vis >> i) & 1;
      parity ^= bit;
      tone(bit ? 1100 : 1300, 30);
    }
    tone(parity ? 1100 : 1300, 30);
    tone(1200, 30);
    // Martin M1: 4.862ms sync, .572ms porch, G, separator, B,
    // separator, R, separator. Each color channel lasts 146.432ms.
    for (let y = 0; y < HEIGHT; y++) {
      tone(1200, 4.862);
      tone(1500, 0.572);
      pixels(y, 1);
      tone(1500, 0.572);
      pixels(y, 2);
      tone(1500, 0.572);
      pixels(y, 0);
      tone(1500, 0.572);
      if (onProgress && (y % 16 === 0 || y === HEIGHT - 1)) onProgress((y + 1) / HEIGHT);
    }
    return pcm.subarray(0, cursor);
  }
  function wavBlob(pcm) {
    const buffer = new ArrayBuffer(44 + pcm.length * 2);
    const view = new DataView(buffer);
    const str = (offset, s) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true);
    str(8, 'WAVE'); str(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, RATE, true); view.setUint32(28, RATE * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    str(36, 'data'); view.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
    return new Blob([buffer], { type: 'audio/wav' });
  }
  window.SSTV = { WIDTH, HEIGHT, RATE, encode, wavBlob };
})();
