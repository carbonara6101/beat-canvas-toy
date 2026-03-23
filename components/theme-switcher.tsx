'use client';

import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  { id: 'theme-neon-pulse', name: 'Neon Pulse', colors: ['#A855F7', '#EC4899', '#22D3EE'] },
  { id: 'theme-lofi-night', name: 'Lo-fi Night', colors: ['#D4A574', '#7BA3A8', '#E8B4BC'] },
  { id: 'theme-cyber-grid', name: 'Cyber Grid', colors: ['#00FFD4', '#FF00FF', '#00FF88'] },
];

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
            "border border-border/50 hover:border-border",
            currentTheme === theme.id
              ? "bg-card/60 ring-2 ring-primary/50"
              : "bg-card/30 hover:bg-card/50"
          )}
          title={theme.name}
        >
          <div className="flex -space-x-1">
            {theme.colors.map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full border border-background/50"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs font-medium hidden sm:inline">{theme.name}</span>
        </button>
      ))}
    </div>
  );
}
