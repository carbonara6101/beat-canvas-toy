export type TrackType = 
  // Drums
  'kick' | 'snare' | 'hihat' | 'clap' | 'rim' | 'tomLow' | 'tomHigh' | 'openHat' | 'crash' |
  // Melodic
  'bass' | 'synth' | 'bell' | 'pluck' | 'chord' | 'sub';

export interface Pattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  clap: boolean[];
  rim: boolean[];
  tomLow: boolean[];
  tomHigh: boolean[];
  openHat: boolean[];
  crash: boolean[];
  bass: boolean[];
  synth: boolean[];
  bell: boolean[];
  pluck: boolean[];
  chord: boolean[];
  sub: boolean[];
}

export interface AudioEngineState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  pattern: Pattern;
  volumes: Record<TrackType, number>;
  muted: Record<TrackType, boolean>;
  masterVolume: number;
}

const ALL_TRACKS: TrackType[] = [
  'kick', 'snare', 'hihat', 'clap', 'rim', 'tomLow', 'tomHigh', 'openHat', 'crash',
  'bass', 'synth', 'bell', 'pluck', 'chord', 'sub'
];

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNodes: Record<TrackType, GainNode | null> = {
    kick: null, snare: null, hihat: null, clap: null, rim: null,
    tomLow: null, tomHigh: null, openHat: null, crash: null,
    bass: null, synth: null, bell: null, pluck: null, chord: null, sub: null,
  };
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private state: AudioEngineState;
  private listeners: Set<(state: AudioEngineState) => void> = new Set();
  private lastTriggerTime: Record<TrackType, number> = { 
    kick: 0, snare: 0, hihat: 0, clap: 0, rim: 0, tomLow: 0, tomHigh: 0, openHat: 0, crash: 0,
    bass: 0, synth: 0, bell: 0, pluck: 0, chord: 0, sub: 0
  };

  constructor() {
    this.state = {
      isPlaying: false,
      currentStep: 0,
      bpm: 120,
      pattern: this.createEmptyPattern(),
      volumes: { 
        kick: 0.8, snare: 0.7, hihat: 0.5, clap: 0.6, rim: 0.5, 
        tomLow: 0.7, tomHigh: 0.7, openHat: 0.4, crash: 0.5,
        bass: 0.7, synth: 0.5, bell: 0.4, pluck: 0.5, chord: 0.5, sub: 0.6
      },
      muted: { 
        kick: false, snare: false, hihat: false, clap: false, rim: false, 
        tomLow: false, tomHigh: false, openHat: false, crash: false,
        bass: false, synth: false, bell: false, pluck: false, chord: false, sub: false
      },
      masterVolume: 0.8,
    };
  }

  createEmptyPattern(): Pattern {
    return {
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      clap: Array(16).fill(false),
      rim: Array(16).fill(false),
      tomLow: Array(16).fill(false),
      tomHigh: Array(16).fill(false),
      openHat: Array(16).fill(false),
      crash: Array(16).fill(false),
      bass: Array(16).fill(false),
      synth: Array(16).fill(false),
      bell: Array(16).fill(false),
      pluck: Array(16).fill(false),
      chord: Array(16).fill(false),
      sub: Array(16).fill(false),
    };
  }

  async init() {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.state.masterVolume;
    this.masterGain.connect(this.audioContext.destination);

    // Create gain nodes for each track
    for (const track of ALL_TRACKS) {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.state.volumes[track];
      gainNode.connect(this.masterGain);
      this.gainNodes[track] = gainNode;
    }
  }

  private playKick() {
    if (!this.audioContext || !this.gainNodes.kick || this.state.muted.kick) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.12);

    gain.gain.setValueAtTime(1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.gainNodes.kick);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.3);

    this.lastTriggerTime.kick = Date.now();
  }

  private playSnare() {
    if (!this.audioContext || !this.gainNodes.snare || this.state.muted.snare) return;

    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNodes.snare);

    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.05);
    oscGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.gainNodes.snare);

    noise.start(this.audioContext.currentTime);
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);

    this.lastTriggerTime.snare = Date.now();
  }

  private playHihat() {
    if (!this.audioContext || !this.gainNodes.hihat || this.state.muted.hihat) return;

    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.gainNodes.hihat);

    noise.start(this.audioContext.currentTime);

    this.lastTriggerTime.hihat = Date.now();
  }

  private playClap() {
    if (!this.audioContext || !this.gainNodes.clap || this.state.muted.clap) return;

    for (let i = 0; i < 3; i++) {
      const bufferSize = this.audioContext.sampleRate * 0.02;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = 1;

      const gain = this.audioContext.createGain();
      const startTime = this.audioContext.currentTime + i * 0.01;
      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNodes.clap);

      noise.start(startTime);
    }

    this.lastTriggerTime.clap = Date.now();
  }

  private playRim() {
    if (!this.audioContext || !this.gainNodes.rim || this.state.muted.rim) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.02);

    gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.gainNodes.rim);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.03);

    this.lastTriggerTime.rim = Date.now();
  }

  private playTomLow() {
    if (!this.audioContext || !this.gainNodes.tomLow || this.state.muted.tomLow) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.9, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.gainNodes.tomLow);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.25);

    this.lastTriggerTime.tomLow = Date.now();
  }

  private playTomHigh() {
    if (!this.audioContext || !this.gainNodes.tomHigh || this.state.muted.tomHigh) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.audioContext.currentTime + 0.12);

    gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.gainNodes.tomHigh);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);

    this.lastTriggerTime.tomHigh = Date.now();
  }

  private playOpenHat() {
    if (!this.audioContext || !this.gainNodes.openHat || this.state.muted.openHat) return;

    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 6000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.gainNodes.openHat);

    noise.start(this.audioContext.currentTime);

    this.lastTriggerTime.openHat = Date.now();
  }

  private playCrash() {
    if (!this.audioContext || !this.gainNodes.crash || this.state.muted.crash) return;

    const bufferSize = this.audioContext.sampleRate * 0.8;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 4000;

    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 12000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.gainNodes.crash);

    noise.start(this.audioContext.currentTime);

    this.lastTriggerTime.crash = Date.now();
  }

  // MELODIC INSTRUMENTS

  private playBass() {
    if (!this.audioContext || !this.gainNodes.bass || this.state.muted.bass) return;

    // 808-style bass
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1

    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes.bass);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.5);

    this.lastTriggerTime.bass = Date.now();
  }

  private playSynth() {
    if (!this.audioContext || !this.gainNodes.synth || this.state.muted.synth) return;

    // Synth lead - saw wave
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(223, this.audioContext.currentTime); // Slightly detuned

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes.synth);

    osc1.start(this.audioContext.currentTime);
    osc2.start(this.audioContext.currentTime);
    osc1.stop(this.audioContext.currentTime + 0.25);
    osc2.stop(this.audioContext.currentTime + 0.25);

    this.lastTriggerTime.synth = Date.now();
  }

  private playBell() {
    if (!this.audioContext || !this.gainNodes.bell || this.state.muted.bell) return;

    // Bell/chime sound - FM synthesis
    const carrier = this.audioContext.createOscillator();
    const modulator = this.audioContext.createOscillator();
    const modGain = this.audioContext.createGain();
    const gain = this.audioContext.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = 880; // A5

    modulator.type = 'sine';
    modulator.frequency.value = 880 * 2.5; // Modulator frequency
    modGain.gain.value = 300;

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);

    carrier.connect(gain);
    gain.connect(this.gainNodes.bell);

    carrier.start(this.audioContext.currentTime);
    modulator.start(this.audioContext.currentTime);
    carrier.stop(this.audioContext.currentTime + 0.8);
    modulator.stop(this.audioContext.currentTime + 0.8);

    this.lastTriggerTime.bell = Date.now();
  }

  private playPluck() {
    if (!this.audioContext || !this.gainNodes.pluck || this.state.muted.pluck) return;

    // Plucky synth - fast attack, quick decay
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNodes.pluck);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.15);

    this.lastTriggerTime.pluck = Date.now();
  }

  private playChord() {
    if (!this.audioContext || !this.gainNodes.chord || this.state.muted.chord) return;

    // Chord stab - multiple notes
    const frequencies = [261.63, 329.63, 392]; // C4, E4, G4 - C major chord
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);

    frequencies.forEach(freq => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start(this.audioContext!.currentTime);
      osc.stop(this.audioContext!.currentTime + 0.35);
    });

    filter.connect(gain);
    gain.connect(this.gainNodes.chord);

    this.lastTriggerTime.chord = Date.now();
  }

  private playSub() {
    if (!this.audioContext || !this.gainNodes.sub || this.state.muted.sub) return;

    // Deep sub bass
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, this.audioContext.currentTime); // Very low

    gain.gain.setValueAtTime(1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.gainNodes.sub);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.6);

    this.lastTriggerTime.sub = Date.now();
  }

  private playSound(track: TrackType) {
    switch (track) {
      case 'kick': this.playKick(); break;
      case 'snare': this.playSnare(); break;
      case 'hihat': this.playHihat(); break;
      case 'clap': this.playClap(); break;
      case 'rim': this.playRim(); break;
      case 'tomLow': this.playTomLow(); break;
      case 'tomHigh': this.playTomHigh(); break;
      case 'openHat': this.playOpenHat(); break;
      case 'crash': this.playCrash(); break;
      case 'bass': this.playBass(); break;
      case 'synth': this.playSynth(); break;
      case 'bell': this.playBell(); break;
      case 'pluck': this.playPluck(); break;
      case 'chord': this.playChord(); break;
      case 'sub': this.playSub(); break;
    }
  }

  private tick() {
    const { pattern, currentStep } = this.state;

    for (const track of ALL_TRACKS) {
      if (pattern[track][currentStep]) {
        this.playSound(track);
      }
    }

    this.state.currentStep = (currentStep + 1) % 16;
    this.notify();
  }

  play() {
    if (this.state.isPlaying) return;

    this.init();

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    this.state.isPlaying = true;
    const interval = (60 / this.state.bpm / 4) * 1000;
    this.intervalId = window.setInterval(() => this.tick(), interval);
    this.notify();
  }

  pause() {
    if (!this.state.isPlaying) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.isPlaying = false;
    this.notify();
  }

  stop() {
    this.pause();
    this.state.currentStep = 0;
    this.notify();
  }

  setBpm(bpm: number) {
    this.state.bpm = Math.max(60, Math.min(200, bpm));
    if (this.state.isPlaying) {
      if (this.intervalId) clearInterval(this.intervalId);
      const interval = (60 / this.state.bpm / 4) * 1000;
      this.intervalId = window.setInterval(() => this.tick(), interval);
    }
    this.notify();
  }

  toggleStep(track: TrackType, step: number) {
    this.state.pattern[track][step] = !this.state.pattern[track][step];
    this.notify();
  }

  setPattern(pattern: Pattern) {
    this.state.pattern = pattern;
    this.notify();
  }

  setVolume(track: TrackType, volume: number) {
    this.state.volumes[track] = volume;
    if (this.gainNodes[track]) {
      this.gainNodes[track]!.gain.value = volume;
    }
    this.notify();
  }

  setMasterVolume(volume: number) {
    this.state.masterVolume = volume;
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
    this.notify();
  }

  toggleMute(track: TrackType) {
    this.state.muted[track] = !this.state.muted[track];
    this.notify();
  }

  getState(): AudioEngineState {
    return { ...this.state };
  }

  getLastTriggerTime(track: TrackType): number {
    return this.lastTriggerTime[track];
  }

  subscribe(listener: (state: AudioEngineState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  randomPattern(): Pattern {
    return {
      kick: Array(16).fill(false).map((_, i) => i % 4 === 0 || Math.random() < 0.15),
      snare: Array(16).fill(false).map((_, i) => i % 8 === 4 || Math.random() < 0.1),
      hihat: Array(16).fill(false).map(() => Math.random() < 0.5),
      clap: Array(16).fill(false).map((_, i) => i % 8 === 4 || Math.random() < 0.08),
      rim: Array(16).fill(false).map(() => Math.random() < 0.1),
      tomLow: Array(16).fill(false).map(() => Math.random() < 0.08),
      tomHigh: Array(16).fill(false).map(() => Math.random() < 0.08),
      openHat: Array(16).fill(false).map((_, i) => i % 8 === 6 || Math.random() < 0.05),
      crash: Array(16).fill(false).map((_, i) => i === 0 ? Math.random() < 0.3 : Math.random() < 0.02),
      bass: Array(16).fill(false).map((_, i) => i % 4 === 0 || Math.random() < 0.15),
      synth: Array(16).fill(false).map(() => Math.random() < 0.15),
      bell: Array(16).fill(false).map(() => Math.random() < 0.1),
      pluck: Array(16).fill(false).map(() => Math.random() < 0.2),
      chord: Array(16).fill(false).map((_, i) => i === 0 || i === 8 ? Math.random() < 0.5 : Math.random() < 0.05),
      sub: Array(16).fill(false).map((_, i) => i % 4 === 0 ? Math.random() < 0.4 : false),
    };
  }
}

// Singleton instance
export const audioEngine = typeof window !== 'undefined' ? new AudioEngine() : null;

const emptyTrack = Array(16).fill(false);

// Preset patterns
export const presetPatterns: Record<string, Pattern> = {
  'Basic House': {
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    rim: [...emptyTrack],
    tomLow: [...emptyTrack],
    tomHigh: [...emptyTrack],
    openHat: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
    crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    bass: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false],
    synth: [...emptyTrack],
    bell: [...emptyTrack],
    pluck: [...emptyTrack],
    chord: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    sub: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  },
  'Lo-fi Chill': {
    kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, true, true, false, false, false],
    hihat: [true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, true],
    clap: [...emptyTrack],
    rim: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, false, true],
    tomLow: [...emptyTrack],
    tomHigh: [...emptyTrack],
    openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
    crash: [...emptyTrack],
    bass: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
    synth: [...emptyTrack],
    bell: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    pluck: [false, false, true, false, false, true, false, false, false, false, true, false, false, true, false, false],
    chord: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    sub: [...emptyTrack],
  },
  'Trap Starter': {
    kick: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    rim: [...emptyTrack],
    tomLow: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    tomHigh: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
    openHat: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true],
    crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    bass: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    synth: [false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false],
    bell: [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false],
    pluck: [...emptyTrack],
    chord: [...emptyTrack],
    sub: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
  },
  'EDM Drop': {
    kick: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    rim: [...emptyTrack],
    tomLow: [...emptyTrack],
    tomHigh: [...emptyTrack],
    openHat: [...emptyTrack],
    crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    bass: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    synth: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
    bell: [...emptyTrack],
    pluck: [...emptyTrack],
    chord: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    sub: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  },
  'Synthwave': {
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    rim: [...emptyTrack],
    tomLow: [...emptyTrack],
    tomHigh: [...emptyTrack],
    openHat: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
    crash: [...emptyTrack],
    bass: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
    synth: [true, false, true, false, false, false, true, false, true, false, true, false, false, false, true, false],
    bell: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    pluck: [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false],
    chord: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    sub: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  },
  'Funk Groove': {
    kick: [true, false, false, true, false, false, true, false, false, false, true, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    rim: [false, true, false, false, false, true, false, true, false, true, false, false, false, true, false, false],
    tomLow: [...emptyTrack],
    tomHigh: [...emptyTrack],
    openHat: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
    crash: [...emptyTrack],
    bass: [true, false, true, true, false, false, true, false, false, true, true, false, false, false, true, false],
    synth: [...emptyTrack],
    bell: [...emptyTrack],
    pluck: [false, false, true, false, false, true, false, false, true, false, false, true, false, false, true, false],
    chord: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    sub: [...emptyTrack],
  },
  'Ambient Chill': {
    kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    snare: [...emptyTrack],
    hihat: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    clap: [...emptyTrack],
    rim: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
    tomLow: [...emptyTrack],
    tomHigh: [...emptyTrack],
    openHat: [...emptyTrack],
    crash: [...emptyTrack],
    bass: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    synth: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    bell: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    pluck: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, false, true],
    chord: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    sub: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  },
  'Drum Fill': {
    kick: [true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, true, false, false, true, true, true],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, false, false, false, false],
    clap: [...emptyTrack],
    rim: [...emptyTrack],
    tomLow: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, true],
    tomHigh: [false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false],
    openHat: [...emptyTrack],
    crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    bass: [...emptyTrack],
    synth: [...emptyTrack],
    bell: [...emptyTrack],
    pluck: [...emptyTrack],
    chord: [...emptyTrack],
    sub: [...emptyTrack],
  },
};

// Demo pattern for first load
export const demoPattern: Pattern = {
  kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false],
  snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
  hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
  clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  rim: [...emptyTrack],
  tomLow: [...emptyTrack],
  tomHigh: [...emptyTrack],
  openHat: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
  crash: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  bass: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false],
  synth: [...emptyTrack],
  bell: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  pluck: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, false, true],
  chord: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  sub: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
};
