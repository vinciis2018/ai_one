import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getTeacherDetails } from '../../store/slices/teachersSlice';
import { fetchSelectedDocuments, type DocumentItem } from '../../store/slices/documentsSlice';
import DocumentCard from '../../components/docComp/DocumentCard';
import StatsGrid from '../../components/organisms/StatsGrid';
import DocumentModal from '../../components/docComp/DocumentModal';

import { TeacherCalendar } from '../../components/organisms/TeacherCalendar';

interface Tab {
  key: number;
  label: string;
  value: string;
  icon?: string;
}

export function TeacherProfilePage() {
  const { user_id: teacher_user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState<string>('documents');

  const { teacher_details, loading: teacherLoading } = useAppSelector((state) => state.teachers);
  const { documents, status: documentStatus } = useAppSelector((state) => state.documents);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [docPage, setDocPage] = useState<number>(1);


  useEffect(() => {
    if (teacher_user_id) {
      dispatch(getTeacherDetails(teacher_user_id));
    }
  }, [dispatch, teacher_user_id]);

  // Fetch documents when teacher details are loaded
  useEffect(() => {
    const docIds = teacher_details?.documents;
    if (docIds && docIds.length > 0) {
      dispatch(fetchSelectedDocuments({ doc_ids: docIds }));
    }
  }, [dispatch, teacher_details]);

  // Sync selected document with URL query param
  useEffect(() => {
    const docId = searchParams.get('document');
    if (docId && documents.length > 0) {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        if (selectedDoc?.id !== doc.id) {
          setDocPage(1); // Reset page only if document changes
        }
        setSelectedDoc(doc);
      }
    } else if (!docId) {
      setSelectedDoc(null);
    }
  }, [searchParams, documents, selectedDoc]);

  const handleDocumentClick = (doc: DocumentItem) => {
    setSearchParams((prev: URLSearchParams) => {
      prev.set('document', doc.id);
      return prev;
    });
  };

  const handleCloseModal = () => {
    setSearchParams((prev: URLSearchParams) => {
      prev.delete('document');
      return prev;
    });
  };

  const tabs: Tab[] = [
    {
      key: 2,
      label: 'Documents',
      value: 'documents',
    },
    {
      key: 3,
      label: 'Calendar',
      value: 'calendar',
    },
    {
      key: 1,
      label: 'Details',
      value: 'details',
    }
  ];

  if (teacherLoading) {
    return (
      <FullLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-16 h-16 border-4 border-logoBlue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </FullLayout>
    );
  }

  return (
    <FullLayout>
      {({ selectedData, setSelectedData, selectedDocument, setSelectedDocument, setIsChatOpen }) => (
        <>
          {selectedDoc && <DocumentModal
            doc={selectedDoc}
            onClose={handleCloseModal}
            setSelectedData={setSelectedData}
            selectedData={selectedData}
            setSelectedDocument={setSelectedDocument}
            selectedDocument={selectedDocument}
            initialPage={docPage}
            onPageChange={setDocPage}
          />}
          <div className="min-h-screen max-w-5xl mx-auto px-4 py-8">

            {/* Header Section */}
            <div className="relative mb-8 p-6 rounded-3xl bg-white dark:bg-black backdrop-blur-xl border border-white shadow-lg">
              <div className="absolute top-2 left-2 flex flex-col gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-1 rounded-xl font-bold text-sm bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-arrow-small-left flex items-center justify-center" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group p-1.5 rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <div className="relative">
                    <img
                      className="h-28 w-28 rounded-full object-cover border-4 border-white dark:border-black shadow-md bg-white"
                      src={teacher_details?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt={teacher_details?.name}
                    />
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-logoBlue rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                      <i className="fi fi-rr-badge-check flex items-center justify-center text-xs text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 mb-2 justify-center sm:justify-start">
                    <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent capitalize">
                      {teacher_details?.name}
                    </h1>
                    <span className="px-3 py-1 mb-1 text-xs font-bold bg-gradient-to-r from-logoSky to-logoPurple text-white rounded-full border border-logoBlue/20">
                      Educator
                    </span>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center gap-2 justify-center sm:justify-start">
                    <i className="fi fi-rr-envelope flex items-center justify-center text-sm" />
                    {teacher_details?.email}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {teacher_details?.subjects?.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-gray-700 capitalize transform hover:-translate-y-0.5 transition-transform duration-200"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex p-1 bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl max-w-xl mx-auto sm:mx-0">
                {tabs?.map((tab: Tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCurrentTab(tab.value)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${currentTab === tab.value
                      ? 'bg-gradient-to-r from-logoBlue to-logoViolet text-white shadow-lg shadow-logoBlue/20'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white backdrop-blur-sm rounded-3xl min-h-full">
              {currentTab === "documents" ? (
                <div className="p-4 sm:p-0">
                  <div className="flex justify-between items-center mb-6 px-4">
                    <h2 className="text-base lg:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <i className="fi fi-rr-document-signed flex items-center justify-center text-logoBlue" />
                      Shared Documents
                    </h2>
                    <span className="text-xs font-bold text-white bg-logoBlue px-3 py-1 rounded-full">
                      {documents?.length || 0} Files
                    </span>
                  </div>

                  {documentStatus === 'loading' ? (
                    <div className="flex justify-center py-20">
                      <div className="w-12 h-12 border-4 border-logoBlue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : documents && documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {documents.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} onClick={() => handleDocumentClick(doc)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-black rounded-3xl border border-dashed border-slate-200 dark:border-gray-800">
                      <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-gray-800 mx-auto flex items-center justify-center mb-4">
                        <i className="fi fi-rr-folder-open text-4xl text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No documents shared</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Documents shared by this teacher will appear here.</p>
                    </div>
                  )}
                </div>
              ) : currentTab === "calendar" ? (
                <div className="p-4 sm:p-0">
                  <div className="bg-white dark:bg-black rounded-3xl border border-white shadow-sm overflow-hidden p-2">
                    <TeacherCalendar events={teacher_details?.calendar?.events || []} />
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">

                      {/* Stats Grid */}
                      <StatsGrid teacherDetails={teacher_details} />

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <i className="fi fi-rr-user flex items-center justify-center text-logoBlue"></i>
                          About
                        </h3>
                        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-white shadow-sm text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          <p>
                            Passionate educator dedicated to excellence in education.
                            Specializing in {teacher_details?.subjects?.join(", ") || "General Studies"}.
                            Helping students achieve their dreams in IIT JEE, NEET, and CBSE board exams.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <i className="fi fi-rr-briefcase flex items-center justify-center text-logoViolet"></i>
                          Professional Details
                        </h3>
                        <div className="bg-white dark:bg-black rounded-2xl border border-white shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-logoSky to-logoPink flex items-center justify-center text-white">
                                <i className="fi fi-sr-graduation-cap flex items-center justify-center" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Organization</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{teacher_details?.organization?.name || "Independent"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center text-white">
                                <i className="fi fi-sr-book-alt flex items-center justify-center" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Subjects</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{teacher_details?.subjects?.join(", ") || "Not specified"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-logoPurple to-logoSky flex items-center justify-center text-white">
                                <i className="fi fi-sr-chalkboard-user flex items-center justify-center" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Target Exams</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">IIT JEE, NEET, CBSE</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl group">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-logoBlue to-logoViolet" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-2xl">
                            <i className="fi fi-rr-comment-question" />
                          </div>
                          <h3 className="font-bold text-xl mb-2">Connect</h3>
                          <p className="text-sm text-blue-50 mb-6 font-medium leading-relaxed">
                            Have doubts? Start a chat with {teacher_details?.name} to get personal guidance.
                          </p>
                          <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-full py-3 bg-white text-logoBlue rounded-xl font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <i className="fi fi-rr-paper-plane flex items-center justify-center" />
                            Start Chat
                          </button>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-logoPurple/30 rounded-full blur-2xl group-hover:bg-logoPurple/40 transition-colors duration-500" />
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </FullLayout >
  );
}
