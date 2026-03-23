'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sequencer } from '@/components/sequencer';
import { ControlPanel } from '@/components/control-panel';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  audioEngine,
  demoPattern,
  type Pattern,
  type TrackType,
  type AudioEngineState,
} from '@/lib/audio-engine';

const STORAGE_KEY = 'beatcanvas-pattern';

const defaultVolumes: Record<TrackType, number> = {
  kick: 0.8, snare: 0.7, hihat: 0.5, clap: 0.6, rim: 0.5,
  tomLow: 0.7, tomHigh: 0.7, openHat: 0.4, crash: 0.5,
  bass: 0.7, synth: 0.5, bell: 0.4, pluck: 0.5, chord: 0.5, sub: 0.6
};

const defaultMuted: Record<TrackType, boolean> = {
  kick: false, snare: false, hihat: false, clap: false, rim: false,
  tomLow: false, tomHigh: false, openHat: false, crash: false,
  bass: false, synth: false, bell: false, pluck: false, chord: false, sub: false
};

export default function BeatCanvasPage() {
  const [theme, setTheme] = useState('theme-neon-pulse');
  const [state, setState] = useState<AudioEngineState>({
    isPlaying: false,
    currentStep: 0,
    bpm: 120,
    pattern: demoPattern,
    volumes: defaultVolumes,
    muted: defaultMuted,
    masterVolume: 0.8,
  });

  // Initialize audio engine and subscribe to state changes
  useEffect(() => {
    if (!audioEngine) return;

    // Load saved pattern from localStorage
    const savedPattern = localStorage.getItem(STORAGE_KEY);
    if (savedPattern) {
      try {
        const parsed = JSON.parse(savedPattern);
        audioEngine.setPattern(parsed);
      } catch {
        audioEngine.setPattern(demoPattern);
      }
    } else {
      audioEngine.setPattern(demoPattern);
    }

    // Subscribe to state changes
    const unsubscribe = audioEngine.subscribe((newState) => {
      setState(newState);
    });

    // Set initial state
    setState(audioEngine.getState());

    return () => {
      unsubscribe();
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const handlePlay = useCallback(() => {
    audioEngine?.play();
  }, []);

  const handlePause = useCallback(() => {
    audioEngine?.pause();
  }, []);

  const handleStop = useCallback(() => {
    audioEngine?.stop();
  }, []);

  const handleBpmChange = useCallback((bpm: number) => {
    audioEngine?.setBpm(bpm);
  }, []);

  const handleToggleStep = useCallback((track: TrackType, step: number) => {
    audioEngine?.toggleStep(track, step);
  }, []);

  const handleVolumeChange = useCallback((track: TrackType, volume: number) => {
    audioEngine?.setVolume(track, volume);
  }, []);

  const handleMasterVolumeChange = useCallback((volume: number) => {
    audioEngine?.setMasterVolume(volume);
  }, []);

  const handleToggleMute = useCallback((track: TrackType) => {
    audioEngine?.toggleMute(track);
  }, []);

  const handleLoadPreset = useCallback((pattern: Pattern) => {
    audioEngine?.setPattern(pattern);
  }, []);

  const handleRandomPattern = useCallback(() => {
    const pattern = audioEngine?.randomPattern();
    if (pattern) {
      audioEngine?.setPattern(pattern);
    }
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.pattern));
  }, [state.pattern]);

  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const pattern = JSON.parse(saved);
        audioEngine?.setPattern(pattern);
      } catch {
        // Invalid saved data
      }
    }
  }, []);

  const handleReset = useCallback(() => {
    audioEngine?.setPattern(audioEngine.createEmptyPattern());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/10 via-transparent to-transparent opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-border/30">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              BeatCanvas
            </h1>
            <p className="text-sm text-muted-foreground">
              Interactive Music Sequencer - 15 Instruments
            </p>
          </div>
          <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 md:p-6 overflow-hidden">
          {/* Sequencer - takes most space */}
          <div className="flex-1 min-w-0 overflow-auto">
            <Sequencer
              pattern={state.pattern}
              currentStep={state.currentStep}
              isPlaying={state.isPlaying}
              volumes={state.volumes}
              muted={state.muted}
              onToggleStep={handleToggleStep}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />
          </div>

          {/* Right sidebar: Controls */}
          <aside className="w-full lg:w-72 flex-shrink-0 overflow-y-auto">
            <ControlPanel
              isPlaying={state.isPlaying}
              bpm={state.bpm}
              masterVolume={state.masterVolume}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              onBpmChange={handleBpmChange}
              onMasterVolumeChange={handleMasterVolumeChange}
              onLoadPreset={handleLoadPreset}
              onRandomPattern={handleRandomPattern}
              onSave={handleSave}
              onLoad={handleLoad}
              onReset={handleReset}
            />
          </aside>
        </main>

        {/* Footer */}
        <footer className="p-3 text-center text-xs text-muted-foreground border-t border-border/30">
          <span>Click steps to toggle beats - 9 Drums + 6 Melodic instruments</span>
        </footer>
      </div>
    </div>
  );
}
