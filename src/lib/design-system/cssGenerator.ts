import type { DesignTokens, ComponentStyles } from '@/types/designSystem';

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const lines: string[] = [':root {'];

  // Colors
  lines.push('  /* Primary Colors */');
  Object.entries(tokens.colors.primary).forEach(([shade, value]) => {
    lines.push(`  --color-primary-${shade}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Secondary Colors */');
  Object.entries(tokens.colors.secondary).forEach(([shade, value]) => {
    lines.push(`  --color-secondary-${shade}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Neutral Colors */');
  Object.entries(tokens.colors.neutral).forEach(([shade, value]) => {
    lines.push(`  --color-neutral-${shade}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Semantic Colors */');
  Object.entries(tokens.colors.semantic).forEach(([name, value]) => {
    lines.push(`  --color-${name}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Background Colors */');
  Object.entries(tokens.colors.background).forEach(([name, value]) => {
    lines.push(`  --bg-${name}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Text Colors */');
  Object.entries(tokens.colors.text).forEach(([name, value]) => {
    lines.push(`  --text-${name}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Border Colors */');
  Object.entries(tokens.colors.border).forEach(([name, value]) => {
    lines.push(`  --border-${name}: ${value};`);
  });

  // Typography
  lines.push('');
  lines.push('  /* Font Families */');
  lines.push(`  --font-heading: "${tokens.typography.fonts.heading.name}", ${tokens.typography.fonts.heading.fallback.join(', ')};`);
  lines.push(`  --font-body: "${tokens.typography.fonts.body.name}", ${tokens.typography.fonts.body.fallback.join(', ')};`);
  lines.push(`  --font-mono: "${tokens.typography.fonts.mono.name}", ${tokens.typography.fonts.mono.fallback.join(', ')};`);

  lines.push('');
  lines.push('  /* Font Sizes */');
  Object.entries(tokens.typography.sizes).forEach(([name, { size, lineHeight }]) => {
    lines.push(`  --text-${name}: ${size};`);
    lines.push(`  --leading-${name}: ${lineHeight};`);
  });

  lines.push('');
  lines.push('  /* Font Weights */');
  Object.entries(tokens.typography.weights).forEach(([name, value]) => {
    lines.push(`  --font-${name}: ${value};`);
  });

  // Spacing
  lines.push('');
  lines.push('  /* Spacing */');
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    const safeName = name.replace('.', '_');
    lines.push(`  --space-${safeName}: ${value};`);
  });

  // Border Radius
  lines.push('');
  lines.push('  /* Border Radius */');
  Object.entries(tokens.radius).forEach(([name, value]) => {
    lines.push(`  --radius-${name}: ${value};`);
  });

  // Shadows
  lines.push('');
  lines.push('  /* Shadows */');
  Object.entries(tokens.shadows).forEach(([name, value]) => {
    lines.push(`  --shadow-${name}: ${value};`);
  });

  // Breakpoints
  lines.push('');
  lines.push('  /* Breakpoints */');
  Object.entries(tokens.breakpoints).forEach(([name, value]) => {
    lines.push(`  --breakpoint-${name}: ${value};`);
  });

  // Animation
  lines.push('');
  lines.push('  /* Animation Duration */');
  Object.entries(tokens.animation.duration).forEach(([name, value]) => {
    lines.push(`  --duration-${name}: ${value};`);
  });

  lines.push('');
  lines.push('  /* Animation Easing */');
  Object.entries(tokens.animation.easing).forEach(([name, value]) => {
    lines.push(`  --ease-${name}: ${value};`);
  });

  lines.push('}');

  return lines.join('\n');
}

/**
 * Apply theme tokens to document by injecting CSS variables
 */
export function applyThemeToDocument(tokens: DesignTokens): void {
  if (typeof document === 'undefined') return;

  const styleId = 'design-system-tokens';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = generateCSSVariables(tokens);
}

/**
 * Convert component styles to inline CSS object
 */
export function stylesToCSS(styles: ComponentStyles): React.CSSProperties {
  const css: React.CSSProperties = {};

  // Box/Layout
  if (styles.box) {
    if (styles.box.display) css.display = styles.box.display;
    if (styles.box.flexDirection) css.flexDirection = styles.box.flexDirection;
    if (styles.box.gap) css.gap = styles.box.gap;

    if (styles.box.justifyContent) {
      const justifyMap: Record<string, string> = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        between: 'space-between',
        around: 'space-around',
        evenly: 'space-evenly',
      };
      css.justifyContent = justifyMap[styles.box.justifyContent] || styles.box.justifyContent;
    }

    if (styles.box.alignItems) {
      const alignMap: Record<string, string> = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        baseline: 'baseline',
        stretch: 'stretch',
      };
      css.alignItems = alignMap[styles.box.alignItems] || styles.box.alignItems;
    }

    if (styles.box.gridCols) {
      css.gridTemplateColumns = `repeat(${styles.box.gridCols}, minmax(0, 1fr))`;
    }
  }

  // Spacing
  if (styles.spacing) {
    if (styles.spacing.margin) {
      if (styles.spacing.margin.top) css.marginTop = styles.spacing.margin.top;
      if (styles.spacing.margin.right) css.marginRight = styles.spacing.margin.right;
      if (styles.spacing.margin.bottom) css.marginBottom = styles.spacing.margin.bottom;
      if (styles.spacing.margin.left) css.marginLeft = styles.spacing.margin.left;
    }
    if (styles.spacing.padding) {
      if (styles.spacing.padding.top) css.paddingTop = styles.spacing.padding.top;
      if (styles.spacing.padding.right) css.paddingRight = styles.spacing.padding.right;
      if (styles.spacing.padding.bottom) css.paddingBottom = styles.spacing.padding.bottom;
      if (styles.spacing.padding.left) css.paddingLeft = styles.spacing.padding.left;
    }
  }

  // Size
  if (styles.size) {
    if (styles.size.width) css.width = styles.size.width;
    if (styles.size.minWidth) css.minWidth = styles.size.minWidth;
    if (styles.size.maxWidth) css.maxWidth = styles.size.maxWidth;
    if (styles.size.height) css.height = styles.size.height;
    if (styles.size.minHeight) css.minHeight = styles.size.minHeight;
    if (styles.size.maxHeight) css.maxHeight = styles.size.maxHeight;
  }

  // Typography
  if (styles.typography) {
    if (styles.typography.fontFamily) css.fontFamily = styles.typography.fontFamily;
    if (styles.typography.fontSize) css.fontSize = styles.typography.fontSize;
    if (styles.typography.fontWeight) css.fontWeight = styles.typography.fontWeight;
    if (styles.typography.lineHeight) css.lineHeight = styles.typography.lineHeight;
    if (styles.typography.letterSpacing) css.letterSpacing = styles.typography.letterSpacing;
    if (styles.typography.textAlign) css.textAlign = styles.typography.textAlign;
    if (styles.typography.textDecoration) css.textDecoration = styles.typography.textDecoration;
    if (styles.typography.textTransform) css.textTransform = styles.typography.textTransform;
  }

  // Background
  if (styles.background) {
    if (styles.background.color) css.backgroundColor = styles.background.color;
    if (styles.background.gradient) {
      const { type, angle, stops } = styles.background.gradient;
      const gradientStops = stops
        .map((s) => `${s.color} ${s.position}%`)
        .join(', ');
      css.background =
        type === 'linear'
          ? `linear-gradient(${angle || 180}deg, ${gradientStops})`
          : `radial-gradient(circle, ${gradientStops})`;
    }
    if (styles.background.image) {
      css.backgroundImage = `url(${styles.background.image.url})`;
      css.backgroundSize = styles.background.image.size;
      css.backgroundPosition = styles.background.image.position;
      css.backgroundRepeat = styles.background.image.repeat;
    }
  }

  // Border
  if (styles.border) {
    if (styles.border.width && styles.border.style && styles.border.color) {
      css.border = `${styles.border.width} ${styles.border.style} ${styles.border.color}`;
    }
    if (styles.border.radius) css.borderRadius = styles.border.radius;
  }

  // Effects
  if (styles.effects) {
    if (styles.effects.shadow) css.boxShadow = styles.effects.shadow;
    if (styles.effects.opacity !== undefined) css.opacity = styles.effects.opacity;

    const filters: string[] = [];
    if (styles.effects.blur) filters.push(`blur(${styles.effects.blur})`);
    if (styles.effects.brightness !== undefined) filters.push(`brightness(${styles.effects.brightness})`);
    if (styles.effects.contrast !== undefined) filters.push(`contrast(${styles.effects.contrast})`);
    if (styles.effects.saturate !== undefined) filters.push(`saturate(${styles.effects.saturate})`);
    if (filters.length > 0) css.filter = filters.join(' ');
  }

  // Transform
  if (styles.transform) {
    const transforms: string[] = [];
    if (styles.transform.scale !== undefined) transforms.push(`scale(${styles.transform.scale})`);
    if (styles.transform.rotate !== undefined) transforms.push(`rotate(${styles.transform.rotate}deg)`);
    if (styles.transform.translateX) transforms.push(`translateX(${styles.transform.translateX})`);
    if (styles.transform.translateY) transforms.push(`translateY(${styles.transform.translateY})`);
    if (styles.transform.skewX !== undefined) transforms.push(`skewX(${styles.transform.skewX}deg)`);
    if (styles.transform.skewY !== undefined) transforms.push(`skewY(${styles.transform.skewY}deg)`);
    if (transforms.length > 0) css.transform = transforms.join(' ');
  }

  // Transition
  if (styles.transition) {
    const property = styles.transition.property || 'all';
    const duration = styles.transition.duration || '200ms';
    const easing = styles.transition.easing || 'ease';
    const delay = styles.transition.delay || '0ms';
    css.transition = `${property} ${duration} ${easing} ${delay}`;
  }

  return css;
}

/**
 * Generate Tailwind config from design tokens
 */
export function generateTailwindConfig(tokens: DesignTokens): string {
  return `
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: ${JSON.stringify(tokens.colors.primary, null, 8).replace(/"/g, "'")},
        secondary: ${JSON.stringify(tokens.colors.secondary, null, 8).replace(/"/g, "'")},
      },
      fontFamily: {
        heading: ['${tokens.typography.fonts.heading.name}', ${tokens.typography.fonts.heading.fallback.map(f => `'${f}'`).join(', ')}],
        body: ['${tokens.typography.fonts.body.name}', ${tokens.typography.fonts.body.fallback.map(f => `'${f}'`).join(', ')}],
        mono: ['${tokens.typography.fonts.mono.name}', ${tokens.typography.fonts.mono.fallback.map(f => `'${f}'`).join(', ')}],
      },
      borderRadius: ${JSON.stringify(tokens.radius, null, 8).replace(/"/g, "'")},
      boxShadow: ${JSON.stringify(tokens.shadows, null, 8).replace(/"/g, "'")},
    },
  },
}
`;
}
