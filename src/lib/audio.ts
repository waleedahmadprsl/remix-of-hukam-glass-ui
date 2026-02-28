// simple Web Audio helper for notifications

export function playBeep(frequency = 800, duration = 0.3) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);

    // close context after sound finishes to free resources
    setTimeout(() => {
      ctx.close();
    }, duration * 1000 + 100);
  } catch (e) {
    console.warn("Web Audio API not supported:", e);
  }
}
