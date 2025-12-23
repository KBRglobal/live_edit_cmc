import { NextRequest, NextResponse } from 'next/server';

// Types for API
interface GenerateRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// POST /api/ai/generate
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { messages, model, temperature, maxTokens } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return mock response for development
      console.log('No ANTHROPIC_API_KEY found, returning mock response');
      return NextResponse.json({
        content: getMockResponse(messages),
        model: 'mock',
        usage: { inputTokens: 0, outputTokens: 0 },
      });
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens || 1024,
        temperature: temperature ?? 0.7,
        system: messages.find((m) => m.role === 'system')?.content || '',
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return NextResponse.json(
        { error: 'AI service error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      content: data.content[0]?.text || '',
      model: data.model,
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
      },
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI content' },
      { status: 500 }
    );
  }
}

// Mock responses for development without API key
function getMockResponse(
  messages: { role: string; content: string }[]
): string {
  const lastUserMessage =
    messages.filter((m) => m.role === 'user').pop()?.content || '';
  const systemMessage =
    messages.find((m) => m.role === 'system')?.content || '';

  // Check for content type requests
  if (systemMessage.includes('כותרת') || systemMessage.includes('headline')) {
    return `הפתרון המושלם לעסק שלך
גלה את העתיד של השירות
הצטרף לאלפי לקוחות מרוצים`;
  }

  if (systemMessage.includes('פסקה') || systemMessage.includes('paragraph')) {
    return `אנחנו מאמינים שכל עסק ראוי לשירות מעולה. הצוות שלנו מחויב לספק לך את הפתרונות הטובים ביותר, עם תמיכה אישית ומקצועית. הצטרף לאלפי לקוחות שכבר גילו את היתרונות של העבודה איתנו.`;
  }

  if (systemMessage.includes('CTA') || systemMessage.includes('call-to-action')) {
    return `התחל עכשיו
צור קשר
גלה עוד
הצטרף אלינו
נסה בחינם`;
  }

  if (systemMessage.includes('צבע') || systemMessage.includes('color')) {
    return JSON.stringify([
      {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        rationale: 'פלטה מודרנית ומקצועית עם כחול כצבע ראשי',
      },
      {
        primary: '#059669',
        secondary: '#0891B2',
        accent: '#D97706',
        background: '#F9FAFB',
        text: '#111827',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        rationale: 'פלטה ירוקה טבעית המשדרת אמינות',
      },
      {
        primary: '#7C3AED',
        secondary: '#EC4899',
        accent: '#06B6D4',
        background: '#FAFAFA',
        text: '#18181B',
        success: '#22C55E',
        warning: '#EAB308',
        error: '#EF4444',
        rationale: 'פלטה יצירתית וצעירה עם סגול כצבע מוביל',
      },
    ]);
  }

  if (systemMessage.includes('SEO') || systemMessage.includes('seo')) {
    return JSON.stringify({
      score: 72,
      issues: [
        {
          severity: 'warning',
          type: 'meta-description',
          message: 'תיאור מטא חסר או קצר מדי',
          suggestion: 'הוסף תיאור מטא של 150-160 תווים',
        },
        {
          severity: 'info',
          type: 'heading-structure',
          message: 'מבנה כותרות לא אופטימלי',
          suggestion: 'וודא שימוש נכון ב-H1, H2, H3',
        },
      ],
      opportunities: [
        'הוסף מילות מפתח לכותרות',
        'שפר את מהירות הטעינה',
        'הוסף Alt text לתמונות',
      ],
    });
  }

  if (systemMessage.includes('נגישות') || systemMessage.includes('WCAG')) {
    return JSON.stringify({
      score: 85,
      wcagLevel: 'AA',
      issues: [
        {
          severity: 'warning',
          criterion: '1.4.3',
          message: 'ניגודיות צבעים לא מספקת',
          fix: 'הגדל את הניגודיות בין הטקסט לרקע',
        },
      ],
    });
  }

  // Default response
  return `זוהי תגובת Mock לפיתוח.
הוסף ANTHROPIC_API_KEY לקובץ .env לקבלת תגובות AI אמיתיות.

הודעה שהתקבלה: ${lastUserMessage.slice(0, 100)}...`;
}
