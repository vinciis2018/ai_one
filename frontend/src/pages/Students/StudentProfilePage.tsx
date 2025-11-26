import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getStudentDetails } from '../../store/slices/studentsSlice';
import { getStudentAnalytics } from '../../store/slices/teachersSlice';
import { fetchSelectedDocuments, type DocumentItem } from '../../store/slices/documentsSlice';
import Header from '../Auth/components/Header';
import DocumentCard from '../Auth/components/DocumentCard';
import StatsGrid from '../Auth/components/StatsGrid';
import DocumentModal from '../Auth/components/DocumentModal';

interface Tab {
  key: number;
  label: string;
  value: string;
  icon?: string;
}

export function StudentProfilePage() {
  const { user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState<string>('documents');

  const { student_details, loading: studentLoading } = useAppSelector((state) => state.students);
  const { documents, status: documentStatus } = useAppSelector((state) => state.documents);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    if (user_id) {
      dispatch(getStudentDetails(user_id));
    }
  }, [dispatch, user_id]);

  // Fetch documents when student details are loaded
  useEffect(() => {
    const docIds = student_details?.documents;
    if (docIds && docIds.length > 0) {
      dispatch(fetchSelectedDocuments({ doc_ids: docIds }));
    }
  }, [dispatch, student_details]);

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

  // Fetch analytics when tab is changed to analytics
  useEffect(() => {
    if (currentTab === 'analytics' && user_id) {
      dispatch(getStudentAnalytics(user_id));
    }
  }, [dispatch, currentTab, user_id]);

  const { student_analytics } = useAppSelector((state) => state.teachers);

  const tabs: Tab[] = [
    {
      key: 2,
      label: 'Documents',
      value: 'documents',
    },
    {
      key: 1,
      label: 'Details',
      value: 'details',
    },
    {
      key: 3,
      label: 'Analytics',
      value: 'analytics',
    }
  ];

  if (studentLoading) {
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
                src={student_details?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt={student_details?.name}
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl text-black dark:text-white font-bold capitalize flex items-center gap-2 justify-center sm:justify-start">
                {student_details?.name}
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full border border-green-200">
                  Student
                </span>
              </h1>
              <p className="text-sm text-gray-500">{student_details?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                {student_details?.subjects?.map((subject, index) => (
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
        ) : currentTab === "analytics" ? (
          <div className="p-4 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Student Analytics</h2>
            {student_analytics ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <i className="fi fi-rr-comment-alt"></i>
                      </div>
                      <h3 className="font-semibold text-gray-700">Interactions</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{student_analytics.total_interactions || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">conversations</p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <i className="fi fi-rr-list-check"></i>
                      </div>
                      <h3 className="font-semibold text-gray-700">Quizzes</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{student_analytics.quiz_metrics?.total_micro_quizes || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Micro quizzes</p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <i className="fi fi-rr-check-circle"></i>
                      </div>
                      <h3 className="font-semibold text-gray-700">Accuracy</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{student_analytics.quiz_metrics?.accuracy_percentage?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-gray-500 mt-1">Correct answers</p>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <i className="fi fi-rr-document"></i>
                      </div>
                      <h3 className="font-semibold text-gray-700">Questions</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{student_analytics.quiz_metrics?.total_questions || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Total attempted</p>
                  </div>
                </div>

                {/* Weak Areas */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                      <i className="fi fi-rr-exclamation"></i>
                    </div>
                    <h3 className="font-semibold text-gray-700">Weak Areas</h3>
                  </div>
                  {student_analytics.weak_areas && student_analytics.weak_areas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {student_analytics.weak_areas.map((area: any, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-full text-sm font-medium shadow-sm">
                          {area.topic} <span className="text-red-400 ml-1">({area.count})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No weak areas identified yet.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Topic Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fi fi-rr-book-alt text-indigo-500"></i>
                      Topic Distribution
                    </h3>
                    <div className="space-y-4">
                      {student_analytics.topic_distribution && Object.entries(student_analytics.topic_distribution).map(([subject, topics]: [string, any], idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">{subject}</p>
                          <div className="space-y-2 ml-3">
                            {Object.entries(topics).map(([topic, count]: [string, any], topicIdx) => (
                              <div key={topicIdx} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 capitalize">{topic === 'null' ? 'General' : topic}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-500 rounded-full"
                                      style={{ width: `${(count / Math.max(...Object.values(topics) as number[])) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-900 w-6 text-right">{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!student_analytics.topic_distribution || Object.keys(student_analytics.topic_distribution).length === 0) && (
                        <p className="text-sm text-gray-500">No topic data available yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Interaction Profile */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fi fi-rr-chart-pie-alt text-purple-500"></i>
                      Interaction Profile
                    </h3>
                    <div className="space-y-3">
                      {student_analytics.interaction_profile && Object.entries(student_analytics.interaction_profile).map(([type, count]: [string, any], idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                          <div className="flex items-center gap-3 flex-1 mx-4">
                            <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(count / (student_analytics.total_interactions || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      ))}
                      {(!student_analytics.interaction_profile || Object.keys(student_analytics.interaction_profile).length === 0) && (
                        <p className="text-sm text-gray-500">No interaction data available yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quiz Performance Details */}
                {student_analytics.quiz_metrics && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fi fi-rr-stats text-teal-500"></i>
                      Quiz Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-2xl font-bold text-green-600">{student_analytics.quiz_metrics.multiple_choice_correct || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">MCQ Correct</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-2xl font-bold text-red-600">{student_analytics.quiz_metrics.multiple_choice_incorrect || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">MCQ Incorrect</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-2xl font-bold text-blue-600">{student_analytics.quiz_metrics.short_answer_attempted || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">Short Answered</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-2xl font-bold text-gray-600">{student_analytics.quiz_metrics.short_answer_unanswered || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">Unanswered</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fi fi-rr-time-past text-green-500"></i>
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {student_analytics.recent_activity && student_analytics.recent_activity.slice(0, 5).map((activity: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className={`w-2 h-2 mt-2 rounded-full ${activity.interaction_type === 'Conceptual Doubt' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {activity.subject && activity.topic ? `${activity.subject} > ${activity.topic}` : activity.subject || "General"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500 capitalize">{activity.interaction_type}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!student_analytics.recent_activity || student_analytics.recent_activity.length === 0) && (
                      <p className="text-sm text-gray-500">No recent activity.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-10">
                <i className="fi fi-br-circle animate-spin text-2xl text-gray-400"></i>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">

                {/* Stats Grid */}
                <StatsGrid studentDetails={student_details} />

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fi fi-rr-user text-gray-400"></i>
                    About
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 leading-relaxed">
                    <p>
                      Dedicated student focused on academic excellence.
                      Studying {student_details?.subjects?.join(", ") || "General Studies"}.
                      Preparing for competitive exams and building a strong foundation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fi fi-rr-briefcase text-gray-400"></i>
                    Academic Details
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <i className="fi fi-sr-graduation-cap text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Organization</p>
                          <p className="text-sm font-medium text-gray-900">{student_details?.organization?.name || "Independent"}</p>
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
                          <p className="text-sm font-medium text-gray-900">{student_details?.subjects?.join(", ") || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <div className="text-green2 bg-gradient-to-br from-white to-greenLight rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Guide Student</h3>
                  <p className="text-sm mb-4">Chat with this student to provide guidance and support.</p>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full py-2 bg-green2 text-white rounded-lg font-semibold text-sm hover:bg-gray-500 transition-colors"
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
