import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchDocuments } from "../../store/slices/documentsSlice";
import { DocumentDetailsModal } from "../../components/popups/DocumentDetailsModal";
import { FullLayout } from "../../layouts/AppLayout";

export const DocumentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector((state) => state.auth);
  const { documents, status } = useAppSelector((state) => state.documents);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchDocuments({ user_ids: [user?._id || ''] }));
    }
  }, [dispatch, user]);

  return (
    <FullLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">📄 Uploaded Documents</h1>

        {status === "loading" && <p>Loading documents...</p>}
        {status === "failed" && <p className="text-red-500">Failed to load documents.</p>}

        <div className="grid grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-lg p-4 hover:shadow cursor-pointer"
              onClick={() => setSelectedId(doc.id)}
            >
              <p className="font-semibold">{doc.filename}</p>
              <p className="text-sm text-gray-600">{doc.source_type}</p>
              <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <DocumentDetailsModal documentId={selectedId} onClose={() => setSelectedId(null)} />
      </div>
    </FullLayout>

  );
};
