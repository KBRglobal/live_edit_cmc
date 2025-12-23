// ============================================
// AI Feature Types
// ============================================

// Content Generation Types
export type ContentType =
  | 'headline'
  | 'subheadline'
  | 'paragraph'
  | 'bullet-points'
  | 'call-to-action'
  | 'product-description'
  | 'testimonial'
  | 'faq'
  | 'meta-description'
  | 'social-post';

export type ContentTone =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'persuasive'
  | 'informative'
  | 'urgent'
  | 'playful';

export type ContentLanguage = 'he' | 'en' | 'ar';

export interface ContentGenerationRequest {
  type: ContentType;
  context?: string;
  keywords?: string[];
  tone?: ContentTone;
  language?: ContentLanguage;
  maxLength?: number;
  count?: number; // For generating multiple options
  industry?: string;
  targetAudience?: string;
}

export interface ContentGenerationResponse {
  id: string;
  content: string[];
  type: ContentType;
  metadata: {
    tokens: number;
    generatedAt: string;
    model: string;
  };
}

// Design Suggestions Types
export type DesignSuggestionType =
  | 'color-palette'
  | 'typography'
  | 'layout'
  | 'spacing'
  | 'component-style'
  | 'full-theme';

export interface DesignContext {
  industry?: string;
  brandDescription?: string;
  existingColors?: string[];
  targetAudience?: string;
  mood?: string[];
  competitors?: string[];
  accessibility?: 'standard' | 'enhanced' | 'strict';
}

export interface ColorPaletteSuggestion {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
  rationale: string;
}

export interface TypographySuggestion {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  scale: 'compact' | 'comfortable' | 'spacious';
  rationale: string;
}

export interface LayoutSuggestion {
  type: 'grid' | 'flex' | 'masonry' | 'asymmetric';
  columns: number;
  gap: string;
  alignment: 'left' | 'center' | 'right';
  rationale: string;
}

export interface DesignSuggestionResponse {
  id: string;
  type: DesignSuggestionType;
  suggestions: {
    colorPalette?: ColorPaletteSuggestion[];
    typography?: TypographySuggestion[];
    layout?: LayoutSuggestion[];
  };
  metadata: {
    generatedAt: string;
    context: DesignContext;
  };
}

// Component Enhancement Types
export interface ComponentEnhancementRequest {
  componentType: string;
  currentContent?: Record<string, any>;
  currentStyles?: Record<string, any>;
  goal?: 'improve-conversion' | 'improve-readability' | 'modernize' | 'simplify' | 'localize';
  constraints?: string[];
}

export interface ComponentEnhancementResponse {
  id: string;
  suggestions: {
    content?: Record<string, string>;
    styles?: Record<string, any>;
    rationale: string;
    expectedImpact: string;
  }[];
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string;
  style?: 'photo' | 'illustration' | 'abstract' | '3d' | 'icon';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2' | '9:16';
  count?: number;
}

export interface ImageGenerationResponse {
  id: string;
  images: {
    url: string;
    altText: string;
    width: number;
    height: number;
  }[];
}

// SEO Analysis Types
export interface SEOAnalysisRequest {
  url?: string;
  content?: string;
  targetKeywords?: string[];
  language?: ContentLanguage;
}

export interface SEOAnalysisResponse {
  score: number;
  issues: {
    severity: 'critical' | 'warning' | 'info';
    type: string;
    message: string;
    suggestion: string;
  }[];
  opportunities: string[];
  metadata: {
    analyzedAt: string;
  };
}

// A11y Analysis Types
export interface AccessibilityAnalysisRequest {
  componentId?: string;
  html?: string;
  styles?: Record<string, any>;
}

export interface AccessibilityAnalysisResponse {
  score: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  issues: {
    severity: 'critical' | 'warning' | 'info';
    criterion: string;
    element?: string;
    message: string;
    fix: string;
  }[];
}

// AI Chat/Copilot Types
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    action?: 'content' | 'design' | 'code' | 'explain';
    componentId?: string;
    applied?: boolean;
  };
}

export interface AICopilotContext {
  pageType?: string;
  selectedComponent?: {
    id: string;
    type: string;
    content: Record<string, any>;
    styles: Record<string, any>;
  };
  pageContent?: string;
  recentActions?: string[];
  userPreferences?: {
    language: ContentLanguage;
    tone: ContentTone;
    industry?: string;
  };
}

export interface AICopilotRequest {
  message: string;
  context: AICopilotContext;
  history?: AIChatMessage[];
  capabilities?: ('content' | 'design' | 'code' | 'seo' | 'a11y')[];
}

export interface AICopilotResponse {
  message: AIChatMessage;
  suggestions?: {
    type: 'content' | 'design' | 'code' | 'action';
    preview: string;
    data: any;
    applyAction?: () => void;
  }[];
  relatedQuestions?: string[];
}

// AI Settings & Configuration
export interface AISettings {
  enabled: boolean;
  provider: 'anthropic' | 'openai' | 'custom';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  defaultLanguage: ContentLanguage;
  defaultTone: ContentTone;
  autoSuggestions: boolean;
  cacheDuration: number; // minutes
}

// AI Usage & Analytics
export interface AIUsageStats {
  totalRequests: number;
  tokensUsed: number;
  contentGenerated: number;
  designSuggestions: number;
  lastUsed: string;
  popularFeatures: {
    feature: string;
    count: number;
  }[];
}
