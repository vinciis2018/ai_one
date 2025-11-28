import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDocuments } from "../../store/slices/documentsSlice";
import { UploadBox } from "../../components/atoms/UploadBox";

export const NotesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { documents, status, error } = useAppSelector((state) => state.documents);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [showUploadBox, setShowUploadBox] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchDocuments({
        user_ids: [user?._id || ''],
      }));
    }
  }, [dispatch, user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
  };

  // Filter documents based on search query and domain
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === "all" || doc.subject?.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  return (
    <FullLayout>
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <i className="fi fi-sr-arrow-small-left text-gray-700 group-hover:text-violet transition-colors" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-green2 bg-clip-text text-transparent">
                    My Notes
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} available
                  </p>
                </div>
              </div>

              <button
                title="Upload notes"
                type="button"
                onClick={() => setShowUploadBox(!showUploadBox)}
                className="group flex items-center gap-3 px-6 py-2 rounded-full font-medium transition-all duration-300 bg-green2 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <i className="fi fi-br-upload flex items-center justify-center group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 backdrop-blur-sm bg-opacity-80">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search your notes..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                  />
                </div>
                <div className="relative sm:w-48">
                  <i className="fi fi-rr-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    title="Filter by subject"
                    value={selectedDomain}
                    onChange={handleDomainChange}
                    className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Subjects</option>
                    <option value="physics">Physics</option>
                    <option value="maths">Maths</option>
                    <option value="chemistry">Chemistry</option>
                  </select>
                  <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-violet border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading your notes...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <i className="fi fi-rr-cross-circle text-red-500 text-2xl" />
              <div>
                <p className="text-red-800 font-semibold">Failed to load notes</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            </div>
          )}

          {/* Documents Grid */}
          {status !== "loading" && !error && (
            <>
              {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDocuments.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-violet-200 transform hover:-translate-y-1"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 group-hover:from-violet-200 group-hover:to-blue-200 transition-all duration-300">
                              <i className="fi fi-rr-document flex items-center justify-center text-violet text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 truncate group-hover:text-violet transition-colors">
                                {doc.filename}
                              </h3>
                              {doc.subject && (
                                <span className="inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full bg-violet-50 text-violet">
                                  {doc.subject}
                                </span>
                              )}
                            </div>
                          </div>

                          {doc.created_at && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <i className="fi fi-rr-calendar text-xs flex items-center" />
                              <span>
                                {new Date(doc.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          className="px-5 py-2.5 bg-gradient-to-r from-violet to-violet-600 text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/documents/${doc.id}`);
                          }}
                        >
                          <span>View</span>
                          <i className="fi fi-rr-arrow-small-right text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center mb-6">
                    <i className="fi fi-rr-document text-violet text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {searchQuery || selectedDomain !== "all" ? "No notes found" : "No notes yet"}
                  </h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    {searchQuery || selectedDomain !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start by uploading your first study material"}
                  </p>
                  {!searchQuery && selectedDomain === "all" && (
                    <button
                      onClick={() => setShowUploadBox(true)}
                      className="px-8 py-3 bg-gradient-to-r from-violet to-violet-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                    >
                      <i className="fi fi-br-upload" />
                      <span>Upload Your First Note</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Upload Modal */}
          {showUploadBox && (

            <div className="flex-1 overflow-y-auto p-8">
              <UploadBox
                isOpen={showUploadBox}
                onClose={() => setShowUploadBox(false)}
                onUploadSuccess={() => {
                  if (user) {
                    dispatch(fetchDocuments({
                      user_ids: [user?._id || ''],
                    }));
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </FullLayout>
  );
};
