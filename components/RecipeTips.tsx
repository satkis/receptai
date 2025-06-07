import React from 'react';
import { Lightbulb } from 'lucide-react';

interface RecipeTipsProps {
  tips: {
    lt: string[];
    en: string[];
  };
  language?: string;
  className?: string;
}

export default function RecipeTips({ tips, language = 'lt', className = '' }: RecipeTipsProps) {
  // Get tips for current language
  const currentTips = tips[language as keyof typeof tips] || tips.lt || [];
  
  // Don't render if no tips
  if (!currentTips || currentTips.length === 0) {
    return null;
  }

  // Parse tip text to extract bold categories
  const parseTipText = (tipText: string) => {
    // Match **Category:** pattern
    const match = tipText.match(/^\*\*(.*?):\*\*\s*(.*)$/);
    
    if (match) {
      const [, category, content] = match;
      return {
        category: category.trim(),
        content: content.trim()
      };
    }
    
    // If no category pattern found, return as plain content
    return {
      category: null,
      content: tipText
    };
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">Patarimai</h2>
      </div>
      
      <ul className="space-y-3">
        {currentTips.map((tip, index) => {
          const { category, content } = parseTipText(tip);
          
          return (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed">
                  {category && (
                    <span className="font-semibold text-gray-900">{category}: </span>
                  )}
                  <span>{content}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
