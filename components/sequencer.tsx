'use client';

import { type Pattern, type TrackType } from '@/lib/audio-engine';
import { cn } from '@/lib/utils';
import { Volume2, VolumeOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface SequencerProps {
  pattern: Pattern;
  currentStep: number;
  isPlaying: boolean;
  volumes: Record<TrackType, number>;
  muted: Record<TrackType, boolean>;
  onToggleStep: (track: TrackType, step: number) => void;
  onVolumeChange: (track: TrackType, volume: number) => void;
  onToggleMute: (track: TrackType) => void;
}

const drumTracks: { type: TrackType; label: string; color: string; shortLabel: string }[] = [
  { type: 'kick', label: 'KICK', shortLabel: 'KCK', color: 'bg-pink-500' },
  { type: 'snare', label: 'SNARE', shortLabel: 'SNR', color: 'bg-purple-500' },
  { type: 'hihat', label: 'HI-HAT', shortLabel: 'HH', color: 'bg-cyan-400' },
  { type: 'clap', label: 'CLAP', shortLabel: 'CLP', color: 'bg-amber-400' },
  { type: 'rim', label: 'RIM', shortLabel: 'RIM', color: 'bg-emerald-400' },
  { type: 'tomLow', label: 'TOM L', shortLabel: 'TL', color: 'bg-orange-500' },
  { type: 'tomHigh', label: 'TOM H', shortLabel: 'TH', color: 'bg-rose-400' },
  { type: 'openHat', label: 'OPEN HAT', shortLabel: 'OH', color: 'bg-sky-400' },
  { type: 'crash', label: 'CRASH', shortLabel: 'CRS', color: 'bg-violet-400' },
];

const melodicTracks: { type: TrackType; label: string; color: string; shortLabel: string }[] = [
  { type: 'bass', label: 'BASS', shortLabel: 'BAS', color: 'bg-red-500' },
  { type: 'synth', label: 'SYNTH', shortLabel: 'SYN', color: 'bg-fuchsia-500' },
  { type: 'bell', label: 'BELL', shortLabel: 'BEL', color: 'bg-yellow-400' },
  { type: 'pluck', label: 'PLUCK', shortLabel: 'PLK', color: 'bg-lime-400' },
  { type: 'chord', label: 'CHORD', shortLabel: 'CHD', color: 'bg-indigo-400' },
  { type: 'sub', label: 'SUB', shortLabel: 'SUB', color: 'bg-rose-600' },
];

export function Sequencer({
  pattern,
  currentStep,
  isPlaying,
  volumes,
  muted,
  onToggleStep,
  onVolumeChange,
  onToggleMute,
}: SequencerProps) {
  return (
    <div className="w-full bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Step Sequencer
        </h2>
        <div className="flex gap-2">
          {[0, 4, 8, 12].map((beat) => (
            <span
              key={beat}
              className={cn(
                "text-xs font-mono px-2 py-0.5 rounded",
                currentStep >= beat && currentStep < beat + 4
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground"
              )}
            >
              {beat / 4 + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Drums Section */}
      <div className="mb-2">
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-1.5 pl-1">Drums</div>
        <div className="space-y-1">
          {drumTracks.map(({ type, label, shortLabel, color }) => (
            <TrackRow
              key={type}
              type={type}
              label={label}
              shortLabel={shortLabel}
              color={color}
              pattern={pattern}
              currentStep={currentStep}
              isPlaying={isPlaying}
              volumes={volumes}
              muted={muted}
              onToggleStep={onToggleStep}
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
            />
          ))}
        </div>
      </div>

      {/* Melodic Section */}
      <div className="mb-2">
        <div className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-1.5 pl-1">Melodic</div>
        <div className="space-y-1">
          {melodicTracks.map(({ type, label, shortLabel, color }) => (
            <TrackRow
              key={type}
              type={type}
              label={label}
              shortLabel={shortLabel}
              color={color}
              pattern={pattern}
              currentStep={currentStep}
              isPlaying={isPlaying}
              volumes={volumes}
              muted={muted}
              onToggleStep={onToggleStep}
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackRow({
  type,
  label,
  shortLabel,
  color,
  pattern,
  currentStep,
  isPlaying,
  volumes,
  muted,
  onToggleStep,
  onVolumeChange,
  onToggleMute,
}: {
  type: TrackType;
  label: string;
  shortLabel: string;
  color: string;
  pattern: Pattern;
  currentStep: number;
  isPlaying: boolean;
  volumes: Record<TrackType, number>;
  muted: Record<TrackType, boolean>;
  onToggleStep: (track: TrackType, step: number) => void;
  onVolumeChange: (track: TrackType, volume: number) => void;
  onToggleMute: (track: TrackType) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Track controls */}
      <div className="flex items-center gap-1.5 w-20 md:w-24 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-lg flex-shrink-0",
            muted[type] && "opacity-50"
          )}
          onClick={() => onToggleMute(type)}
        >
          {muted[type] ? (
            <VolumeOff className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>
        <span className="text-xs font-mono font-medium hidden md:block truncate">{label}</span>
        <span className="text-xs font-mono font-medium md:hidden">{shortLabel}</span>
      </div>

      {/* Volume slider */}
      <div className="w-14 md:w-16 flex-shrink-0">
        <Slider
          value={[volumes[type] * 100]}
          onValueChange={([value]) => onVolumeChange(type, value / 100)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Step buttons */}
      <div className="flex gap-0.5 flex-1 overflow-x-auto">
        {pattern[type].map((active, step) => (
          <button
            key={step}
            onClick={() => onToggleStep(type, step)}
            className={cn(
              "flex-1 min-w-[18px] h-7 md:h-8 rounded-md transition-all duration-100",
              "border border-border/50 hover:border-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              step % 4 === 0 && "ml-0.5 first:ml-0",
              active
                ? cn(color, "shadow-md")
                : "bg-secondary/30 hover:bg-secondary/50",
              isPlaying && step === currentStep && "ring-2 ring-white/60"
            )}
            aria-label={`${label} step ${step + 1} ${active ? 'on' : 'off'}`}
          />
        ))}
      </div>
    </div>
  );
}
