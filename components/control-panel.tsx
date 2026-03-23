'use client';

import { Play, Pause, Square, Shuffle, Save, FolderOpen, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { presetPatterns, type Pattern } from '@/lib/audio-engine';

interface ControlPanelProps {
  isPlaying: boolean;
  bpm: number;
  masterVolume: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
  onMasterVolumeChange: (volume: number) => void;
  onLoadPreset: (pattern: Pattern) => void;
  onRandomPattern: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
}

export function ControlPanel({
  isPlaying,
  bpm,
  masterVolume,
  onPlay,
  onPause,
  onStop,
  onBpmChange,
  onMasterVolumeChange,
  onLoadPreset,
  onRandomPattern,
  onSave,
  onLoad,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Playback Controls */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Playback
        </h3>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant={isPlaying ? 'secondary' : 'default'}
            className={cn(
              "flex-1 h-12 rounded-xl",
              !isPlaying && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            )}
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 rounded-xl"
            onClick={onStop}
          >
            <Square className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* BPM Control */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tempo
          </h3>
          <span className="text-lg font-mono font-bold text-primary">{bpm}</span>
        </div>
        <Slider
          value={[bpm]}
          onValueChange={([value]) => onBpmChange(value)}
          min={60}
          max={200}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>60</span>
          <span>BPM</span>
          <span>200</span>
        </div>
      </div>

      {/* Master Volume */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Master Volume
          </h3>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <Slider
          value={[masterVolume * 100]}
          onValueChange={([value]) => onMasterVolumeChange(value / 100)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Presets */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Presets
        </h3>
        <Select onValueChange={(value) => onLoadPreset(presetPatterns[value])}>
          <SelectTrigger className="w-full rounded-xl bg-secondary/30 border-border/50">
            <SelectValue placeholder="Select a preset..." />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(presetPatterns).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          className="w-full mt-2 rounded-xl"
          onClick={onRandomPattern}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random Pattern
        </Button>
      </div>

      {/* Save/Load/Reset */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-4 mt-auto">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Storage
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" className="rounded-xl" onClick={onSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="secondary" className="rounded-xl" onClick={onLoad}>
            <FolderOpen className="h-4 w-4" />
          </Button>
          <Button variant="secondary" className="rounded-xl" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <span className="text-xs text-center text-muted-foreground">Save</span>
          <span className="text-xs text-center text-muted-foreground">Load</span>
          <span className="text-xs text-center text-muted-foreground">Reset</span>
        </div>
      </div>
    </div>
  );
}
