import React from 'react';
import type { DocumentItem } from '../../store/slices/documentsSlice';

interface DocumentCardProps {
  doc: DocumentItem;
  onClick: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border border-slate-100 shadow-sm rounded-xl p-4 hover:shadow-lg hover:border-logoViolet transition-shadow cursor-pointer bg-white group transform transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-logoViolet flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110transition-all">
          <i className="fi fi-rr-document-signed flex items-center justify-center"></i>
        </div>
        <div className="overflow-hidden">
          <h3 className="font-medium text-gray-900 group-hover:text-logoViolet truncate text-sm" title={doc.filename}>
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
