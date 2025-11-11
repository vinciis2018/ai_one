import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../store";
import type { ChatResponse } from "../../store/slices/conversationsSlice";
import type { StudentModel } from "../../store/slices/studentsSlice";
import { cleanFilename } from "../../utilities/filesUtils";
import type { DocumentItem } from "../../store/slices/documentsSlice";


interface Props {
  conversation: ChatResponse | null;
  student_details: StudentModel | null;
  onClose: () => void;
}

export const StudentAnalyticsModal: React.FC<Props> = ({
  conversation,
  student_details,
  onClose
}) => {
  // const dispatch = useAppDispatch();

  const [myDocs, setMyDocs] = useState<DocumentItem[]>([]);
 console.log(student_details)
  const { user } = useAppSelector((state) => state.auth);
  const {documents} = useAppSelector((state) => state.documents);
  
  useEffect(() => {
    if (documents) {
      // const user_docs = documents.filter((doc: DocumentItem) => doc.user_id === user?._id);
      setMyDocs(documents);
    }
  }, [documents, user]);


  const getSourceUsedAnalytics = (conversation: ChatResponse) => {
    // Initialize an object to store the count of each source
    const sourceCounts: Record<string, number> = {};

    // Flatten all sources_used arrays and count occurrences
    conversation.conversations?.forEach(conv => {
      if (conv.sources_used?.length) {
        conv.sources_used.forEach(sourceId => {
          if (sourceId) { // Only process non-null/undefined source IDs
            sourceCounts[sourceId] = (sourceCounts[sourceId] || 0) + 1;
          }
        });
      }
    });
    return sourceCounts;
  };

  if (!conversation) return null;
    
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-20">
      {/* Main Modal */}
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl my-auto mx-4 max-h-[80vh] flex flex-col border border-[var(--border)]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)] relative">
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Frequently Used Study Materials
          </h3>
          <i className="fi fi-br-x flex items-center" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            {Object.entries(getSourceUsedAnalytics(conversation)).map(([docId, count]) => {
              const doc = myDocs.find(d => d.id === docId);
              if (!doc) return null;
              
              // Calculate percentage (assuming totalSources is the sum of all counts)
              const totalSources = Object.values(getSourceUsedAnalytics(conversation))
                .reduce((sum, current) => sum + current, 0);
              const percentage = Math.round((count / totalSources) * 100);

              return (
                <div key={docId} className={`grid grid-cols-12 gap-2`}>
                  <div className="col-span-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${doc?.user_id !== user?._id ? "text-redLight" : "text-gray-900 "} dark:text-white truncate`}>
                        {cleanFilename(doc.filename) || 'Unnamed Document'}
                      </p>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{doc?.user_id !== user?._id && "(Student Notes)"}</span>

                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Referenced {count} time{count !== 1 ? 's' : ''} • {percentage}% of time
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <a
                      href={doc.s3_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
