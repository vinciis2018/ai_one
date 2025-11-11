/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface EnhancedTextDisplayProps {
  content: string;
  className?: string;
}

export const EnhancedTextDisplay: React.FC<EnhancedTextDisplayProps> = ({
  content,
  className = '',
}) => {
  /** Process text → clean LaTeX only when it’s real math */
  const processScientificContent = (text: string): string => {
    return text
      // [M L^2 T^-2] → \[M L^{2} T^{-2}\]
      .replace(/\[([^\]]+)\]/g, (_, inner) => {
        const latex = inner
          .replace(/([A-Za-z])\^(-?\d+)/g, '$1^{$2}')
          .replace(/([A-Za-z])_([a-z0-9]+)/g, '$1_{\\text{$2}}')
          .replace(/\s+/g, ' ');
        return `\\[${latex}\\]`;
      })
      // Real equations (avoid natural sentences)
      .replace(/(^|\s)([A-Za-z0-9]+)\s*=\s*([A-Za-z0-9\+\-\*\/\^\(\)]+)(?=($|\s|[,.]))/g, (_, pre, lhs, rhs) => {
        if (/[a-z]{3,}/i.test(rhs)) return `${pre}${lhs} = ${rhs}`;
        return `${pre}\\[${lhs} = ${rhs}\\]`;
      })
      // Fractions (safe)
      .replace(/\b([A-Za-z0-9]+)\/([A-Za-z0-9]+)\b/g, '\\frac{$1}{$2}')
      // Common Greek letters
      .replace(/Δ/g, '\\Delta ')
      .replace(/α/g, '\\alpha ')
      .replace(/β/g, '\\beta ')
      .replace(/θ/g, '\\theta ')
      .replace(/π/g, '\\pi ')
      // Remove any leftover "\ text" fragments or hanging slashes
      .replace(/\\\s+/g, '\\')
      .replace(/\\\\/g, '\\')
      .replace(/\s{2,}/g, ' ');
  };

  /** Highlight key scientific/physics words */
  const highlightScientificTerms = (text: string): React.ReactNode => {
    if (!text.trim()) return null;

    const patterns = [
      { regex: /(\d*\.?\d+)\s*([a-zA-Z]+\/[a-zA-Z]+|[a-zA-Z]+)/g, style: 'number' },
      { regex: /\b(velocity|acceleration|momentum|force|energy|power|work|pressure|stress|strain|modulus|density|specific heat|latent heat|refractive index|gradient)\b/gi, style: 'term' },
      { regex: /\b(Newtons?|Joules?|Watts?|Pascals?|Coulombs?|Kelvin|kilograms?|meters?|seconds?)\b/gi, style: 'unit' },
      { regex: /\b([A-Z]|[αβθΔπ])\b(?![a-z])/g, style: 'var' },
    ];

    let nodes: React.ReactNode[] = [text];

    patterns.forEach((p, patternIndex) => {
      const nextNodes: React.ReactNode[] = [];

      nodes.forEach((node, nodeIndex) => {
        if (typeof node !== 'string') {
          nextNodes.push(node);
          return;
        }

        let lastIndex = 0;
        node.replace(p.regex, (match, ...args) => {
          const offset = args[args.length - 2];
          const before = node.slice(lastIndex, offset);
          if (before) nextNodes.push(before);

          const key = `${patternIndex}-${nodeIndex}-${offset}-${match}`;
          let cls = '';
          if (p.style === 'number')
            cls = 'font-mono text-green-700 bg-green-50 px-1 rounded border border-green-200';
          else if (p.style === 'term')
            cls = 'font-semibold text-purple-700 bg-purple-50 px-1 rounded';
          else if (p.style === 'unit')
            cls = 'font-medium text-teal-700 bg-teal-50 px-1 rounded';
          else if (p.style === 'var')
            cls = 'font-mono text-blue-700 bg-blue-50 px-1 rounded';

          nextNodes.push(
            <span key={key} className={cls}>
              {match}
            </span>
          );

          lastIndex = offset + match.length;
          return match;
        });

        const tail = node.slice(lastIndex);
        if (tail) nextNodes.push(tail);
      });

      nodes = nextNodes;
    });

    return <>{nodes}</>;
  };

  // Clean malformed LaTeX blocks created by transcription
  const cleanBrokenLatex = (text: string): string => {
    return text
      // 🔹 Remove unnecessary newlines and spacing inside math blocks
      .replace(/\\\([\s\S]*?\\\)/g, m =>
        m
          .replace(/\s*\n\s*/g, '')
          .replace(/\s{2,}/g, ' ')
          .replace(/−/g, '-')
      )
      .replace(/\\\[[\s\S]*?\\\]/g, m =>
        m
          .replace(/\s*\n\s*/g, '')
          .replace(/\s{2,}/g, ' ')
          .replace(/−/g, '-')
      )

      // 🔹 Convert Δ expressions (e.g., \Delta T → ΔT)
      .replace(/\\Delta\s*([A-Za-z0-9])/g, 'Δ$1')

      // 🔹 Handle derivatives (dy/dx, d²y/dx², ∂y/∂x)
      .replace(/\\frac\{d\^?(\d*)\s*([a-zA-Z])\}\{d\^?(\d*)\s*([a-zA-Z])\}/g, (_, n1, y, n2, x) => {
        const sup1 = n1 ? `^${n1}` : '';
        const sup2 = n2 ? `^${n2}` : '';
        return `d${sup1}${y}/d${x}${sup2}`;
      })
      .replace(/\\frac\{∂\^?(\d*)\s*([a-zA-Z])\}\{∂\^?(\d*)\s*([a-zA-Z])\}/g, (_, n1, y, n2, x) => {
        const sup1 = n1 ? `^${n1}` : '';
        const sup2 = n2 ? `^${n2}` : '';
        return `∂${sup1}${y}/∂${x}${sup2}`;
      })

      // 🔹 Fractions like \frac{N}{m}² → N/m²
      .replace(/\\frac\{([A-Za-z0-9]+)\}\{([A-Za-z0-9]+)\}\s*\^?([⁰¹²³⁴⁵⁶⁷⁸⁹-]*)/g, (_, num, den, pow) => {
        return `${num}/${den}${pow || ''}`;
      })

      // 🔹 Simple fractions: \frac{L}{T^2} → L/T²
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, num, den) => `${num}/${den}`)

      // 🔹 Clean exponent notations like T^-2 → T⁻²
      .replace(/([A-Za-z])\^(-?\d+)/g, (_, base, exp) => {
        const superscripts: Record<string, string> = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³',
          '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷',
          '8': '⁸', '9': '⁹', '-': '⁻'
        };
        return base + exp.split('').map((c: any) => superscripts[c] || c).join('');
      })

      // 🔹 Convert inline math delimiters \( ... \) to readable text
      // e.g., \( ML^2T^{-2} \) → ML²T⁻²
      .replace(/\\\((.*?)\\\)/g, (_, inner) => {
        const cleaned = inner
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
          .replace(/([A-Za-z])\^(-?\d+)/g, (_: any, base: any, exp: string) => {
            const superscripts: Record<string, string> = {
              '0': '⁰', '1': '¹', '2': '²', '3': '³',
              '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷',
              '8': '⁸', '9': '⁹', '-': '⁻'
            };
            return base + exp.split('').map((c: string) => superscripts[c] || c).join('');
          })
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\Delta\s*([A-Za-z])/g, 'Δ$1')
          .trim();
        return cleaned;
      })

      // 🔹 Remove leftover \text{} artifacts
      .replace(/\\text\{([^}]+)\}/g, '$1')

      // 🔹 Clean redundant symbols/spaces
      .replace(/\\\\/g, '\\')
      .replace(/\{(\s*)\}/g, '$1')
      .replace(/\s{2,}/g, ' ');
  };




  /** Render */
  const renderContent = (text: string) => {
    let processed = processScientificContent(text);
    processed = cleanBrokenLatex(processed); // 👈 run after wrapping
    const paragraphs = processed.split('\n').filter((p) => p.trim());

    return paragraphs.map((para, i) => {
      const parts = para.split(/(\\\[.*?\\\])/s);

      return (
        <div key={`p-${i}`} className="mb-5">
          {parts.map((part, j) => {
            if (part.startsWith('\\[') && part.endsWith('\\]')) {
              const math = part.slice(2, -2).trim();
              if (!math) return null;
              try {
                const large = math.length > 15 || math.includes('\\frac') || math.includes('=');
                return (
                  <div
                    key={`m-${i}-${j}-${math.length}`}
                    className={`my-4 ${
                      large
                        ? 'flex justify-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm'
                        : 'inline-block mx-1 bg-white px-2 py-0.5 rounded border border-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(math, {
                        throwOnError: false,
                        displayMode: large,
                      }),
                    }}
                  />
                );
              } catch {
                return (
                  <span
                    key={`e-${i}-${j}`}
                    className="inline-block px-2 py-1 mx-1 bg-red-50 text-red-700 rounded border border-red-200 text-sm font-mono"
                  >
                    {math}
                  </span>
                );
              }
            } else {
              return (
                <span key={`t-${i}-${j}`} className="text-gray-800 leading-relaxed text-base">
                  {highlightScientificTerms(part)}
                </span>
              );
            }
          })}
        </div>
      );
    });
  };

  return <div className={`${className} text-sm leading-relaxed`}>{renderContent(content)}</div>;
};
