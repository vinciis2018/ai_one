import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDocuments } from "../../store/slices/documentsSlice";
import { UploadBox } from "../../components/atoms/UploadBox";
import { LoadingComponent } from "../../components/molecules/LoadingComponent";

export const DocumentsPage: React.FC = () => {
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center lg:gap-4 gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <i className="fi fi-rr-arrow-small-left text-slate-700 dark:text-white group-hover:text-logoBlue transition-colors" />
                </button>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">
                    My Notes
                  </h1>
                  <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} available
                  </p>
                </div>
              </div>

              <button
                title="Upload notes"
                type="button"
                onClick={() => setShowUploadBox(!showUploadBox)}
                className="group flex items-center gap-3 px-6 py-2 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-logoBlue to-logoViolet text-white shadow-lg shadow-logoBlue hover:shadow-xl hover:shadow-logoBlue hover:scale-105"
              >
                <i className="fi fi-br-upload flex items-center justify-center group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl pb-2">
              <div className="flex flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search your notes..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="relative flex">
                  <select
                    title="Filter by subject"
                    value={selectedDomain}
                    onChange={handleDomainChange}
                    disabled={user?.role === "teacher"}
                    className="w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-900 dark:text-slate-900 appearance-none cursor-pointer"
                  >
                    <option value="all">All</option>
                    {user?.subjects?.map((subject: string) => (
                      <option key={subject} value={subject}>
                        {subject.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {status === "loading" && filteredDocuments.length === 0 && (
            <LoadingComponent size="sm" message="Loading your notes..." />
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-2xl p-6 flex items-center gap-4">
              <i className="fi fi-rr-cross-circle text-red-500 text-2xl" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-semibold">Failed to load notes</p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">Please try again later</p>
              </div>
            </div>
          )}

          {/* Documents Grid */}

          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="group bg-white dark:bg-black backdrop-blur-xl rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white hover:border-logoBlue dark:hover:border-logoBlue transform hover:-translate-y-1"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-logoSky to-logoBlue text-white shadow-lg shadow-logoBlue group-hover:scale-110 transition-transform duration-300">
                          <i className="fi fi-rr-document flex items-center justify-center text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:font-bold group-hover:text-logoBlue transition-colors">
                            {doc.filename}
                          </h3>
                          {doc.subject && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-lg bg-logoBlue text-logoBlue dark:bg-logoBlue dark:text-logoBlue">
                              {doc.subject}
                            </span>
                          )}
                        </div>
                      </div>

                      {doc.created_at && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-2">
                            <i className="fi fi-rr-calendar text-xs flex items-center" />
                            <span>
                              {new Date(doc.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <button
                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white flex items-center justify-center text-slate-400 relative overflow-hidden transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:text-white group-hover:bg-logoBlue"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/documents/${doc.id}`);
                            }}
                          >
                            <i className="fi fi-rr-arrow-small-right text-xl flex items-center justify-center transform group-hover:translate-x-0.5 transition-transform relative z-10" />
                          </button>
                        </div>
                      )}
                    </div>

                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white border border-slate-100 dark:border-white flex items-center justify-center mb-6">
                <i className="fi fi-rr-document text-slate-300 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {searchQuery || selectedDomain !== "all" ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 font-medium">
                {searchQuery || selectedDomain !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by uploading your first study material"}
              </p>
              {!searchQuery && selectedDomain === "all" && (
                <button
                  onClick={() => setShowUploadBox(true)}
                  className="px-8 py-3 bg-gradient-to-r from-logoBlue to-logoViolet text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-logoBlue hover:scale-105 flex items-center gap-2"
                >
                  <i className="fi fi-br-upload flex items-center justify-center" />
                  <span>Upload Your First Note</span>
                </button>
              )}
            </div>
          )}
      

          {/* Upload Modal */}
          {showUploadBox && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setShowUploadBox(false)}>
              <div className="rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="max-h-[80vh] overflow-y-auto p-0">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </FullLayout>
  );
};
