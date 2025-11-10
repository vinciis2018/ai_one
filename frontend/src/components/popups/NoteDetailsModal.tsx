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

    const fileUrl = selectedDocument.s3_url;
    const fileName = selectedDocument.filename || "";
    const fileExt = fileName.split(".").pop()?.toLowerCase();

    if (fileExt === "pdf") {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          className="w-full h-screen rounded-md border border-[var(--border)] no-scrollbar"
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
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl my-auto mx-4 max-h-screen flex flex-col border border-[var(--border)]">
        {/* Header */}
        <div className="relative flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">
            {selectedDocument?.filename || "Document Viewer"}
          </h3>
          <i className="absolute top-4 right-4 fi fi-br-x cursor-pointer" onClick={onClose} />
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
              <div className="flex items-center justify-between text-sm text-[var(--text-muted)] capitalize">
                <p>
                  <strong>📁 Source:</strong> {selectedDocument.subject}
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
      </div>
    </div>
  );
};
