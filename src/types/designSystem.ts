// ============================================
// Design System Types
// ============================================

// Color Types
export interface ColorShade {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ColorTokens {
  primary: ColorShade;
  secondary: ColorShade;
  neutral: ColorShade;
  semantic: SemanticColors;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    light: string;
    default: string;
    dark: string;
  };
}

// Typography Types
export interface FontFamily {
  name: string;
  fallback: string[];
  weights: number[];
  variable?: string;
}

export interface FontSize {
  size: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface TypographyTokens {
  fonts: {
    heading: FontFamily;
    body: FontFamily;
    mono: FontFamily;
  };
  sizes: {
    xs: FontSize;
    sm: FontSize;
    base: FontSize;
    lg: FontSize;
    xl: FontSize;
    '2xl': FontSize;
    '3xl': FontSize;
    '4xl': FontSize;
    '5xl': FontSize;
    '6xl': FontSize;
  };
  weights: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
}

// Spacing Types
export interface SpacingTokens {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

// Border Radius Types
export interface RadiusTokens {
  none: string;
  sm: string;
  default: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// Shadow Types
export interface ShadowTokens {
  none: string;
  sm: string;
  default: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// Breakpoint Types
export interface BreakpointTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Animation Types
export interface AnimationTokens {
  duration: {
    fastest: string;
    fast: string;
    normal: string;
    slow: string;
    slowest: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
}

// Complete Design Tokens
export interface DesignTokens {
  id: string;
  name: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
  animation: AnimationTokens;
}

// Theme Preset
export interface ThemePreset {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  thumbnail: string;
  tokens: Partial<DesignTokens>;
  category: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate';
  industry?: string[];
}

// Component Style Types
export interface BoxStyle {
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-flex' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: string;
  gridCols?: number;
  gridRows?: number;
}

export interface SpacingStyle {
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export interface SizeStyle {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface BackgroundStyle {
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { color: string; position: number }[];
  };
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'auto' | string;
    position: string;
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  };
}

export interface BorderStyle {
  width?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'none';
  color?: string;
  radius?: string;
}

export interface EffectStyle {
  shadow?: string;
  opacity?: number;
  blur?: string;
  brightness?: number;
  contrast?: number;
  saturate?: number;
}

export interface TransformStyle {
  scale?: number;
  rotate?: number;
  translateX?: string;
  translateY?: string;
  skewX?: number;
  skewY?: number;
}

export interface TransitionStyle {
  property?: string;
  duration?: string;
  easing?: string;
  delay?: string;
}

// Complete Component Style
export interface ComponentStyles {
  box?: BoxStyle;
  spacing?: SpacingStyle;
  size?: SizeStyle;
  typography?: TypographyStyle;
  background?: BackgroundStyle;
  border?: BorderStyle;
  effects?: EffectStyle;
  transform?: TransformStyle;
  transition?: TransitionStyle;
}

// Responsive Styles
export interface ResponsiveStyles {
  base: ComponentStyles;
  sm?: Partial<ComponentStyles>;
  md?: Partial<ComponentStyles>;
  lg?: Partial<ComponentStyles>;
  xl?: Partial<ComponentStyles>;
  '2xl'?: Partial<ComponentStyles>;
}

// State Styles
export interface StateStyles {
  default: ComponentStyles;
  hover?: Partial<ComponentStyles>;
  focus?: Partial<ComponentStyles>;
  active?: Partial<ComponentStyles>;
  disabled?: Partial<ComponentStyles>;
}

// Animation Keyframes
export interface AnimationKeyframe {
  offset: number; // 0-100
  styles: Partial<ComponentStyles>;
}

export interface AnimationConfig {
  name: string;
  duration: string;
  easing: string;
  delay?: string;
  iterationCount?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  keyframes?: AnimationKeyframe[];
}

// ============================================
// Component Variants System
// ============================================

// Variant Definition
export interface ComponentVariant {
  id: string;
  name: string;
  nameHe: string;
  description?: string;
  baseStyles: ComponentStyles;
  stateStyles: StateStyles;
  responsiveStyles?: ResponsiveStyles;
  animation?: AnimationConfig;
  isDefault?: boolean;
}

// Variant Group for a component type
export interface VariantGroup {
  componentType: string;
  variants: ComponentVariant[];
  defaultVariantId?: string;
}

// Complete Component Style Definition (with variants)
export interface ComponentStyleDefinition {
  id: string;
  componentId: string;
  componentType: string;
  activeVariantId: string;
  variants: ComponentVariant[];
  customOverrides?: Partial<ComponentStyles>;
  stateOverrides?: Partial<StateStyles>;
  responsiveOverrides?: Partial<ResponsiveStyles>;
}

// Built-in variant presets
export type VariantPresetType =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive'
  | 'success'
  | 'warning';

export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface VariantPreset {
  type: VariantPresetType;
  size: SizeVariant;
  styles: ComponentStyles;
  stateStyles: StateStyles;
}

// Style Inheritance
export interface StyleInheritance {
  inherit: boolean;
  parentId?: string;
  overrides?: Partial<ComponentStyles>;
}
