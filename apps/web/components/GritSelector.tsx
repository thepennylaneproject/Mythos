"use client";

import { useState } from "react";
import { GRIT_PRESETS, GritPreset, generateGritFilter } from "@mythos/ai-engine";

interface GritSelectorProps {
  onSelect: (preset: GritPreset, presetKey: string) => void;
  currentPreset?: string;
}

export function GritSelector({ onSelect, currentPreset }: GritSelectorProps) {
  const [selected, setSelected] = useState<string>(currentPreset || "subtle_organic");
  const [previewImage] = useState("/placeholder-image.jpg"); // Would be actual image in production

  const handleSelect = (key: string) => {
    setSelected(key);
    onSelect(GRIT_PRESETS[key], key);
  };

  return (
    <div className="border rounded-xl p-6 bg-card space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg">
          🎞️
        </div>
        <div>
          <h3 className="font-bold text-lg">Grain & Grit</h3>
          <p className="text-xs text-muted-foreground">Add authentic imperfections to your visuals</p>
        </div>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(GRIT_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selected === key
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-transparent bg-muted/30 hover:bg-muted/50"
            }`}
          >
            {/* Preview swatch */}
            <div 
              className="w-full h-16 rounded-lg mb-3 bg-gradient-to-br from-gray-300 to-gray-400"
              style={{ filter: generateGritFilter(preset) }}
            />
            <h4 className="font-semibold text-sm">{preset.name}</h4>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
              {preset.description}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Details */}
      {selected && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">Effect Settings</h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Grain</span>
              <div className="font-mono">{GRIT_PRESETS[selected].grain}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Vignette</span>
              <div className="font-mono">{GRIT_PRESETS[selected].vignette}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Warmth</span>
              <div className="font-mono">{GRIT_PRESETS[selected].warmth > 0 ? "+" : ""}{GRIT_PRESETS[selected].warmth}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Saturation</span>
              <div className="font-mono">{GRIT_PRESETS[selected].saturation > 0 ? "+" : ""}{GRIT_PRESETS[selected].saturation}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Contrast</span>
              <div className="font-mono">{GRIT_PRESETS[selected].contrast > 0 ? "+" : ""}{GRIT_PRESETS[selected].contrast}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Effects</span>
              <div className="font-mono">
                {GRIT_PRESETS[selected].dust && "🌫️"}
                {GRIT_PRESETS[selected].scratches && "⚡"}
                {GRIT_PRESETS[selected].chromatic > 10 && "🌈"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
