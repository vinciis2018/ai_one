import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface EquationRendererProps {
  className?: string;
  content?: string;
}

export const EnhancedTextDisplay: React.FC<EquationRendererProps> = ({ 
  className = "",
  content = ""
}) => {
  const renderContent = (text: string) => {
    // Enhanced regex to capture mathematical patterns and scientific notations
    const segments = text.split(/(\\\[[^]*?\\\]|\\\(.*?\\\)|η|[α-ω]|[Α-Ω]|\d+[−–—]\d+|\w+[−–—]\w+|\b[A-Z]+[−–—]?[0-9]+\b)/g);
    
    return segments.map((segment, index) => {
      // Block equations - centered with enhanced styling
      if (segment.startsWith('\\[') && segment.endsWith('\\]')) {
        const equation = segment.slice(2, -2);
        return (
          <div key={index} className="my-1 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex justify-center">
              <BlockMath math={equation} />
            </div>
          </div>
        );
      } 
      // Inline equations - highlighted with background
      else if (segment.startsWith('\\(') && segment.endsWith('\\)')) {
        const equation = segment.slice(2, -2);
        return (
          <span key={index} className="mx-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-md text-orange-800">
            <InlineMath math={equation} />
          </span>
        );
      }
      // Greek letters and scientific symbols
      else if (/^[α-ωΑ-Ωηλμνπσρτ]$/.test(segment)) {
        return (
          <span key={index} className="mx-0.5 px-1.5 py-0.5 bg-purple-50 border border-purple-200 rounded text-purple-700 font-medium">
            {segment}
          </span>
        );
      }
      // Dimension notations (like MLT^{-2}, L^2, etc.)
      else if (/([A-Z]+[−–—]?[0-9]+|[A-Z]+\^?\{?[−–—]?[0-9]+\}?)/.test(segment)) {
        return (
          <span key={index} className="mx-0.5 px-2 py-1 bg-green-50 border border-green-200 rounded-md text-green-800 font-medium">
            {segment}
          </span>
        );
      }
      

      // Regular text with improved spacing and typography
      else {
        return (
          <span key={index} className="leading-8 text-gray-800 text-justify tracking-wide">
            {segment}
          </span>
        );
      }
    });
  };

  return (
    <div className={`${className} prose prose-lg max-w-none font-serif`}>
      {renderContent(content)}
    </div>
  );
};