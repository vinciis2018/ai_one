import { useEffect, useState } from 'react';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getTeacherDetails, addCalendarEvent, updateTeacherPersona } from '../../store/slices/teachersSlice';
import { getStudentDetails } from '../../store/slices/studentsSlice';
import { fetchSelectedDocuments, type DocumentItem } from '../../store/slices/documentsSlice';
import DocumentCard from '../../components/docComp/DocumentCard';
import StatsGrid from '../../components/organisms/StatsGrid';
import DocumentModal from '../../components/docComp/DocumentModal';
import EditProfileModal from './components/EditProfileModal';
import { TeacherCalendar, type CalendarEvent } from '../../components/organisms/TeacherCalendar';
import { LoadingComponent } from '../../components/molecules/LoadingComponent';

interface Tab {
  key: number;
  label: string;
  value: string;
  icon?: string;
}

export function UserProfilePage() {
  const dispatch = useAppDispatch();
  const [currentTab, setCurrentTab] = useState<string>('details');
  const { user } = useAppSelector((state) => state.auth);
  const { teacher_details, loading, error } = useAppSelector((state) => state.teachers);
  const { student_details } = useAppSelector((state) => state.students);
  const { documents, status: documentStatus } = useAppSelector((state) => state.documents);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [teacherPersona, setTeacherPersona] = useState({
    personality: "",
    answerStyle: "",
    youtubeVideoUrl: ""
  });

  // Load existing persona from teacher_details
  useEffect(() => {
    if (teacher_details) {
      setTeacherPersona({
        personality: teacher_details?.persona?.personality || "",
        answerStyle: teacher_details?.persona?.answer_style || "",
        youtubeVideoUrl: teacher_details?.persona?.youtube_video_url || ""
      });
    }
  }, [teacher_details]);

  const handleSavePersona = () => {
    if (user?._id) {
      dispatch(updateTeacherPersona({
        teacherId: user._id,
        persona: {
          personality: teacherPersona?.personality,
          answer_style: teacherPersona?.answerStyle,
          youtube_video_url: teacherPersona?.youtubeVideoUrl
        }
      }));
    }
  };

  useEffect(() => {
    if (user?.role == "teacher") {
      dispatch(getTeacherDetails(user?._id || ""));
    }
    if (user?.role == "student") {
      dispatch(getStudentDetails(user?._id || ""));
    }
  }, [dispatch, user]);

  // Fetch documents when teacher/student details are loaded
  useEffect(() => {
    const docIds = teacher_details?.documents || student_details?.documents;
    if (docIds && docIds.length > 0) {
      dispatch(fetchSelectedDocuments({ doc_ids: docIds }));
    }
  }, [dispatch, teacher_details, student_details]);


  const tabs: Tab[] = [
    {
      key: 1,
      label: 'Details',
      value: 'details',
      icon: 'fi-rr-user'
    },
    {
      key: 2,
      label: 'Documents',
      value: 'documents',
      icon: 'fi-rr-document'
    },
  ];

  if (user?.role === 'teacher') {
    tabs.splice(2, 0, {
      key: 3,
      label: 'Calendar',
      value: 'calendar',
      icon: 'fi-rr-calendar'
    });
  }

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    if (user?._id) {
      dispatch(addCalendarEvent({ teacherId: user._id, event }));
    }
  };

  const personalityOptions = [
    "strict",
    "friendly",
    "encouraging",
    "socratic",
    "direct",
    "humorous",
    "analytical",
    "patient"
  ];

  return (
    <SimpleLayout>
      {selectedDoc && <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

      <div className="mt-16 relative min-h-screen w-full bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5 p-4 sm:p-8">

        <div className={`relative z-10 ${user?.role === 'teacher' ? 'max-w-5xl' : 'max-w-3xl'} mx-auto space-y-6`}>
          {/* Profile Header Card */}
          <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-md rounded-3xl p-4 lg:p-8 transform transition-all hover:scale-[1.002] duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-logoBlue to-logoViolet rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300"></div>
                <img
                  className="relative h-28 w-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                  src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt={user?.full_name}
                />
                <button className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-logoBlue hover:scale-110 transition-transform">
                  <i className="fi fi-rr-camera text-sm flex items-center justify-center"></i>
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-lg lg:text-3xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-3 justify-center sm:justify-start">
                      {user?.full_name}
                      {user?.role === 'teacher' && (
                        <span className="flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-logoSky to-logoPurple text-white rounded-full shadow-lg shadow-logoBlue">
                          E<span className="hidden lg:block">ducator</span>
                        </span>
                      )}
                    </h1>
                    <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-medium mt-1">{user?.email}</p>
                    {user?.role === 'teacher' && (
                      <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                        {['IIT JEE', 'NEET', 'CBSE'].map((tag, i) => (
                          <span key={i} className="px-3 py-1 text-xs font-bold bg-white dark:bg-white border border-slate-200 dark:border-white text-slate-600 dark:text-slate-300 rounded-lg backdrop-blur-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-6 py-2.5 text-sm lg:text-base rounded-xl border border-slate-200 dark:border-white font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white transition-all flex items-center gap-2"
                  >
                    <i className="fi fi-rr-edit flex items-center justify-center"></i> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-black backdrop-blur-md p-1.5 rounded-2xl flex gap-1 border border-white shadow-sm overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.value)}
                className={`flex-1 min-w-[120px] py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${currentTab === tab.value
                  ? 'bg-white dark:bg-slate-800 text-logoBlue shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-white'
                  }`}
              >
                {tab.icon && <i className={`fi ${tab.icon} flex items-center justify-center`}></i>}
                <span className="hidden lg:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            {/* Edit tab removed in favor of modal, but logic preserved for 'documents', 'calendar', etc. */}
            {currentTab === "documents" ? (
              <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-xl rounded-3xl p-4 lg:p-8 animate-fade-in-up">
                <div className="grid grid-cols-12 border-b border-slate-100 pb-4">
                  <div className="col-span-11 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fi fi-rr-document text-white flex items-center justify-center"></i>
                    </div>
                    <div>
                      <h2 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">Notes</h2>
                      <p className="text-slate-500 text-xs lg:text-sm">Manage your uploaded materials</p>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-center gap-2 bg-white text-logoBlue font-bold px-4 py-2 rounded-xl lg:text-sm text-xs border border-logoBlue">
                    <span className="">{documents?.length || 0}</span>
                    <span className="hidden lg:block">Files</span>
                  </div>
                </div>

                {documentStatus === 'loading' ? (
                 <LoadingComponent size="sm" message="Loading files" />
                ) : documents && documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 pt-4 lg:grid-cols-3 gap-3 lg:gap-6">
                    {documents.map((doc) => (
                      <div key={doc.id} className="">
                        <DocumentCard doc={doc} onClick={() => setSelectedDoc(doc)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fi fi-rr-folder-open text-3xl text-slate-400"></i>
                    </div>
                    <h3 className="text-base lg:text-xl font-bold text-slate-700">No notes yet</h3>
                    <p className="text-slate-500 lg:text-sm text-xs mb-6">Upload notes to get started</p>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold text-xs lg:text-sm hover:bg-slate-800 transition-colors">
                      Upload Notes
                    </button>
                  </div>
                )}
              </div>
            ) : currentTab === "calendar" && user?.role === "teacher" ? (
              <TeacherCalendar events={teacher_details?.calendar?.events} onAddEvent={handleAddEvent} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 animate-fade-in-up">
                {/* Profile Information */}
                <div className={`${user?.role === "teacher" ? "lg:col-span-2" : "lg:col-span-3"} space-y-8`}>
                  <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-3xl p-4 lg:p-8">
                    {/* Stats Grid */}
                    <StatsGrid teacherDetails={teacher_details} studentDetails={student_details} />
                  </div>

                  <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-md rounded-3xl p-4 lg:p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center text-white shadow-lg">
                        <i className="fi fi-rr-user text-base flex items-center justify-center"></i>
                      </div>
                      <h3 className="font-bold text-lg lg:text-xl text-slate-900 dark:text-white">About</h3>
                    </div>

                    <div className="text-sm lg:text-base bg-white dark:bg-white rounded-2xl p-2 lg:p-6 border border-slate-100 dark:border-white text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Passionate {user?.role} dedicated to excellence in education.
                      Specializing in {teacher_details?.subjects?.join(", ") || student_details?.subjects?.join(", ") || "General Studies"}.
                      {user?.role === 'teacher' && " Helping students achieve their dreams in IIT JEE, NEET, and CBSE board exams."}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-md rounded-3xl p-4 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <i className="fi fi-rr-briefcase text-base flex items-center justify-center"></i>
                      </div>
                      <h3 className="font-bold text-lg lg:text-xl text-slate-900 dark:text-white">Professional Details</h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 lg:gap-4">
                      <div className="bg-white dark:bg-white p-2 lg:p-4 rounded-2xl border border-slate-100 dark:border-white hover:border-logoSky transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-logoSky flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fi fi-sr-graduation-cap text-base flex items-center justify-center text-xl text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</p>
                            <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white">{teacher_details?.organization?.name || student_details?.organization?.name || "Independent"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-white p-2 lg:p-4 rounded-2xl border border-slate-100 dark:border-white hover:border-logoSky transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-logoSky flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fi fi-sr-book-alt text-base flex items-center justify-center text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects</p>
                            <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white capitalize">{teacher_details?.subjects?.join(", ") || student_details?.subjects?.join(", ") || "Not specified"}</p>
                          </div>
                        </div>
                      </div>

                      {user?.role === 'teacher' && (
                        <div className="bg-white dark:bg-white p-4 rounded-2xl border border-slate-100 dark:border-white hover:border-logoSky transition-colors group sm:col-span-2">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-logoSky flex items-center justify-center group-hover:scale-110 transition-transform">
                              <i className="fi fi-sr-chalkboard-user text-base flex items-center justify-center text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Exams</p>
                              <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white">IIT JEE, NEET, CBSE</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Teacher Persona */}
                {user?.role === "teacher" && (
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-md rounded-3xl p-4 lg:p-8 sticky">
                      <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center text-white shadow-lg shadow-logoViolet">
                          <i className="fi fi-rr-magic-wand text-base flex items-center justify-center text-xl"></i>
                        </div>
                        AI Persona
                      </h3>

                      <div className="space-y-5">
                        <div>
                          <label htmlFor="personality" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Personality Style
                          </label>
                          <select
                            id="personality"
                            value={teacherPersona.personality}
                            onChange={(e) => setTeacherPersona(prev => ({ ...prev, personality: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-logoViolet focus:ring-2 focus:ring-logoViolet/20 outline-none transition-all bg-white/50 backdrop-blur-sm capitalize font-medium"
                          >
                            <option value="" disabled>Select a personality</option>
                            {personalityOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="answerStyle" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Teaching Style
                          </label>
                          <textarea
                            id="answerStyle"
                            rows={4}
                            value={teacherPersona.answerStyle}
                            onChange={(e) => setTeacherPersona(prev => ({ ...prev, answerStyle: e.target.value }))}
                            placeholder="e.g. I prefer to answer with analogies..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-logoViolet focus:ring-2 focus:ring-logoViolet/20 outline-none transition-all bg-white/50 backdrop-blur-sm resize-none font-medium text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="youtubeVideoUrl" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Intro Video (URL)
                          </label>
                          <input
                            type="url"
                            id="youtubeVideoUrl"
                            value={teacherPersona.youtubeVideoUrl}
                            onChange={(e) => setTeacherPersona(prev => ({ ...prev, youtubeVideoUrl: e.target.value }))}
                            placeholder="https://youtube.com/..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-logoViolet focus:ring-2 focus:ring-logoViolet/20 outline-none transition-all bg-white/50 backdrop-blur-sm font-medium text-sm"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            className={`w-full py-3.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-logoBlue to-logoViolet shadow-logoBlue/20'
                              }`}
                            onClick={handleSavePersona}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <i className="fi fi-rr-spinner flex items-center justify-center text-base animate-spin"></i>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="fi fi-rr-disk flex items-center justify-center text-base"></i>
                                Save Configuration
                              </>
                            )}
                          </button>
                          {error && (
                            <p className="text-xs text-red-500 text-center mt-3 font-bold bg-red-50 py-2 rounded-lg">
                              <i className="fi fi-rr-exclamation mr-1"></i> {error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}

export default UserProfilePage;
