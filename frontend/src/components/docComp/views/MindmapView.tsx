import React, { useEffect } from 'react';
import { MindMap, type MindMapNode } from '../../../pages/Documents/components/MindMap';

interface MindmapViewProps {
  pageNumber: number;
  doc: any;
  onBack: () => void;
}

export const MindmapView: React.FC<MindmapViewProps> = ({ pageNumber, doc, onBack }) => {
  
    const [hasMindMaps, setHasMindMaps] = React.useState(false);
    const [currentPageMindMaps, setCurrentPageMindMaps] = React.useState<MindMapNode | null>(null);
  
    useEffect(() => {
      const currentPageMindMap = doc.notes_description.find((n: any) => n.page === pageNumber)?.mind_map;
  
      // Clean up key formatting issues
      let cleanedMindMap = currentPageMindMap;
      let parsedData: MindMapNode | null = null;
  
      if (typeof currentPageMindMap === 'string') {
        // Remove markdown code blocks if present
        cleanedMindMap = currentPageMindMap.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
  
        // Try parsing JSON
        try {
          parsedData = JSON.parse(cleanedMindMap);
        } catch (e) {
          // Not valid JSON
          console.error("Failed to parse mindmap JSON", e);
        }
      } else if (typeof currentPageMindMap === 'object' && currentPageMindMap !== null) {
        // Direct object support
        parsedData = currentPageMindMap;
      }
  
      // Validate structure (must have name)
      if (parsedData && !parsedData.name && (parsedData as any).root) {
        // Handle case where root is wrapped in "root" key
        parsedData = (parsedData as any).root;
      }
  
      if (parsedData && parsedData.name) {
        setCurrentPageMindMaps(parsedData);
        setHasMindMaps(true);
      } else {
        setHasMindMaps(false);
        setCurrentPageMindMaps(null);
      }
  
    }, [doc, pageNumber]);
  
  
  return (
    <div className="h-full w-full bg-white overflow-hidden p-6 relative">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logoPink to-logoPurple rounded-xl flex items-center justify-center shadow-lg">
              <i className="fi fi-sr-network flex items-center justify-center text-white"></i>
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-bold text-slate-900">Mindmap</h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium">Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-2"
          >
            <i className="fi fi-rr-arrow-left flex items-center justify-center text-xs"></i>
            <span className="hidden lg:block">Back to PDF</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-3xl p-2 shadow-inner overflow-hidden">
          {hasMindMaps ? (
            <MindMap data={currentPageMindMaps as MindMapNode} />
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fi fi-rr-network text-3xl text-slate-300"></i>
              </div>
              <p className="text-slate-500 font-medium">No mindmap available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
