import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface EnhancedTextDisplayProps {
  className?: string;
  content?: string;
  enableHighlighting?: boolean;
  renderMode?: 'rich' | 'plain' | 'mixed';
}

export const EnhancedTextDisplay: React.FC<EnhancedTextDisplayProps> = ({
  className = "",
  content = "",
  enableHighlighting = true,
  renderMode = 'mixed'
}) => {
  // Enhanced preprocessing to handle various LaTeX delimiters and markdown
  const preprocessContent = (text: string): string => {
    return text
      // Convert LaTeX block delimiters to standard $$
      .replace(/\\\[/g, '$$')
      .replace(/\\\]/g, '$$')
      // Convert LaTeX inline delimiters to standard $
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$')
      // Convert displaystyle LaTeX
      .replace(/\\begin{equation\*?}/g, '$$')
      .replace(/\\end{equation\*?}/g, '$$')
      // Handle text formatting commands
      .replace(/\\text{([^}]*)}/g, '$1') // Extract text from \text{}
      .replace(/\\tfrac{([^}]*)}{([^}]*)}/g, '\\frac{$1}{$2}') // Simplify \tfrac
      // Normalize spaces around math delimiters
      .replace(/\$\s*(.*?)\s*\$/g, '$$1$')
      .replace(/\$\$\s*(.*?)\s*\$\$/g, '$$$1$$');
  };

  // Enhanced segmentation to handle markdown formatting and various LaTeX patterns
  const segmentContent = (text: string): string[] => {
    const processedText = preprocessContent(text);
    
    // Split by math expressions AND markdown formatting
    const pattern = /(\$\$[^$]*\$\$|\$[^$]*\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const segments: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(processedText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        segments.push(processedText.slice(lastIndex, match.index));
      }
      // Add the matched segment
      segments.push(match[0]);
      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < processedText.length) {
      segments.push(processedText.slice(lastIndex));
    }

    return segments.filter(segment => segment.length > 0);
  };

  const renderMathContent = (content: string, isBlock: boolean) => {
    try {
      const mathContent = content.slice(isBlock ? 2 : 1, isBlock ? -2 : -1);
      return isBlock ? <BlockMath math={mathContent} /> : <InlineMath math={mathContent} />;
    } catch (error) {
      console.warn('KaTeX rendering error:', error);
      return (
        <span className="text-red-500 bg-red-50 px-1 rounded">
          [Math Error: {content}]
        </span>
      );
    }
  };

  const isSingleSpecialCharacter = (text: string): boolean => {
    if (text.length !== 1) return false;
    const char = text.charAt(0);
    const specialChars = /[→←↑↓↔↕⇄⇆⇒⇔⇌⇋∝≈≠≡≅∼∽∞∂∇∆√∛∜∫∬∭∮∯∰∶∷∸∹∺∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩≪≫≬≭≮≯≰≱≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋⊌⊍⊎⊏⊐⊑⊒⊓⊔⊕⊖⊗⊘⊙⊚⊛⊜⊝⊞⊟⊠⊡⊢⊣⊤⊥⊦⊧⊨⊩⊪⊫⊬⊭⊮⊯⊰⊱⊲⊳⊴⊵⊶⊷⊸⊹⊺⊻⊼⊽⊾⊿⋀⋁⋂⋃⋄⋅⋆⋇⋈⋉⋊⋋⋌⋍⋎⋏⋐⋑⋒⋓⋔⋕⋖⋗⋘⋙⋚⋛⋜⋝⋞⋟⋠⋡⋢⋣⋤⋥⋦⋧⋨⋩⋪⋫⋬⋭⋮⋯⋰⋱⋲⋳⋴⋵⋶⋷⋸⋹⋺⋻⋼⋽⋾⋿]/;
    return specialChars.test(char) || /[≠≤≥≈∝→]/g.test(char);
  };

  const renderSegment = (segment: string, index: number) => {
    // Block equations ($$...$$)
    if (segment.startsWith('$$') && segment.endsWith('$$')) {
      return (
        <div key={index} className="my-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex justify-center overflow-x-auto">
            {renderMathContent(segment, true)}
          </div>
        </div>
      );
    }

    // Inline equations ($...$)
    if (segment.startsWith('$') && segment.endsWith('$')) {
      const mathContent = segment.slice(1, -1);
      
      if (isSingleSpecialCharacter(mathContent)) {
        return (
          <span key={index} className="mx-0.5">
            {renderMathContent(segment, false)}
          </span>
        );
      }
      
      return enableHighlighting ? (
        <span key={index} className=" text-orange-800">
          {renderMathContent(segment, false)}
        </span>
      ) : (
        <span key={index} className="mx-0.5">
          {renderMathContent(segment, false)}
        </span>
      );
    }

    // Bold text (**text**)
    if (segment.startsWith('**') && segment.endsWith('**')) {
      const boldContent = segment.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-gray-900">
          {boldContent}
        </strong>
      );
    }

    // Italic text (*text*)
    if (segment.startsWith('*') && segment.endsWith('*') && segment.length > 2) {
      const italicContent = segment.slice(1, -1);
      return (
        <em key={index} className="italic text-gray-800">
          {italicContent}
        </em>
      );
    }

    // Inline code (`text`)
    if (segment.startsWith('`') && segment.endsWith('`')) {
      const codeContent = segment.slice(1, -1);
      return (
        <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800 border">
          {codeContent}
        </code>
      );
    }

    // Single special characters
    if (isSingleSpecialCharacter(segment)) {
      return (
        <span key={index} className="mx-0.5">
          {segment}
        </span>
      );
    }

    // Regular text
    return (
      <span key={index} className="leading-7 text-gray-800 tracking-wide whitespace-normal">
        {segment}
      </span>
    );
  };

  const renderPlainText = (text: string) => {
    const cleanText = text
      .replace(/\$[^$]*\$/g, '')
      .replace(/\$\$[^$]*\$\$/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic
      .replace(/`([^`]+)`/g, '$1')       // Remove code
      .replace(/_/g, '')
      .replace(/\^/g, '')
      .replace(/\\/g, '');

    return (
      <span className="leading-7 text-gray-800 whitespace-pre-wrap">
        {cleanText}
      </span>
    );
  };

  // Main render logic
  if (renderMode === 'plain') {
    return (
      <div className={`${className} prose prose-lg max-w-none font-sans`}>
        {renderPlainText(content)}
      </div>
    );
  }

  const segments = segmentContent(content);

  return (
    <div className={`${className} prose prose-lg max-w-none font-sans`}>
      <div className="whitespace-pre-wrap break-words">
        {segments.map((segment, index) => renderSegment(segment, index))}
      </div>
    </div>
  );
};

// // Hook for using this component with dynamic content
// export const useScientificText = (initialContent: string = '') => {
//   const [content, setContent] = React.useState(initialContent);

//   return {
//     content,
//     setContent,
//     ScientificText: (props: Omit<EnhancedTextDisplayProps, 'content'>) => (
//       <EnhancedTextDisplay content={content} {...props} />
//     )
//   };
// };

// // Example usage component
// export const ScientificResponseViewer: React.FC<{
//   response: string;
//   className?: string;
// }> = ({ response, className }) => {
//   return (
//     <div className={`space-y-4 ${className}`}>
//       <EnhancedTextDisplay
//         content={response}
//         enableHighlighting={true}
//         renderMode="mixed"
//         className="p-4 bg-white rounded-lg border border-gray-200"
//       />
//     </div>
//   );
// };

export default EnhancedTextDisplay;