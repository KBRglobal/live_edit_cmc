'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  DesignSuggestionType,
  DesignContext,
  ColorPaletteSuggestion,
  TypographySuggestion,
  LayoutSuggestion,
} from '@/types/ai';
import { getDesignSuggestions, enhanceComponent } from '@/lib/ai/aiService';

interface AIDesignAssistantProps {
  onApplyColorPalette?: (palette: ColorPaletteSuggestion) => void;
  onApplyTypography?: (typography: TypographySuggestion) => void;
  onApplyLayout?: (layout: LayoutSuggestion) => void;
  onClose?: () => void;
  currentComponent?: {
    id: string;
    type: string;
    content: Record<string, any>;
    styles: Record<string, any>;
  };
}

const INDUSTRIES = [
  { value: 'tech', label: 'טכנולוגיה', icon: '💻' },
  { value: 'finance', label: 'פיננסים', icon: '💰' },
  { value: 'health', label: 'בריאות', icon: '🏥' },
  { value: 'education', label: 'חינוך', icon: '📚' },
  { value: 'retail', label: 'קמעונאות', icon: '🛍️' },
  { value: 'food', label: 'מזון', icon: '🍕' },
  { value: 'travel', label: 'תיירות', icon: '✈️' },
  { value: 'real-estate', label: 'נדל"ן', icon: '🏠' },
  { value: 'beauty', label: 'יופי', icon: '💄' },
  { value: 'fitness', label: 'כושר', icon: '💪' },
];

const MOODS = [
  { value: 'professional', label: 'מקצועי' },
  { value: 'modern', label: 'מודרני' },
  { value: 'playful', label: 'שובב' },
  { value: 'elegant', label: 'אלגנטי' },
  { value: 'minimalist', label: 'מינימליסטי' },
  { value: 'bold', label: 'נועז' },
  { value: 'warm', label: 'חם' },
  { value: 'cool', label: 'קריר' },
  { value: 'trustworthy', label: 'אמין' },
  { value: 'innovative', label: 'חדשני' },
];

const AUDIENCES = [
  { value: 'b2b', label: 'עסקים (B2B)' },
  { value: 'b2c', label: 'צרכנים (B2C)' },
  { value: 'young', label: 'צעירים' },
  { value: 'professionals', label: 'אנשי מקצוע' },
  { value: 'families', label: 'משפחות' },
  { value: 'seniors', label: 'מבוגרים' },
  { value: 'luxury', label: 'שוק יוקרה' },
  { value: 'budget', label: 'חסכוני' },
];

export function AIDesignAssistant({
  onApplyColorPalette,
  onApplyTypography,
  onApplyLayout,
  onClose,
  currentComponent,
}: AIDesignAssistantProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'enhance'>('colors');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Context state
  const [industry, setIndustry] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState('');
  const [existingColors, setExistingColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('#3B82F6');

  // Results state
  const [colorPalettes, setColorPalettes] = useState<ColorPaletteSuggestion[]>([]);
  const [typographySuggestions, setTypographySuggestions] = useState<TypographySuggestion[]>([]);
  const [layoutSuggestions, setLayoutSuggestions] = useState<LayoutSuggestion[]>([]);
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<any[]>([]);

  const buildContext = (): DesignContext => ({
    industry,
    brandDescription,
    existingColors,
    targetAudience,
    mood: selectedMoods,
    accessibility: 'standard',
  });

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const addColor = () => {
    if (newColor && !existingColors.includes(newColor)) {
      setExistingColors([...existingColors, newColor]);
    }
  };

  const removeColor = (color: string) => {
    setExistingColors(existingColors.filter((c) => c !== color));
  };

  // Fetch color suggestions
  const fetchColorSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDesignSuggestions('color-palette', buildContext());
      setColorPalettes(response.suggestions.colorPalette || []);
    } catch (err) {
      setError('שגיאה בקבלת הצעות צבעים');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [industry, brandDescription, existingColors, targetAudience, selectedMoods]);

  // Fetch typography suggestions
  const fetchTypographySuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDesignSuggestions('typography', buildContext());
      setTypographySuggestions(response.suggestions.typography || []);
    } catch (err) {
      setError('שגיאה בקבלת הצעות טיפוגרפיה');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [industry, brandDescription, targetAudience, selectedMoods]);

  // Fetch layout suggestions
  const fetchLayoutSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDesignSuggestions('layout', buildContext());
      setLayoutSuggestions(response.suggestions.layout || []);
    } catch (err) {
      setError('שגיאה בקבלת הצעות פריסה');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [industry, brandDescription, targetAudience, selectedMoods]);

  // Enhance component
  const fetchEnhancementSuggestions = useCallback(async () => {
    if (!currentComponent) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await enhanceComponent({
        componentType: currentComponent.type,
        currentContent: currentComponent.content,
        currentStyles: currentComponent.styles,
        goal: 'improve-conversion',
      });
      setEnhancementSuggestions(response.suggestions);
    } catch (err) {
      setError('שגיאה בשיפור הרכיב');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentComponent]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="ai-design-assistant bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-500 to-pink-500 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="text-lg font-semibold">עוזר עיצוב AI</h2>
              <p className="text-sm text-white/80">הצעות עיצוב מותאמות אישית</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0">
        {[
          { id: 'colors', label: 'צבעים', icon: '🎨' },
          { id: 'typography', label: 'טיפוגרפיה', icon: '🔤' },
          { id: 'layout', label: 'פריסה', icon: '📐' },
          { id: 'enhance', label: 'שיפור רכיב', icon: '⬆️', disabled: !currentComponent },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
            disabled={tab.disabled}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : tab.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="ml-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Context Form - shared across tabs */}
        <div className="context-form mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">הקשר העיצובי</h3>

          {/* Industry */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">תעשייה</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.value}
                  onClick={() => setIndustry(ind.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs transition-all
                    ${
                      industry === ind.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-white dark:bg-gray-700 border hover:border-purple-300'
                    }
                  `}
                >
                  {ind.icon} {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">
              מצב רוח (בחר עד 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => toggleMood(mood.value)}
                  disabled={
                    !selectedMoods.includes(mood.value) && selectedMoods.length >= 3
                  }
                  className={`
                    px-3 py-1.5 rounded-full text-xs transition-all
                    ${
                      selectedMoods.includes(mood.value)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white dark:bg-gray-700 border hover:border-purple-300 disabled:opacity-50'
                    }
                  `}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">קהל יעד</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((aud) => (
                <button
                  key={aud.value}
                  onClick={() => setTargetAudience(aud.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs transition-all
                    ${
                      targetAudience === aud.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-white dark:bg-gray-700 border hover:border-purple-300'
                    }
                  `}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Description */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">תיאור המותג</label>
            <input
              type="text"
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              placeholder="תאר את המותג או העסק בקצרה..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {/* Existing Colors */}
            <div>
              <label className="block text-sm font-medium mb-2">
                צבעים קיימים (אופציונלי)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg"
                />
                <button
                  onClick={addColor}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  הוסף
                </button>
              </div>
              {existingColors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {existingColors.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs">{color}</span>
                      <button
                        onClick={() => removeColor(color)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={fetchColorSuggestions}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-l from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '⏳ מייצר הצעות...' : '🎨 הצע פלטות צבעים'}
            </button>

            {/* Color Palettes Results */}
            <AnimatePresence>
              {colorPalettes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold">
                    פלטות מוצעות ({colorPalettes.length})
                  </h3>
                  {colorPalettes.map((palette, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border hover:border-purple-500 transition-colors"
                    >
                      <div className="flex gap-2 mb-3">
                        {Object.entries(palette)
                          .filter(([key]) => key !== 'rationale')
                          .map(([key, color]) => (
                            <div
                              key={key}
                              className="flex-1 group relative"
                            >
                              <div
                                className="h-12 rounded-lg shadow-inner"
                                style={{ backgroundColor: color }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                                <span className="text-white text-xs">{key}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {palette.rationale}
                      </p>
                      <button
                        onClick={() => onApplyColorPalette?.(palette)}
                        className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                      >
                        החל פלטה
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <button
              onClick={fetchTypographySuggestions}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-l from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '⏳ מייצר הצעות...' : '🔤 הצע טיפוגרפיה'}
            </button>

            <AnimatePresence>
              {typographySuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold">
                    הצעות טיפוגרפיה ({typographySuggestions.length})
                  </h3>
                  {typographySuggestions.map((typography, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border hover:border-purple-500 transition-colors"
                    >
                      <div className="space-y-2 mb-3">
                        <div
                          className="text-2xl font-bold"
                          style={{ fontFamily: typography.headingFont }}
                        >
                          {typography.headingFont} - כותרת
                        </div>
                        <div
                          className="text-base"
                          style={{ fontFamily: typography.bodyFont }}
                        >
                          {typography.bodyFont} - טקסט גוף לדוגמה עם מספר מילים.
                        </div>
                        <div
                          className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded"
                          style={{ fontFamily: typography.monoFont }}
                        >
                          {typography.monoFont} - קוד
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        סקאלה: {typography.scale}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {typography.rationale}
                      </p>
                      <button
                        onClick={() => onApplyTypography?.(typography)}
                        className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                      >
                        החל טיפוגרפיה
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <button
              onClick={fetchLayoutSuggestions}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-l from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '⏳ מייצר הצעות...' : '📐 הצע פריסות'}
            </button>

            <AnimatePresence>
              {layoutSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold">
                    הצעות פריסה ({layoutSuggestions.length})
                  </h3>
                  {layoutSuggestions.map((layout, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border hover:border-purple-500 transition-colors"
                    >
                      <LayoutPreview layout={layout} />
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                          <div className="text-gray-500">סוג</div>
                          <div className="font-medium">{layout.type}</div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                          <div className="text-gray-500">עמודות</div>
                          <div className="font-medium">{layout.columns}</div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                          <div className="text-gray-500">רווח</div>
                          <div className="font-medium">{layout.gap}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-3">
                        {layout.rationale}
                      </p>
                      <button
                        onClick={() => onApplyLayout?.(layout)}
                        className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                      >
                        החל פריסה
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Enhance Tab */}
        {activeTab === 'enhance' && currentComponent && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">רכיב נבחר</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>סוג: {currentComponent.type}</p>
                <p>ID: {currentComponent.id}</p>
              </div>
            </div>

            <button
              onClick={fetchEnhancementSuggestions}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-l from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '⏳ מנתח...' : '⬆️ הצע שיפורים'}
            </button>

            <AnimatePresence>
              {enhancementSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold">
                    הצעות שיפור ({enhancementSuggestions.length})
                  </h3>
                  {enhancementSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      <h4 className="font-medium mb-2">{suggestion.rationale}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        השפעה צפויה: {suggestion.expectedImpact}
                      </p>
                      {suggestion.content && (
                        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                          <h5 className="text-xs font-medium text-gray-500 mb-1">
                            תוכן מוצע:
                          </h5>
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(suggestion.content, null, 2)}
                          </pre>
                        </div>
                      )}
                      <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        החל שיפור
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Layout Preview Component
function LayoutPreview({ layout }: { layout: LayoutSuggestion }) {
  const cols = layout.columns || 3;
  const items = Array.from({ length: cols }, (_, i) => i);

  return (
    <div
      className="grid gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
      style={{
        gridTemplateColumns: layout.type === 'masonry'
          ? `repeat(${cols}, 1fr)`
          : `repeat(${cols}, 1fr)`,
        gap: layout.gap || '0.5rem',
      }}
    >
      {items.map((i) => (
        <div
          key={i}
          className="bg-purple-200 dark:bg-purple-800 rounded"
          style={{
            height: layout.type === 'masonry' ? `${40 + (i % 3) * 20}px` : '40px',
          }}
        />
      ))}
    </div>
  );
}

export default AIDesignAssistant;
