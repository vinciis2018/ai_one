import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearSelectedDocument, fetchDocumentById } from "../../store/slices/documentsSlice";


interface Props {
  documentId: string | null;
  onClose: () => void;
}

export const NoteDetailsModal: React.FC<Props> = ({ documentId, onClose }) => {
  const dispatch = useAppDispatch();
  const { selectedDocument, selectedStatus } = useAppSelector(
    (state) => state.documents
  );

  useEffect(() => {
    if (documentId) dispatch(fetchDocumentById(documentId));
    return () => {
      dispatch(clearSelectedDocument());
    };
  }, [documentId, dispatch]);

  if (!documentId) return null;

  const renderContent = () => {
    if (!selectedDocument) return null;

    const fileUrl = selectedDocument.fileUrl;
    const fileName = selectedDocument.filename || "";
    const fileExt = fileName.split(".").pop()?.toLowerCase();

    if (fileExt === "pdf") {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          className="w-full h-[60vh] rounded-md border border-[var(--border)]"
        />
      );
    }

    if (["jpg", "jpeg", "png", "gif"].includes(fileExt || "")) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="w-full h-auto rounded-md border border-[var(--border)]"
        />
      );
    }

    if (["txt", "md"].includes(fileExt || "")) {
      return (
        <pre className="whitespace-pre-wrap text-sm text-[var(--text)] p-3 border border-[var(--border)] rounded-md bg-[var(--background-alt)] max-h-[60vh] overflow-y-auto">
          {selectedDocument.content || "No text content available."}
        </pre>
      );
    }

    return (
      <div className="text-center p-4 border border-[var(--border)] rounded-md bg-[var(--background-alt)]">
        <p className="text-sm text-[var(--text-muted)] mb-2">
          File type not supported for preview.
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] font-medium hover:underline"
        >
          Download {fileName}
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl my-auto mx-4 max-h-[80vh] flex flex-col border border-[var(--border)]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">
            {selectedDocument?.filename || "Document Viewer"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[var(--background)] text-[var(--text)]">
          {selectedStatus === "loading" && (
            <div className="flex justify-center py-10">
              <i className="fi fi-br-circle animate-spin w-8 h-8 text-gray-500" />
            </div>
          )}

          {selectedStatus === "failed" && (
            <div className="text-center py-10 text-red-500">
              Failed to load document details.
            </div>
          )}

          {selectedStatus === "succeeded" && selectedDocument && (
            <div className="space-y-4">
              <div className="text-sm text-[var(--text-muted)]">
                <p>
                  <strong>📁 Source:</strong> {selectedDocument.source_type}
                </p>
                <p>
                  <strong>🕓 Uploaded:</strong>{" "}
                  {new Date(selectedDocument.created_at).toLocaleString()}
                </p>
              </div>
              {renderContent()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--border)] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
