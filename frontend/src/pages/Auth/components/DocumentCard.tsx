import React from 'react';
import type { DocumentItem } from '../../../store/slices/documentsSlice';

interface DocumentCardProps {
  doc: DocumentItem;
  onClick: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer bg-white group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 group-hover:scale-110 transition-transform">
          <i className="fi fi-rr-document-signed"></i>
        </div>
        <div className="overflow-hidden">
          <h3 className="font-medium text-gray-900 truncate text-sm" title={doc.filename}>
            {doc.filename}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <i className="fi fi-rr-clock text-[10px]"></i>
            {new Date(doc.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
