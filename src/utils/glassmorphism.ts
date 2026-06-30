import React from 'react';
import { GlassmorphismSettings } from '../store/useMetricsStore';

export function getGlassmorphicStyle(settings: GlassmorphismSettings, isDark: boolean): {
  className: string;
  style: React.CSSProperties;
} {
  const { blurIntensity, baseTintColor, tintOpacity, borderStrength, glowEffect } = settings;

  // 1. Map Base Tint Colors to RGBA values
  // RGB values for Dark and Light states
  const colorMapDark: Record<string, [number, number, number]> = {
    slate: [15, 23, 42],      // #0f172a
    indigo: [30, 27, 75],     // #1e1b4b
    emerald: [2, 44, 34],     // #022c22
    amber: [69, 26, 3],       // #451a03
    rose: [76, 5, 25],        // #4c0519
    cyan: [8, 47, 73],        // #082f49
    zinc: [24, 24, 27],       // #18181b
    violet: [46, 16, 101],    // #2e1065
    fuchsia: [74, 4, 78],     // #4a044e
  };

  const colorMapLight: Record<string, [number, number, number]> = {
    slate: [241, 245, 249],   // #f1f5f9
    indigo: [224, 231, 255],  // #e0e7ff
    emerald: [209, 250, 229], // #d1fae5
    amber: [254, 243, 199],   // #fef3c7
    rose: [254, 226, 226],    // #fee2e2
    cyan: [207, 250, 254],    // #cffafe
    zinc: [244, 244, 245],    // #f4f4f5
    violet: [237, 233, 254],  // #ede9fe
    fuchsia: [250, 232, 255], // #fae8ff
  };

  const rgb = isDark 
    ? (colorMapDark[baseTintColor] || colorMapDark.slate)
    : (colorMapLight[baseTintColor] || colorMapLight.slate);

  const backgroundColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${tintOpacity})`;

  // 2. Map Blur Intensities
  const blurMap: Record<string, string> = {
    none: 'none',
    sm: 'blur(4px)',
    md: 'blur(12px)',
    lg: 'blur(24px)',
    xl: 'blur(40px)',
  };
  const backdropFilter = blurMap[blurIntensity] || 'blur(12px)';

  // 3. Map Border Strength with colored tint
  const borderTintMapDark: Record<string, [number, number, number]> = {
    slate: [148, 163, 184],
    indigo: [129, 140, 248],
    emerald: [52, 211, 153],
    amber: [251, 191, 36],
    rose: [251, 113, 133],
    cyan: [34, 211, 238],
    zinc: [161, 161, 170],
    violet: [167, 139, 250],
    fuchsia: [232, 121, 249],
  };

  const borderTintMapLight: Record<string, [number, number, number]> = {
    slate: [71, 85, 105],
    indigo: [79, 70, 229],
    emerald: [5, 150, 105],
    amber: [217, 119, 6],
    rose: [225, 29, 72],
    cyan: [13, 148, 136],
    zinc: [113, 113, 122],
    violet: [124, 58, 237],
    fuchsia: [192, 38, 211],
  };

  const borderRGB = isDark
    ? (borderTintMapDark[baseTintColor] || borderTintMapDark.slate)
    : (borderTintMapLight[baseTintColor] || borderTintMapLight.slate);

  const borderOpacityMap: Record<string, number> = {
    none: 0,
    subtle: 0.08,
    medium: 0.18,
    strong: 0.35,
  };
  const borderOpacity = borderOpacityMap[borderStrength] !== undefined ? borderOpacityMap[borderStrength] : 0.18;
  const borderColor = borderStrength === 'none' 
    ? 'transparent' 
    : `rgba(${borderRGB[0]}, ${borderRGB[1]}, ${borderRGB[2]}, ${borderOpacity})`;

  // 4. Glow / Shadow Effects
  let boxShadow = '';
  if (glowEffect) {
    const shadowRGB = isDark
      ? (borderTintMapDark[baseTintColor] || borderTintMapDark.indigo)
      : (borderTintMapLight[baseTintColor] || borderTintMapLight.indigo);
    
    const shadowOpacity = isDark ? 0.07 : 0.04;
    boxShadow = `0 10px 30px -10px rgba(${shadowRGB[0]}, ${shadowRGB[1]}, ${shadowRGB[2]}, ${shadowOpacity}), 0 1px 3px rgba(0, 0, 0, ${isDark ? 0.2 : 0.04})`;
  } else {
    boxShadow = isDark 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.08)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.01)';
  }

  return {
    className: 'rounded-2xl border transition-all duration-300',
    style: {
      backgroundColor,
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
      borderColor,
      boxShadow,
    },
  };
}
