// components/SimpleMathDisplay.tsx
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface SimpleMathDisplayProps {
  content: string;
  className?: string;
}

export const EnhancedMathDisplay: React.FC<SimpleMathDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  const renderContent = (text: string) => {
    // First, manually convert the specific dimension formats to LaTeX
    const convertedText = text
      // Convert [ML^(-2)T^(4)Q^(-1)] to proper LaTeX
      .replace(/\[ML\^\(-2\)T\^\(4\)Q\^\(-1\)\]/g, '\\[ML^{-2}T^{4}Q^{-1}\\]')
      .replace(/\[ML\^\(-3\)T\^\(0\)Q\^\(2\)\]/g, '\\[ML^{-3}T^{0}Q^{2}\\]')
      .replace(/\[ML\^\(-1\)T\^\(-2\)Q\^\(-2\)\]/g, '\\[ML^{-1}T^{-2}Q^{-2}\\]')
      // Convert the equation
      .replace(/\[ML\^\(-2\)T\^\(4\)Q\^\(-1\)\] = k \* \[ML\^\(-3\)T\^\(0\)Q\^\(2\)\]/g, 
               '\\[ML^{-2}T^{4}Q^{-1} = k \\cdot ML^{-3}T^{0}Q^{2}\\]')
      // Convert the fraction at the end
      .replace(/k = C\\?_vacuum \/ C\\?_medium/g, '\\[ k = \\frac{C_{\\text{vacuum}}}{C_{\\text{medium}}} \\]');

    // Now split and render
    const parts = convertedText.split(/(\\\[.*?\\\])/s);
    
    return parts.map((part, index) => {
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const mathContent = part.slice(2, -2);
        try {
          return (
            <div
              key={index}
              className="my-4 overflow-x-auto flex justify-center"
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(mathContent, {
                  throwOnError: false,
                  displayMode: true,
                }),
              }}
            />
          );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return (
            <div key={index} className="text-red-500 text-center">
              Math rendering error
            </div>
          );
        }
      } else {
        return (
          <p key={index} className="mb-4">
            {part}
          </p>
        );
      }
    });
  };

  return (
    <div className={`p-2 ${className}`}>
      {renderContent(content)}
    </div>
  );
};
