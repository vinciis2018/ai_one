import React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { InlineMath, BlockMath } from 'react-katex';

interface SentenceItemProps {
  sentence: string;
  index: number;
  updateTranscription: (newSentences: string[]) => void;
  sentences: string[];
}

export const SentenceItem = ({ sentence, index, updateTranscription, sentences }: SentenceItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={sentence}
      dragListener={false}
      dragControls={dragControls}
    >
      <div className="flex items-start gap-2 group">
        <div
          className="mt-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <i className="fi fi-rr-menu-burger"></i>
        </div>
        {sentence.startsWith('[DIAGRAM:') ? (
          <div className="w-full">
            {/* Diagram Card View */}
            <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button
                  onClick={() => alert("Image generation feature coming soon!")}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <i className="fi fi-rr-picture"></i>
                  Generate Image
                </button>
              </div>
              {(() => {
                const content = sentence.replace(/\[\/?DIAGRAM.*?\]/g, '');
                const titleMatch = content.match(/Title:\s*(.*)/);
                const descMatch = content.match(/Description:\s*(.*)/);
                const componentsMatch = content.match(/Components:\s*([\s\S]*?)(?=Notes:|$)/);
                const notesMatch = content.match(/Notes:\s*(.*)/);

                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start pr-20">
                      <h4 className="font-bold text-gray-800 text-sm flex items-center">
                        <i className="fi fi-rr-structure text-blue-500 mr-2"></i>
                        {titleMatch ? titleMatch[1] : 'Diagram'}
                      </h4>
                    </div>

                    {descMatch && (
                      <p className="text-xs text-gray-600">{descMatch[1]}</p>
                    )}

                    {componentsMatch && (
                      <div className="bg-gray-50 p-3 rounded border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Components</p>
                        <ul className="list-disc list-inside text-xs text-gray-700 space-y-2">
                          {componentsMatch[1].split('\n').map(line => line.trim()).filter(l => l.startsWith('-')).map((line, i) => {
                            const text = line.replace(/^-\s*/, '');
                            // Heuristic to detect if line contains math/chem symbols
                            const isMath = /[\^_=\\>-]/.test(text) || text.includes('•') || text.includes('≡');
                            return (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                <span className={isMath ? "font-mono text-blue-700" : ""}>
                                  {isMath ? <InlineMath math={text} /> : text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {notesMatch && (
                      <div className="flex gap-2 items-start text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                        <i className="fi fi-rr-info text-yellow-500 mt-0.5"></i>
                        <span>{notesMatch[1]}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : sentence.trim().startsWith('$') ? (
          <div className="w-full">
            {/* Math Equation Card */}
            <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm flex flex-col items-center justify-center min-h-[80px] group/math relative">
              <div className="absolute top-2 right-2 opacity-0 group-hover/math:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    // Toggle edit mode logic would go here
                  }}
                  className="text-gray-400 hover:text-blue-500"
                >
                  <i className="fi fi-rr-edit"></i>
                </button>
              </div>
              <div className="text-lg text-gray-800">
                <BlockMath math={sentence.replace(/^\$/, '').replace(/\$$/, '')} />
              </div>
            </div>
          </div>
        ) : (
          <textarea
            value={sentence}
            onChange={(e) => {
              const newSentences = [...sentences];
              newSentences[index] = e.target.value;
              updateTranscription(newSentences);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const cursorPosition = e.currentTarget.selectionStart;
                const text = e.currentTarget.value;
                const firstPart = text.slice(0, cursorPosition);
                const secondPart = text.slice(cursorPosition);

                const newSentences = [...sentences];
                // Replace current sentence with first part
                newSentences[index] = firstPart;
                // Insert second part after
                newSentences.splice(index + 1, 0, secondPart);

                updateTranscription(newSentences);
              }
            }}
            className="w-full min-h-[40px] p-3 text-sm text-gray-700 bg-white border border-transparent rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono leading-relaxed overflow-hidden"
            placeholder="Edit sentence..."
            rows={1}
          />
        )}
      </div>
    </Reorder.Item>
  );
};
