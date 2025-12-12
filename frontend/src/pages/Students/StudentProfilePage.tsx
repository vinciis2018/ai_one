import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FullLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getStudentDetails } from '../../store/slices/studentsSlice';
import { getStudentAnalytics } from '../../store/slices/teachersSlice';
import { fetchSelectedDocuments, type DocumentItem } from '../../store/slices/documentsSlice';
import DocumentCard from '../../components/docComp/DocumentCard';
import StatsGrid from '../../components/organisms/StatsGrid';
import DocumentModal from '../../components/docComp/DocumentModal';

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
  const [showTopicDistribution, setShowTopicDistribution] = useState<string | null>(null);

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


  const toggleSubject = (subject: string) => {
    if (showTopicDistribution === subject) {
      setShowTopicDistribution(null);
      return;
    }
    setShowTopicDistribution(subject);
  };

  if (studentLoading) {
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
      {({ setIsChatOpen }) => (
        <>
          {selectedDoc && <DocumentModal doc={selectedDoc} onClose={handleCloseModal} />}
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
                      src={student_details?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt={student_details?.name}
                    />
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                      <i className="fi fi-rr-check flex items-center justify-center text-xs text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 mb-2 justify-center sm:justify-start">
                    <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent capitalize">
                      {student_details?.name}
                    </h1>
                    <span className="px-3 py-1 mb-1 text-xs font-bold bg-gradient-to-r from-logoSky to-logoPurple text-white rounded-full border border-logoBlue/20">
                      Student
                    </span>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center gap-2 justify-center sm:justify-start">
                    <i className="fi fi-rr-envelope flex items-center justify-center text-sm" />
                    {student_details?.email}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {student_details?.subjects?.map((subject, index) => (
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
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Documents shared with this student will appear here.</p>
                    </div>
                  )}
                </div>
              ) : currentTab === "analytics" ? (
                <div className="p-4 sm:p-0 space-y-6">
                  <h2 className="text-base lg:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 px-4">
                    <i className="fi fi-rr-chart-histogram flex items-center justify-center text-logoViolet" />
                    Student Analytics
                  </h2>
                  {student_analytics ? (
                    <>
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-logoBlue to-logoSky p-6 rounded-2xl shadow-lg hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 border border-white rounded-xl text-white shadow-md shadow-logoBlue group-hover:scale-110 transition-transform">
                              <i className="fi fi-rr-comment-alt flex items-center justify-center"></i>
                            </div>
                            <h3 className="font-bold text-white text-sm">Interactions</h3>
                          </div>
                          <p className="text-3xl font-extrabold text-white">{student_analytics.total_interactions || 0}</p>
                          <p className="text-xs font-medium text-white mt-1 uppercase tracking-wide">Conversations</p>
                        </div>

                        <div className="bg-gradient-to-br from-logoSky to-logoPink p-6 rounded-2xl shadow-lg hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 border border-white rounded-xl text-white shadow-lg shadow-logoSky group-hover:scale-110 transition-transform">
                              <i className="fi fi-rr-list-check flex items-center justify-center"></i>
                            </div>
                            <h3 className="font-bold text-white text-sm">Quizzes</h3>
                          </div>
                          <p className="text-3xl font-extrabold text-white">{student_analytics.quiz_metrics?.total_micro_quizzes || 0}</p>
                          <p className="text-xs font-medium text-white mt-1 uppercase tracking-wide">Micro quizzes</p>
                        </div>

                        <div className="bg-gradient-to-br from-logoPink to-logoPurple p-6 rounded-2xl shadow-lg hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 border border-white rounded-xl text-white shadow-lg shadow-logoPink group-hover:scale-110 transition-transform">
                              <i className="fi fi-rr-check-circle flex items-center justify-center"></i>
                            </div>
                            <h3 className="font-bold text-white text-sm">Accuracy</h3>
                          </div>
                          <p className="text-3xl font-extrabold text-white">{student_analytics.quiz_metrics?.accuracy_percentage?.toFixed(1) || 0}%</p>
                          <p className="text-xs font-medium text-white mt-1 uppercase tracking-wide">Correct answers</p>
                        </div>

                        <div className="bg-gradient-to-br from-logoPurple to-logoViolet p-6 rounded-2xl shadow-lg hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 border border-white rounded-xl text-white shadow-lg shadow-logoPink group-hover:scale-110 transition-transform">
                              <i className="fi fi-rr-document flex items-center justify-center"></i>
                            </div>
                            <h3 className="font-bold text-white text-sm">Questions</h3>
                          </div>
                          <p className="text-3xl font-extrabold text-white">{student_analytics.quiz_metrics?.total_questions || 0}</p>
                          <p className="text-xs font-medium text-white mt-1 uppercase tracking-wide">Total attempted</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Topic Distribution */}
                        <div className="bg-white dark:bg-black p-6 rounded-2xl border border-white shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <i className="fi fi-rr-book-alt flex items-center justify-center text-logoSky"></i>
                            Topic Distribution
                          </h3>
                          <div className="space-y-6">
                            {student_analytics.topic_distribution && Object.entries(student_analytics.topic_distribution).map(([subject, topics]: [string, any], idx) => (
                              <div key={idx} className="p-2 rounded-xl border-b border-slate-50 dark:border-gray-800 pb-4 last:border-0 last:pb-0 hover:border hover:border-logoBlue hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 block">
                                <div className="flex items-center justify-between" onClick={() => toggleSubject(subject)}>
                                  <p className="text-sm font-bold text-logoBlue mb-3 capitalize flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-logoBlue"></span>
                                    {subject} ({Object.values(topics).length})
                                  </p>
                                  {showTopicDistribution === subject ? (
                                    <i className="fi fi-rr-angle-small-up flex items-center justify-center text-logoBlue cursor-pointer" />
                                  ) : (
                                    <i className="fi fi-rr-angle-small-down flex items-center justify-center text-logoBlue cursor-pointer" />
                                  )}
                                </div>
                                {showTopicDistribution === subject && (
                                  <div className="space-y-3 ml-3 p-2">
                                    {Object.entries(topics).map(([topic, count]: [string, any], topicIdx) => (
                                      <div key={topicIdx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">{topic === 'null' ? 'General' : topic}</span>
                                          <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-logoSky to-logoPink rounded-full"
                                            style={{ width: `${(count / Math.max(...Object.values(topics) as number[])) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {(!student_analytics.topic_distribution || Object.keys(student_analytics.topic_distribution).length === 0) && (
                              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                                <i className="fi fi-rr-stats text-2xl mb-2 opacity-50" />
                                <p className="text-sm">No topic data available</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interaction Profile */}
                        <div className="bg-white dark:bg-black p-6 rounded-2xl border border-white shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <i className="fi fi-rr-chart-pie-alt flex items-center justify-center text-logoPurple"></i>
                            Interaction Profile
                          </h3>
                          <div className="space-y-5">
                            {student_analytics.interaction_profile && Object.entries(student_analytics.interaction_profile).map(([type, count]: [string, any], idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">{type}</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-logoSky to-logoPink rounded-full"
                                    style={{ width: `${(count / (student_analytics.total_interactions || 1)) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                            {(!student_analytics.interaction_profile || Object.keys(student_analytics.interaction_profile).length === 0) && (
                              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                                <i className="fi fi-rr-chart-pie text-2xl mb-2 opacity-50" />
                                <p className="text-sm">No interaction data available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quiz Performance Details */}
                      {student_analytics.quiz_metrics && (
                        <div className="bg-white dark:bg-black p-6 rounded-2xl border border-white shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <i className="fi fi-rr-stats flex items-center justify-center text-logoPink"></i>
                            Quiz Breakdown
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-logoSky to-logoPink rounded-2xl shadow-md">
                              <p className="text-2xl font-black text-white ">{student_analytics.quiz_metrics.multiple_choice_correct || 0}</p>
                              <p className="text-xs font-bold text-white mt-1 uppercase">MCQ Correct</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-logoPink to-logoPurple rounded-2xl shadow-md">
                              <p className="text-2xl font-black text-white ">{student_analytics.quiz_metrics.multiple_choice_incorrect || 0}</p>
                              <p className="text-xs font-bold text-white mt-1 uppercase">MCQ Incorrect</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-logoPurple to-logoPink rounded-2xl shadow-md">
                              <p className="text-2xl font-black text-white ">{student_analytics.quiz_metrics.short_answer_attempted || 0}</p>
                              <p className="text-xs font-bold text-white mt-1 uppercase">Short Answered</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-logoPink to-logoSky rounded-2xl shadow-md">
                              <p className="text-2xl font-black text-white ">{student_analytics.quiz_metrics.short_answer_unanswered || 0}</p>
                              <p className="text-xs font-bold text-white mt-1 uppercase">Unanswered</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recent Activity */}
                      <div className="bg-white dark:bg-black p-6 rounded-2xl border border-white shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                          <i className="fi fi-rr-time-past text-logoPink flex items-center justify-center text-logoBlue"></i>
                          Recent Activity
                        </h3>
                        <div className="space-y-4">
                          {student_analytics.recent_activity && student_analytics.recent_activity.slice(0, 5).map((activity: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-50 dark:border-gray-800 last:border-0 last:pb-0 group">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${activity.interaction_type === 'Conceptual Doubt' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                <i className={`fi ${activity.interaction_type === 'Conceptual Doubt' ? 'fi-rr-bulb' : 'fi-rr-comment-alt'} flex items-center justify-center text-lg`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {activity.subject && activity.topic ? `${activity.subject} > ${activity.topic}` : activity.subject || "General"}
                                  </p>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.interaction_type}</p>
                              </div>
                            </div>
                          ))}
                          {(!student_analytics.recent_activity || student_analytics.recent_activity.length === 0) && (
                            <div className="text-center text-slate-400 py-4">
                              <p className="text-sm">No recent activity found.</p>
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Weak Areas - Modern Red Alert Style */}
                      <div className="bg-red-50 dark:bg-red-900 p-6 rounded-2xl border border-red-100 dark:border-red-900">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg text-red-600 dark:text-red-400">
                            <i className="fi fi-rr-exclamation flex items-center justify-center"></i>
                          </div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200">Attention Needed Areas</h3>
                        </div>
                        {student_analytics.weak_areas && student_analytics.weak_areas.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {student_analytics.weak_areas.map((area: any, idx: number) => (
                              <span key={idx} className="px-4 py-2 bg-white dark:bg-black border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                                {area.topic} <span className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-xs">x{area.count}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic">No weak areas identified yet. Great job!</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center py-20">
                      <div className="w-12 h-12 border-4 border-logoBlue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 sm:p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">

                      {/* Stats Grid */}
                      <StatsGrid studentDetails={student_details} />

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <i className="fi fi-rr-user flex items-center justify-center text-logoBlue"></i>
                          About
                        </h3>
                        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-white shadow-sm text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          <p>
                            Dedicated student focused on academic excellence.
                            Studying {student_details?.subjects?.join(", ") || "General Studies"}.
                            Preparing for competitive exams and building a strong foundation.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <i className="fi fi-rr-briefcase flex items-center justify-center text-logoViolet"></i>
                          Academic Details
                        </h3>
                        <div className="bg-white dark:bg-black rounded-2xl border border-white shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center text-white">
                                <i className="fi fi-sr-graduation-cap flex items-center justify-center" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Organization</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{student_details?.organization?.name || "Independent"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-logoPurple to-logoPink flex items-center justify-center text-white">
                                <i className="fi fi-sr-book-alt flex items-center justify-center" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Subjects</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{student_details?.subjects?.join(", ") || "Not specified"}</p>
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
                          <h3 className="font-bold text-xl mb-2">Guide Student</h3>
                          <p className="text-sm text-blue-50 mb-6 font-medium leading-relaxed">
                            Start a conversation to provide personalized guidance, doubt clearing, and support.
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
