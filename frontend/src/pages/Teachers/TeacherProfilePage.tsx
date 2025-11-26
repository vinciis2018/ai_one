import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getTeacherDetails } from '../../store/slices/teachersSlice';
import { fetchSelectedDocuments, type DocumentItem } from '../../store/slices/documentsSlice';
import Header from '../Auth/components/Header';
import DocumentCard from '../Auth/components/DocumentCard';
import StatsGrid from '../Auth/components/StatsGrid';
import DocumentModal from '../Auth/components/DocumentModal';

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
        setSelectedDoc(doc);
      }
    } else if (!docId) {
      setSelectedDoc(null);
    }
  }, [searchParams, documents]);

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
          <i className="fi fi-br-circle animate-spin text-2xl text-gray-400"></i>
        </div>
      </FullLayout>
    );
  }

  return (
    <FullLayout>
      {selectedDoc && <DocumentModal doc={selectedDoc} onClose={handleCloseModal} />}
      <div className="bg-white max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="py-4">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                src={teacher_details?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt={teacher_details?.name}
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl text-black dark:text-white font-bold capitalize flex items-center gap-2 justify-center sm:justify-start">
                {teacher_details?.name}
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  Educator
                </span>
              </h1>
              <p className="text-sm text-gray-500">{teacher_details?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                {teacher_details?.subjects?.map((subject, index) => (
                  <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200 capitalize">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 max-w-screen grid grid-cols-3 gap-4 border-b border-gray-100 mb-4">
          {tabs?.map((tab: Tab) => (
            <div className="col-span-1" key={tab.key}>
              <button
                type="button"
                onClick={() => setCurrentTab(tab.value)}
                className={`p-2 w-full focus:outline-none transition-colors ${currentTab === tab.value
                  ? 'border-b-2 border-green text-green font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-md'
                  }`}
              >
                {tab.label}
              </button>
            </div>
          ))}
        </div>

        {currentTab === "documents" ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Shared Documents</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {documents?.length || 0} Files
              </span>
            </div>

            {documentStatus === 'loading' ? (
              <div className="flex justify-center py-10">
                <i className="fi fi-br-circle animate-spin text-2xl text-gray-400"></i>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} onClick={() => handleDocumentClick(doc)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <i className="fi fi-rr-folder-open text-3xl text-gray-300 mb-2 block"></i>
                <p className="text-gray-500 text-sm">No documents shared yet.</p>
              </div>
            )}
          </div>
        ) : currentTab === "calendar" ? (
          <div className="p-4">
            <TeacherCalendar events={teacher_details?.calendar?.events || []} />
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">

                {/* Stats Grid */}
                <StatsGrid teacherDetails={teacher_details} />

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fi fi-rr-user text-gray-400"></i>
                    About
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 leading-relaxed">
                    <p>
                      Passionate educator dedicated to excellence in education.
                      Specializing in {teacher_details?.subjects?.join(", ") || "General Studies"}.
                      Helping students achieve their dreams in IIT JEE, NEET, and CBSE board exams.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fi fi-rr-briefcase text-gray-400"></i>
                    Professional Details
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <i className="fi fi-sr-graduation-cap text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Organization</p>
                          <p className="text-sm font-medium text-gray-900">{teacher_details?.organization?.name || "Independent"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                          <i className="fi fi-sr-book-alt text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Subjects</p>
                          <p className="text-sm font-medium text-gray-900">{teacher_details?.subjects?.join(", ") || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                          <i className="fi fi-sr-chalkboard-user text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Target Exams</p>
                          <p className="text-sm font-medium text-gray-900">IIT JEE, NEET, CBSE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <div className="text-violet bg-gradient-to-br from-white to-greenLight rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Connect</h3>
                  <p className="text-sm mb-4">Chat with this teacher to clear your doubts instantly.</p>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full py-2 bg-green text-white rounded-lg font-semibold text-sm hover:bg-gray-500 transition-colors"
                  >
                    Go to Chat
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </FullLayout >
  );
}
