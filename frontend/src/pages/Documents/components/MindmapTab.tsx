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
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Mindmap</h3>
      </div>

      {hasMindMaps && currentPageMindMaps ? (
        <div className="flex-1 overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm h-[60vh]">
          <MindMap data={currentPageMindMaps} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-6">
          <i className="fi fi-rr-network text-4xl mb-2 opacity-20"></i>
          <p className="text-sm">No mindmap generated yet.</p>
          <button
            onClick={handleGenerateMindmap}
            disabled={generateMindmapStatus === 'loading'}
            className="mt-4 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg text-xs font-medium hover:bg-pink-100 transition-colors disabled:opacity-50"
          >
            {generateMindmapStatus === 'loading' ? (
              <>
                <i className="fi fi-br-circle animate-spin mr-2"></i>
                Generating...
              </>
            ) : (
              'Generate Mindmap'
            )}
          </button>
        </div>
      )}
    </div>
  );
};
