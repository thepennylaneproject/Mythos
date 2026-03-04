/**
 * Grain & Grit Visual Engine: Add strategic imperfections to AI-generated images.
 * Combats the "AI slop" aesthetic by introducing human-like flaws.
 */

export interface GritPreset {
  name: string;
  description: string;
  grain: number; // 0-100, film grain intensity
  vignette: number; // 0-100
  saturation: number; // -50 to +50
  contrast: number; // -50 to +50
  warmth: number; // -50 to +50 (negative = cooler)
  blur: number; // 0-10, subtle defocus
  chromatic: number; // 0-20, chromatic aberration
  scratches: boolean;
  dust: boolean;
}

export const GRIT_PRESETS: Record<string, GritPreset> = {
  authentic_film: {
    name: "Authentic Film",
    description: "35mm film aesthetic with natural grain and warm tones",
    grain: 40,
    vignette: 30,
    saturation: -10,
    contrast: 10,
    warmth: 15,
    blur: 0,
    chromatic: 5,
    scratches: false,
    dust: true,
  },
  vintage_polaroid: {
    name: "Vintage Polaroid",
    description: "Instant camera look with faded colors and soft edges",
    grain: 25,
    vignette: 50,
    saturation: -20,
    contrast: -10,
    warmth: 25,
    blur: 2,
    chromatic: 8,
    scratches: false,
    dust: false,
  },
  raw_documentary: {
    name: "Raw Documentary",
    description: "Gritty photojournalism style with high contrast",
    grain: 60,
    vignette: 20,
    saturation: -30,
    contrast: 25,
    warmth: -10,
    blur: 0,
    chromatic: 3,
    scratches: true,
    dust: true,
  },
  subtle_organic: {
    name: "Subtle Organic",
    description: "Light imperfections for a natural, non-AI feel",
    grain: 15,
    vignette: 10,
    saturation: 0,
    contrast: 5,
    warmth: 5,
    blur: 1,
    chromatic: 2,
    scratches: false,
    dust: false,
  },
  cyber_analog: {
    name: "Cyber Analog",
    description: "Retro-futurist blend with scan lines and glitch hints",
    grain: 30,
    vignette: 25,
    saturation: 15,
    contrast: 20,
    warmth: -15,
    blur: 0,
    chromatic: 15,
    scratches: true,
    dust: false,
  },
};

/**
 * Generate CSS filter string for grit effects.
 * For client-side canvas or CSS-based application.
 */
export function generateGritFilter(preset: GritPreset): string {
  const filters: string[] = [];

  // Saturation
  const satVal = 100 + preset.saturation;
  filters.push(`saturate(${satVal}%)`);

  // Contrast
  const contVal = 100 + preset.contrast;
  filters.push(`contrast(${contVal}%)`);

  // Warmth (using sepia + hue-rotate hack)
  if (preset.warmth > 0) {
    filters.push(`sepia(${preset.warmth}%)`);
  } else if (preset.warmth < 0) {
    filters.push(`hue-rotate(${preset.warmth * 2}deg)`);
  }

  // Blur
  if (preset.blur > 0) {
    filters.push(`blur(${preset.blur * 0.1}px)`);
  }

  return filters.join(" ");
}

/**
 * Generate prompt modifier for AI image generation to include imperfections.
 */
export function generateGritPromptModifier(preset: GritPreset): string {
  const modifiers: string[] = [];

  if (preset.grain > 30) {
    modifiers.push("film grain");
  }
  if (preset.vignette > 20) {
    modifiers.push("vignette effect");
  }
  if (preset.saturation < -15) {
    modifiers.push("desaturated colors");
  }
  if (preset.warmth > 15) {
    modifiers.push("warm color temperature");
  } else if (preset.warmth < -15) {
    modifiers.push("cool color temperature");
  }
  if (preset.scratches) {
    modifiers.push("subtle film scratches");
  }
  if (preset.dust) {
    modifiers.push("light dust particles");
  }
  if (preset.chromatic > 10) {
    modifiers.push("chromatic aberration");
  }

  if (modifiers.length === 0) {
    return "";
  }

  return `Shot on film, ${modifiers.join(", ")}, candid photography style, not digitally perfect`;
}
