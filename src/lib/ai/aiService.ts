import type {
  ContentGenerationRequest,
  ContentGenerationResponse,
  DesignSuggestionType,
  DesignContext,
  DesignSuggestionResponse,
  ComponentEnhancementRequest,
  ComponentEnhancementResponse,
  SEOAnalysisRequest,
  SEOAnalysisResponse,
  AccessibilityAnalysisRequest,
  AccessibilityAnalysisResponse,
  AICopilotRequest,
  AICopilotResponse,
  AISettings,
  ContentLanguage,
} from '@/types/ai';

// Default AI Settings
const DEFAULT_SETTINGS: AISettings = {
  enabled: true,
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 1024,
  defaultLanguage: 'he',
  defaultTone: 'professional',
  autoSuggestions: true,
  cacheDuration: 30,
};

// Simple cache for AI responses
const responseCache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(type: string, params: any): string {
  return `${type}:${JSON.stringify(params)}`;
}

function getCachedResponse<T>(key: string, maxAge: number): T | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge * 60 * 1000) {
    return cached.data as T;
  }
  return null;
}

function setCachedResponse(key: string, data: any): void {
  responseCache.set(key, { data, timestamp: Date.now() });
}

// Base AI API call
async function callAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  settings: Partial<AISettings> = {}
): Promise<string> {
  const config = { ...DEFAULT_SETTINGS, ...settings };

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

// ============================================
// Content Generation
// ============================================

export async function generateContent(
  request: ContentGenerationRequest
): Promise<ContentGenerationResponse> {
  const cacheKey = getCacheKey('content', request);
  const cached = getCachedResponse<ContentGenerationResponse>(cacheKey, 30);
  if (cached) return cached;

  const langMap: Record<ContentLanguage, string> = {
    he: 'עברית',
    en: 'English',
    ar: 'العربية',
  };

  const typePrompts: Record<string, string> = {
    headline: 'כותרת ראשית קצרה וחזקה (עד 10 מילים)',
    subheadline: 'כותרת משנה תומכת (עד 20 מילים)',
    paragraph: 'פסקה שיווקית (50-100 מילים)',
    'bullet-points': 'רשימת נקודות (3-5 פריטים)',
    'call-to-action': 'קריאה לפעולה ברורה (2-5 מילים)',
    'product-description': 'תיאור מוצר מפורט (100-150 מילים)',
    testimonial: 'המלצת לקוח אותנטית',
    faq: 'שאלה ותשובה נפוצה',
    'meta-description': 'תיאור מטא לSEO (150-160 תווים)',
    'social-post': 'פוסט לרשתות חברתיות',
  };

  const systemPrompt = `אתה קופירייטר מומחה. צור תוכן ${typePrompts[request.type] || request.type} ב${langMap[request.language || 'he']}.
${request.tone ? `הטון: ${request.tone}` : ''}
${request.industry ? `תעשייה: ${request.industry}` : ''}
${request.targetAudience ? `קהל יעד: ${request.targetAudience}` : ''}
${request.keywords?.length ? `מילות מפתח לשלב: ${request.keywords.join(', ')}` : ''}
${request.maxLength ? `אורך מקסימלי: ${request.maxLength} תווים` : ''}

החזר ${request.count || 3} אפשרויות שונות, כל אחת בשורה נפרדת.`;

  const userPrompt = request.context || 'צור תוכן עבור אתר עסקי';

  try {
    const content = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const options = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, request.count || 3);

    const response: ContentGenerationResponse = {
      id: `content-${Date.now()}`,
      content: options,
      type: request.type,
      metadata: {
        tokens: content.length,
        generatedAt: new Date().toISOString(),
        model: DEFAULT_SETTINGS.model || 'claude',
      },
    };

    setCachedResponse(cacheKey, response);
    return response;
  } catch (error) {
    // Return fallback content
    return {
      id: `content-${Date.now()}`,
      content: ['שגיאה ביצירת תוכן. נסה שוב.'],
      type: request.type,
      metadata: {
        tokens: 0,
        generatedAt: new Date().toISOString(),
        model: 'fallback',
      },
    };
  }
}

// ============================================
// Design Suggestions
// ============================================

export async function getDesignSuggestions(
  type: DesignSuggestionType,
  context: DesignContext
): Promise<DesignSuggestionResponse> {
  const cacheKey = getCacheKey('design', { type, context });
  const cached = getCachedResponse<DesignSuggestionResponse>(cacheKey, 60);
  if (cached) return cached;

  const systemPrompts: Record<DesignSuggestionType, string> = {
    'color-palette': `אתה מומחה לעיצוב צבעים. בהתבסס על ההקשר, הצע 3 פלטות צבעים.
כל פלטה תכלול: primary, secondary, accent, background, text, success, warning, error.
החזר JSON בפורמט: [{"primary": "#...", "secondary": "#...", ...}]`,

    typography: `אתה מומחה טיפוגרפיה. הצע 3 שילובי פונטים מתאימים.
כלול: headingFont, bodyFont, monoFont, scale.
התאם לתעשייה ולקהל היעד.
החזר JSON.`,

    layout: `אתה מומחה לעיצוב ממשק. הצע 3 פריסות מתאימות.
כלול: type (grid/flex/masonry), columns, gap, alignment.
החזר JSON.`,

    spacing: `הצע מערכת spacing מותאמת לעיצוב.`,

    'component-style': `הצע סגנון לרכיב ספציפי.`,

    'full-theme': `הצע ערכת נושא מלאה כולל צבעים, טיפוגרפיה ופריסה.`,
  };

  const userPrompt = `
תעשייה: ${context.industry || 'כללי'}
תיאור מותג: ${context.brandDescription || 'לא צוין'}
קהל יעד: ${context.targetAudience || 'כללי'}
מצב רוח: ${context.mood?.join(', ') || 'מקצועי'}
צבעים קיימים: ${context.existingColors?.join(', ') || 'אין'}
נגישות: ${context.accessibility || 'standard'}
`;

  try {
    const content = await callAI([
      { role: 'system', content: systemPrompts[type] },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const response: DesignSuggestionResponse = {
      id: `design-${Date.now()}`,
      type,
      suggestions: {
        colorPalette: type === 'color-palette' ? suggestions : undefined,
        typography: type === 'typography' ? suggestions : undefined,
        layout: type === 'layout' ? suggestions : undefined,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        context,
      },
    };

    setCachedResponse(cacheKey, response);
    return response;
  } catch (error) {
    // Return fallback suggestions
    return {
      id: `design-${Date.now()}`,
      type,
      suggestions: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        context,
      },
    };
  }
}

// ============================================
// Component Enhancement
// ============================================

export async function enhanceComponent(
  request: ComponentEnhancementRequest
): Promise<ComponentEnhancementResponse> {
  const goalDescriptions: Record<string, string> = {
    'improve-conversion': 'שפר את הרכיב להגדלת המרות (יותר לחיצות, הרשמות)',
    'improve-readability': 'שפר את הקריאות והבהירות',
    modernize: 'עדכן את העיצוב לסגנון מודרני יותר',
    simplify: 'פשט את הרכיב והסר מורכבות מיותרת',
    localize: 'התאם את התוכן לקהל הישראלי',
  };

  const systemPrompt = `אתה מומחה UX/UI. ${goalDescriptions[request.goal || 'improve-conversion']}
לרכיב מסוג: ${request.componentType}
החזר JSON עם הצעות לשיפור content ו-styles.`;

  const userPrompt = `
תוכן נוכחי: ${JSON.stringify(request.currentContent || {})}
סגנונות נוכחיים: ${JSON.stringify(request.currentStyles || {})}
אילוצים: ${request.constraints?.join(', ') || 'אין'}
`;

  try {
    const content = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const suggestion = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      id: `enhance-${Date.now()}`,
      suggestions: [
        {
          content: suggestion.content,
          styles: suggestion.styles,
          rationale: suggestion.rationale || 'שיפור מבוסס AI',
          expectedImpact: suggestion.expectedImpact || 'שיפור צפוי בחוויית המשתמש',
        },
      ],
    };
  } catch (error) {
    return {
      id: `enhance-${Date.now()}`,
      suggestions: [],
    };
  }
}

// ============================================
// SEO Analysis
// ============================================

export async function analyzeSEO(
  request: SEOAnalysisRequest
): Promise<SEOAnalysisResponse> {
  const systemPrompt = `אתה מומחה SEO. נתח את התוכן והחזר:
1. ציון כללי (0-100)
2. בעיות (severity: critical/warning/info, type, message, suggestion)
3. הזדמנויות לשיפור

החזר JSON בפורמט:
{
  "score": 75,
  "issues": [...],
  "opportunities": [...]
}`;

  const userPrompt = `
תוכן: ${request.content || 'לא זמין'}
URL: ${request.url || 'לא זמין'}
מילות מפתח: ${request.targetKeywords?.join(', ') || 'לא צוינו'}
שפה: ${request.language || 'he'}
`;

  try {
    const content = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, issues: [], opportunities: [] };

    return {
      score: analysis.score,
      issues: analysis.issues || [],
      opportunities: analysis.opportunities || [],
      metadata: {
        analyzedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      score: 0,
      issues: [],
      opportunities: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
      },
    };
  }
}

// ============================================
// Accessibility Analysis
// ============================================

export async function analyzeAccessibility(
  request: AccessibilityAnalysisRequest
): Promise<AccessibilityAnalysisResponse> {
  const systemPrompt = `אתה מומחה נגישות WCAG. נתח את הרכיב והחזר:
1. ציון נגישות (0-100)
2. רמת WCAG (A/AA/AAA)
3. בעיות נגישות ותיקונים מוצעים

החזר JSON בפורמט:
{
  "score": 85,
  "wcagLevel": "AA",
  "issues": [{"severity": "...", "criterion": "...", "message": "...", "fix": "..."}]
}`;

  const userPrompt = `
HTML: ${request.html || 'לא זמין'}
סגנונות: ${JSON.stringify(request.styles || {})}
`;

  try {
    const content = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { score: 0, wcagLevel: 'A', issues: [] };

    return {
      score: analysis.score,
      wcagLevel: analysis.wcagLevel,
      issues: analysis.issues || [],
    };
  } catch (error) {
    return {
      score: 0,
      wcagLevel: 'A',
      issues: [],
    };
  }
}

// ============================================
// AI Copilot
// ============================================

export async function chat(
  request: AICopilotRequest
): Promise<AICopilotResponse> {
  const capabilities = request.capabilities || ['content', 'design', 'code', 'seo', 'a11y'];

  const systemPrompt = `אתה עוזר AI חכם לעריכת אתרים. אתה יכול לעזור עם:
${capabilities.includes('content') ? '- יצירת ועריכת תוכן' : ''}
${capabilities.includes('design') ? '- הצעות עיצוב וסגנון' : ''}
${capabilities.includes('code') ? '- שאלות טכניות וקוד' : ''}
${capabilities.includes('seo') ? '- אופטימיזציה למנועי חיפוש' : ''}
${capabilities.includes('a11y') ? '- נגישות ותאימות WCAG' : ''}

הקשר נוכחי:
${request.context.selectedComponent ? `רכיב נבחר: ${request.context.selectedComponent.type}` : 'אין רכיב נבחר'}
${request.context.pageType ? `סוג דף: ${request.context.pageType}` : ''}

השב בעברית בצורה תמציתית ומועילה.`;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add history
  if (request.history) {
    request.history.forEach((msg) => {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
  }

  messages.push({ role: 'user', content: request.message });

  try {
    const content = await callAI(messages);

    const responseMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant' as const,
      content,
      timestamp: new Date().toISOString(),
    };

    // Extract suggestions if any
    const suggestions: AICopilotResponse['suggestions'] = [];

    // Check for content suggestions
    if (content.includes('```')) {
      const codeMatch = content.match(/```(?:json)?\n?([\s\S]*?)```/);
      if (codeMatch) {
        try {
          const data = JSON.parse(codeMatch[1]);
          suggestions.push({
            type: 'design',
            preview: 'הצעת עיצוב',
            data,
          });
        } catch {
          // Not valid JSON, might be content
          suggestions.push({
            type: 'content',
            preview: codeMatch[1].slice(0, 50),
            data: codeMatch[1],
          });
        }
      }
    }

    return {
      message: responseMessage,
      suggestions,
      relatedQuestions: [
        'איך לשפר את הרכיב הזה?',
        'הצע עיצוב חלופי',
        'כתוב תוכן חדש',
      ],
    };
  } catch (error) {
    return {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'מצטער, נתקלתי בשגיאה. נסה שוב.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ============================================
// Quick Actions
// ============================================

export async function rewriteText(
  text: string,
  style: 'shorter' | 'longer' | 'formal' | 'casual' | 'persuasive'
): Promise<string> {
  const stylePrompts: Record<string, string> = {
    shorter: 'קצר את הטקסט תוך שמירה על המסר העיקרי',
    longer: 'הרחב את הטקסט עם פרטים נוספים',
    formal: 'כתוב מחדש בסגנון פורמלי ומקצועי',
    casual: 'כתוב מחדש בסגנון ידידותי ולא רשמי',
    persuasive: 'כתוב מחדש בסגנון משכנע ומניע לפעולה',
  };

  try {
    const content = await callAI([
      { role: 'system', content: stylePrompts[style] },
      { role: 'user', content: text },
    ]);
    return content;
  } catch {
    return text;
  }
}

export async function improveHeadline(headline: string): Promise<string[]> {
  try {
    const content = await callAI([
      {
        role: 'system',
        content: 'צור 5 גרסאות משופרות של הכותרת. כל גרסה בשורה נפרדת.',
      },
      { role: 'user', content: headline },
    ]);

    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);
  } catch {
    return [headline];
  }
}

export async function suggestCTA(context: string): Promise<string[]> {
  try {
    const content = await callAI([
      {
        role: 'system',
        content: 'הצע 5 קריאות לפעולה (CTA) מתאימות להקשר. כל הצעה בשורה נפרדת.',
      },
      { role: 'user', content: context },
    ]);

    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);
  } catch {
    return ['התחל עכשיו', 'צור קשר', 'למידע נוסף'];
  }
}
