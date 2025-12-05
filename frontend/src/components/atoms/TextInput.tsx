import React, { useEffect, useRef, useState } from 'react';

// --- CONVERSION HELPERS ---

const LATEX_MAP: Record<string, string> = {
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\Gamma': 'Γ', '\\delta': 'δ', '\\Delta': 'Δ',
  '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\Theta': 'Θ', '\\iota': 'ι',
  '\\kappa': 'κ', '\\lambda': 'λ', '\\Lambda': 'Λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ',
  '\\pi': 'π', '\\Pi': 'Π', '\\rho': 'ρ', '\\sigma': 'σ', '\\Sigma': 'Σ', '\\tau': 'τ',
  '\\upsilon': 'υ', '\\phi': 'φ', '\\Phi': 'Φ', '\\chi': 'χ', '\\psi': 'ψ', '\\Psi': 'Ψ',
  '\\omega': 'ω', '\\Omega': 'Ω',
  '\\times': '×', '\\div': '÷', '\\cdot': '·', '\\pm': '±', '\\mp': '∓', '\\approx': '≈',
  '\\equiv': '≡', '\\neq': '≠', '\\leq': '≤', '\\geq': '≥', '\\infty': '∞',
  '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\cup': '∪', '\\cap': '∩', '\\emptyset': '∅',
  '\\forall': '∀', '\\exists': '∃', '\\Rightarrow': '⇒', '\\Leftrightarrow': '⇔',
  '\\int': '∫', '\\oint': '∮', '\\sum': '∑', '\\prod': '∏', '\\partial': '∂', '\\nabla': '∇',
  '\\angle': '∠', '\\perp': '⊥', '\\parallel': '∥', '\\triangle': '△',
  '\\rightarrow': '→', '\\rightleftharpoons': '⇌', '\\uparrow': '↑', '\\downarrow': '↓',
  '\\hbar': 'ℏ', '\\AA': 'Å'
};

const REVERSE_LATEX_MAP = Object.entries(LATEX_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {} as Record<string, string>);

const toSimplified = (latex: string): { text: string, wasWrapped: boolean } => {
  if (!latex) return { text: '', wasWrapped: false };
  let text = latex;

  // 1. Check and strip outer delimiters
  const wasWrapped = /^\s*\$.*\$\s*$/.test(text);
  if (wasWrapped) {
    text = text.replace(/^\s*\$|\$\s*$/g, '');
  }

  // 2. Replace Commands (Basic nesting support via regex loop could be added, but keeping simple for now)
  // \frac{a}{b} -> (a)/(b)
  text = text.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  // \sqrt{a} -> sqrt(a)
  text = text.replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)');
  // ^{a} -> ^(a)
  text = text.replace(/\^\{([^{}]*)\}/g, '^($1)');
  // _{a} -> _(a)
  text = text.replace(/_\{([^{}]*)\}/g, '_($1)');
  // \text{a} -> text(a)
  text = text.replace(/\\text\{([^{}]*)\}/g, 'text($1)');
  // \sin, \cos etc
  text = text.replace(/\\(sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|arcsin|arccos|arctan)/g, '$1');

  // 3. Replace Symbols
  // Sort keys by length desc to avoid partial matches
  const sortedKeys = Object.keys(LATEX_MAP).sort((a, b) => b.length - a.length);
  sortedKeys.forEach(key => {
    text = text.split(key).join(LATEX_MAP[key]);
  });

  return { text, wasWrapped };
};

const toLatex = (simplified: string, wasWrapped: boolean): string => {
  if (!simplified) return '';
  let text = simplified;

  // 1. Replace Symbols back
  const sortedKeys = Object.keys(REVERSE_LATEX_MAP).sort((a, b) => b.length - a.length);
  sortedKeys.forEach(key => {
    text = text.split(key).join(REVERSE_LATEX_MAP[key] + ' '); // Add space to prevent merging
  });
  // Clean up double spaces - REMOVED to preserve user typing
  // text = text.replace(/\s+/g, ' ');

  // 2. Replace Structures back
  // (a)/(b) -> \frac{a}{b}
  text = text.replace(/\(([^()]*)\)\/\(([^()]*)\)/g, '\\frac{$1}{$2}');
  // sqrt(a) -> \sqrt{a}
  text = text.replace(/sqrt\(([^()]*)\)/g, '\\sqrt{$1}');
  // ^(a) -> ^{a}
  text = text.replace(/\^\(([^()]*)\)/g, '^{$1}');
  // _(a) -> _{a}
  text = text.replace(/_\(([^()]*)\)/g, '_{$1}');
  // text(a) -> \text{a}
  text = text.replace(/text\(([^()]*)\)/g, '\\text{$1}');
  // Trig functions
  text = text.replace(/(sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|arcsin|arccos|arctan)/g, '\\$1');

  // 3. Re-wrap
  if (wasWrapped) {
    text = `$ ${text} $`;
  }

  return text;
};


type SymbolItem = {
  label: string;
  value: string;
  offset?: number;
  icon?: string;
};

const SYMBOLS: Record<'math' | 'symbols' | 'chem' | 'phys' | 'bio', SymbolItem[]> = {
  math: [
    // Operations & Relations
    { label: 'x/y', value: '( )/( )', offset: -6, icon: '' },
    { label: 'x²', value: '^(2)', offset: 0, icon: 'fi fi-rr-superscript' },
    { label: 'x₂', value: '_(2)', offset: 0, icon: 'fi fi-rr-subscript' },
    { label: '√', value: 'sqrt( )', offset: -1, icon: 'fi fi-rr-square-root' },
    { label: '±', value: '±', offset: 0 },
    { label: '∓', value: '∓', offset: 0 },
    { label: '×', value: '×', offset: 0 },
    { label: '÷', value: '÷', offset: 0 },
    { label: '·', value: '·', offset: 0 },
    { label: '≠', value: '≠', offset: 0 },
    { label: '≈', value: '≈', offset: 0 },
    { label: '≡', value: '≡', offset: 0 },
    { label: '∝', value: '∝', offset: 0 },
    { label: '≤', value: '≤', offset: 0 },
    { label: '≥', value: '≥', offset: 0 },

    // Sets & Logic
    { label: '∞', value: '∞', offset: 0 },
    { label: '∈', value: '∈', offset: 0 },
    { label: '∉', value: '∉', offset: 0 },
    { label: '⊂', value: '⊂', offset: 0 },
    { label: '∪', value: '∪', offset: 0 },
    { label: '∩', value: '∩', offset: 0 },
    { label: '∅', value: '∅', offset: 0 },
    { label: '∀', value: '∀', offset: 0 },
    { label: '∃', value: '∃', offset: 0 },
    { label: '⇒', value: '⇒', offset: 0 },
    { label: '⇔', value: '⇔', offset: 0 },

    // Calculus & Geometry
    { label: '∫', value: '∫', offset: 0 },
    { label: '∮', value: '∮', offset: 0 },
    { label: '∑', value: '∑', offset: 0 },
    { label: '∏', value: '∏', offset: 0 },
    { label: '∂', value: '∂', offset: 0 },
    { label: '∇', value: '∇', offset: 0 },
    { label: 'lim', value: 'lim_( ) ', offset: -2 },
    { label: '∠', value: '∠', offset: 0 },
    { label: '⊥', value: '⊥', offset: 0 },
    { label: '∥', value: '∥', offset: 0 },
    { label: '△', value: '△', offset: 0 },

    // Trigonometry
    { label: 'sin', value: 'sin( )', offset: -1 },
    { label: 'cos', value: 'cos( )', offset: -1 },
    { label: 'tan', value: 'tan( )', offset: -1 },
    { label: 'csc', value: 'csc( )', offset: -1 },
    { label: 'sec', value: 'sec( )', offset: -1 },
    { label: 'cot', value: 'cot( )', offset: -1 },
    { label: 'sin⁻¹', value: 'arcsin( )', offset: -1 },
    { label: 'cos⁻¹', value: 'arccos( )', offset: -1 },
    { label: 'tan⁻¹', value: 'arctan( )', offset: -1 },
    { label: 'sinh', value: 'sinh( )', offset: -1 },
    { label: 'cosh', value: 'cosh( )', offset: -1 },
    { label: 'tanh', value: 'tanh( )', offset: -1 },
  ],
  'symbols': [
    { label: 'α', value: 'α' },
    { label: 'β', value: 'β' },
    { label: 'γ', value: 'γ' },
    { label: 'Γ', value: 'Γ' },
    { label: 'δ', value: 'δ' },
    { label: 'Δ', value: 'Δ' },
    { label: 'ε', value: 'ε' },
    { label: 'ζ', value: 'ζ' },
    { label: 'η', value: 'η' },
    { label: 'θ', value: 'θ' },
    { label: 'Θ', value: 'Θ' },
    { label: 'ι', value: 'ι' },
    { label: 'κ', value: 'κ' },
    { label: 'λ', value: 'λ' },
    { label: 'Λ', value: 'Λ' },
    { label: 'μ', value: 'μ' },
    { label: 'ν', value: 'ν' },
    { label: 'ξ', value: 'ξ' },
    { label: 'π', value: 'π' },
    { label: 'Π', value: 'Π' },
    { label: 'ρ', value: 'ρ' },
    { label: 'σ', value: 'σ' },
    { label: 'Σ', value: 'Σ' },
    { label: 'τ', value: 'τ' },
    { label: 'υ', value: 'υ' },
    { label: 'φ', value: 'φ' },
    { label: 'Φ', value: 'Φ' },
    { label: 'χ', value: 'χ' },
    { label: 'ψ', value: 'ψ' },
    { label: 'Ψ', value: 'Ψ' },
    { label: 'ω', value: 'ω' },
    { label: 'Ω', value: 'Ω' },
  ],
  chem: [
    { label: '→', value: '→' },
    { label: '⇌', value: '⇌' },
    { label: '↑', value: '↑' },
    { label: '↓', value: '↓' },
    { label: 'Gas', value: '(g)' },
    { label: 'Liq', value: '(l)' },
    { label: 'Aq', value: '(aq)' },
    { label: 'Sol', value: '(s)' },
    { label: '°C', value: '°C' },
    { label: 'Å', value: 'Å' },
    { label: 'e⁻', value: 'e⁻' },
    { label: 'H⁺', value: 'H⁺' },
    { label: 'Δ', value: 'Δ' },
    { label: 'hv', value: 'hv' },
    { label: 'mol', value: 'mol' },
    { label: 'M', value: 'M' },
  ],
  phys: [
    { label: 'ℏ', value: 'ℏ' },
    { label: 'λ', value: 'λ' },
    { label: 'ν', value: 'ν' },
    { label: 'ω', value: 'ω' },
    { label: 'ρ', value: 'ρ' },
    { label: 'σ', value: 'σ' },
    { label: 'τ', value: 'τ' },
    { label: 'μ', value: 'μ' },
    { label: 'Ω', value: 'Ω' },
    { label: 'ε₀', value: 'ε₀' },
    { label: 'μ₀', value: 'μ₀' },
    { label: 'vec', value: 'vec( )', offset: -1 },
    { label: 'hat', value: 'hat( )', offset: -1 },
    { label: 'bar', value: 'bar( )', offset: -1 },
    { label: 'dot', value: 'dot( )', offset: -1 },
    { label: 'J', value: 'J' },
    { label: 'N', value: 'N' },
    { label: 'W', value: 'W' },
    { label: 'V', value: 'V' },
  ],
  bio: [
    { label: '♂', value: '♂' },
    { label: '♀', value: '♀' },
    { label: '×', value: '×' },
    { label: '→', value: '→' },
    { label: '∴', value: '∴' },
    { label: '∵', value: '∵' },
    { label: 'DNA', value: 'DNA' },
    { label: 'RNA', value: 'RNA' },
    { label: 'pH', value: 'pH' },
    { label: '°C', value: '°C' },
    { label: 'μm', value: 'μm' },
  ]
};

interface TextInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minHeight?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  className = '',
  style = {},
  minHeight = '1.5em',
  onFocus,
  onBlur,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'math' | 'symbols' | 'chem' | 'phys' | 'bio'>('math');
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Local state for simplified display
  const [localValue, setLocalValue] = useState('');
  const [wasWrapped, setWasWrapped] = useState(false);

  // Sync local state when prop value changes
  useEffect(() => {
    // If focused, we trust local state to prevent cursor jumps
    if (isFocused) return;

    const { text, wasWrapped: wrapped } = toSimplified(value);
    // Only update if the new value is actually different
    if (text !== localValue) {
      setLocalValue(text);
      setWasWrapped(wrapped);
    }
  }, [value, isFocused]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Convert back to LaTeX for parent
    const latexValue = toLatex(newValue, wasWrapped);

    // Create synthetic event
    const event = {
      ...e,
      target: { ...e.target, value: latexValue },
      currentTarget: { ...e.currentTarget, value: latexValue }
    };
    onChange(event);
  };

  const insertAtCursor = (textToInsert: string, cursorOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = localValue;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = before + textToInsert + after;
    setLocalValue(newValue);

    // Convert and notify parent
    const latexValue = toLatex(newValue, wasWrapped);
    const event = {
      target: { value: latexValue },
      currentTarget: { value: latexValue }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div
      className="relative group/input w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toolbar Toggle (visible on hover, focus, or when toolbar is open) */}
      <div
        className={`absolute -top-8 right-0 z-50 transition-opacity duration-200 ${showToolbar || isHovered || isFocused ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
      >
        <button
          onClick={() => setShowToolbar(!showToolbar)}
          className={`p-1.5 rounded-t-lg text-xs font-medium flex items-center gap-1 ${showToolbar ? 'bg-slate-100 text-blue-600' : 'bg-white text-slate-500 hover:bg-slate-50 shadow-sm border border-slate-200 border-b-0'}`}
          title="Toggle Special Characters Toolbar"
          type="button"
        >
          <i className="fi fi-rr-tools flex items-center justify-center"></i>
          <span className="hidden sm:inline">Toolbar</span>
        </button>
      </div>

      {/* Toolbar */}
      {showToolbar && (
        <div
          className="mb-1 p-2 bg-slate-50 border border-slate-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 relative z-50"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        >
          {/* Categories */}
          <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
            {(['math', 'symbols', 'chem', 'phys', 'bio'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 text-xs uppercase font-bold rounded-full transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Symbols Grid */}
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-32 overflow-y-auto">
            {SYMBOLS[activeCategory].map((sym) => (
              <button
                key={sym.label}
                onClick={(e) => {
                  e.preventDefault(); // Prevent focus loss
                  insertAtCursor(sym.value, sym.offset);
                }}
                className="h-6 w-full flex items-center justify-center rounded hover:bg-white hover:shadow-sm hover:text-blue-600 text-slate-600 transition-all text-xs border border-transparent hover:border-slate-200"
                title={sym.value}
                type="button"
              >
                {sym.icon ? <i className={sym.icon}></i> : sym.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className={`w-full resize-none overflow-hidden ${className}`}
        style={{
          minHeight,
          height: 'auto',
          fieldSizing: 'content',
          ...style
        } as any}
        onInput={adjustHeight}
        {...props}
      />
    </div>
  );
};
