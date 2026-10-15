import type { StoryFrame } from '@/views/story/StoryClock';

const NOISE_SECONDS = 3;
const MASTER_VOLUME = 0.9;

interface Channels {
  master: GainNode;
  rain: GainNode;
  sea: GainNode;
  radio: GainNode;
  pencil: GainNode;
}

/**
 * Storm soundscape synthesised with Web Audio from a single noise buffer (no audio files):
 * rain, sea, radio static and the pencil scratching while the notebook is drawn, plus thunder.
 */
export class AmbientSound {
  private context: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private channels: Channels | null = null;
  private enabled = false;

  get isEnabled() {
    return this.enabled;
  }

  async setEnabled(enabled: boolean) {
    if (enabled && !this.context) this.build();
    const { context, channels } = this;
    if (!context || !channels) return;
    this.enabled = enabled;
    if (enabled) await context.resume();
    channels.master.gain.setTargetAtTime(
      enabled ? MASTER_VOLUME : 0,
      context.currentTime,
      enabled ? 0.5 : 0.3,
    );
  }

  /** Follows the story: the storm fades on paper, static rises with the glitch. */
  update(frame: StoryFrame) {
    const { context, channels } = this;
    if (!this.enabled || !context || !channels) return;
    const t = context.currentTime;
    const night = 1 - frame.sketch;
    channels.rain.gain.setTargetAtTime(0.16 * night + 0.01, t, 0.3);
    channels.sea.gain.setTargetAtTime(0.3 * night + 0.04, t, 0.3);
    channels.radio.gain.setTargetAtTime(frame.glitch * (0.08 + 0.1 * Math.random()), t, 0.05);
    const drawing = frame.sketch > 0.02 && frame.sketch < 0.98;
    channels.pencil.gain.setTargetAtTime(drawing ? Math.min(0.25, frame.motion * 60) : 0, t, 0.08);
    if (frame.lightning) window.setTimeout(() => this.thunder(), 300 + Math.random() * 900);
  }

  dispose() {
    void this.context?.close();
    this.context = null;
    this.channels = null;
    this.enabled = false;
  }

  private build() {
    const context = new AudioContext();
    const length = context.sampleRate * NOISE_SECONDS;
    const noise = context.createBuffer(1, length, context.sampleRate);
    const data = noise.getChannelData(0);
    // White noise plus a brown-noise rumble for body.
    let brown = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = white * 0.6 + brown * 3;
    }
    this.context = context;
    this.noise = noise;

    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.channels = {
      master,
      rain: this.loop(master, 0.16, 1, this.filter('highpass', 700), this.filter('lowpass', 5200)),
      sea: this.loop(master, 0.3, 0.5, this.filter('lowpass', 260)),
      radio: this.loop(master, 0, 1, this.filter('bandpass', 2400, 0.8)),
      pencil: this.loop(master, 0, 1.3, this.filter('bandpass', 4200, 2.5)),
    };
  }

  private filter(type: BiquadFilterType, frequency: number, q?: number) {
    const filter = this.context!.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    if (q !== undefined) filter.Q.value = q;
    return filter;
  }

  /** Looping noise through `filters` into its own gain, returned so it can be faded. */
  private loop(output: AudioNode, volume: number, rate: number, ...filters: BiquadFilterNode[]) {
    const context = this.context!;
    const source = context.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    source.playbackRate.value = rate;
    const gain = context.createGain();
    gain.gain.value = volume;
    let tail: AudioNode = source;
    for (const node of [...filters, gain]) tail = tail.connect(node);
    gain.connect(output);
    source.start();
    return gain;
  }

  private thunder() {
    const { context, channels } = this;
    if (!this.enabled || !context || !channels) return;
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = this.noise;
    source.playbackRate.value = 0.35;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.9, now + 0.25 + Math.random() * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
    source.connect(this.filter('lowpass', 220)).connect(gain).connect(channels.master);
    source.start();
    source.stop(now + 3.4);
  }
}
