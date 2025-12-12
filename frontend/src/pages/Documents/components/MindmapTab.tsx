import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { generateMindmap } from "../../../store/slices/notesSlice";
import { MindMap, type MindMapNode } from "./MindMap";

interface MindmapTabProps {
  pageNumber: number;
  notesDescription: any[];
  documentId?: string;
}

export const MindmapTab: React.FC<MindmapTabProps> = ({
  pageNumber,
  notesDescription,
  documentId,
}) => {
  const dispatch = useAppDispatch();
  const { selectedDocument } = useAppSelector((state) => state.documents);
  const { generateMindmapStatus } = useAppSelector((state) => state.notes);

  // Use provided documentId or fallback to selectedDocument from store
  const currentDocId = documentId || selectedDocument?.id;

  const [hasMindMaps, setHasMindMaps] = React.useState(false);
  const [currentPageMindMaps, setCurrentPageMindMaps] = React.useState<MindMapNode | null>(null);

  useEffect(() => {
    const currentPageMindMap = notesDescription.find(n => n.page === pageNumber)?.mind_map;

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

  }, [notesDescription, pageNumber]);


  const handleGenerateMindmap = async () => {
    if (!currentDocId) return;

    try {
      await dispatch(generateMindmap({
        page_number: pageNumber,
        document_id: currentDocId,
      })).unwrap();
    } catch (error) {
      console.error("Failed to generate mindmap:", error);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">Mindmap</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateMindmap}
            disabled={generateMindmapStatus === 'loading'}
            className="px-3 py-2 flex items-center gap-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            {generateMindmapStatus === 'loading' ? (
              <>
                <i className="fi fi-br-circle flex items-center justify-center animate-spin text-xs"></i>
              </>
            ) : (
              <>
                <i className="fi fi-rr-refresh flex items-center justify-center"></i>
              </>
            )}
          </button>
        </div>
      </div>

      {hasMindMaps && currentPageMindMaps ? (
        <div className="flex-1 overflow-hidden">
          <MindMap data={currentPageMindMaps} />
        </div>
      ) : (
        <div className="p-4">
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-dashed border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fi fi-rr-network flex items-center justify-center text-blue-300 text-xl"></i>
            </div>
            <p className="text-sm font-medium mb-1">No mindmap generated yet</p>
            <p className="text-xs text-gray-400 mb-4">Visualize your notes with a mindmap</p>
            <button
              onClick={handleGenerateMindmap}
              disabled={generateMindmapStatus === 'loading'}
              className="px-4 py-2 bg-gradient-to-br from-blue-300 to-sky-300 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              {generateMindmapStatus === 'loading' ? (
                <>
                  <i className="fi fi-br-circle flex items-center justify-center animate-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fi fi-sr-network flex items-center justify-center"></i>
                  Generate Mindmap
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
