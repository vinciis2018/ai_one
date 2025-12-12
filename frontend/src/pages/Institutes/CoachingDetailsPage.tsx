import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  resetCoachingState,
  getCoachingDetails,
  listInstituteTeachers,
  listInstituteStudents,
  addTeacherToInstitute,
  addStudentToInstitute,
  type OrganisationModel,
} from "../../store/slices/coachingSlice";
import type { User } from "../../types";
import { clearAllDocuments, fetchDocuments, type DocumentItem } from "../../store/slices/documentsSlice";
import type { TeacherModel } from "../../store/slices/teachersSlice";
import type { StudentModel } from "../../store/slices/studentsSlice";
import { useParams, useNavigate } from "react-router-dom";
import { FullLayout } from "../../layouts/AppLayout";

export const CoachingDetailsPage: React.FC = () => {
  const { id: coachingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [coachingData, setCoachingData] = useState<OrganisationModel | null>(null);
  const [activeTab, setActiveTab] = useState<'study_material' | 'pyq' | 'tests' | 'practice' | 'people'>('study_material');

  const { user } = useAppSelector((state) => state.auth);

  // Coaching slice selectors
  const { coachingDetails, loading: coachingLoading, teachers, students } = useAppSelector(
    (state) => state.coachings
  );
  const { documents } = useAppSelector(
    (state) => state.documents
  );
  const { uploadStatus } = useAppSelector((state) => state.assistant);

  useEffect(() => {
    if (coachingDetails && Object.keys(coachingDetails).length > 0) {
      setCoachingData(coachingDetails as OrganisationModel);
    } else {
      setCoachingData(null);
    }
  }, [coachingDetails]);

  useEffect(() => {
    if (coachingDetails) {
      const user_ids = new Set<string>();
      teachers?.forEach((teacher: TeacherModel) => user_ids.add(teacher.user_id));
      students?.forEach((student: StudentModel) => user_ids.add(student.user_id));
      dispatch(fetchDocuments({ user_ids: Array.from(user_ids) }));
    }
  }, [dispatch, teachers, students, coachingDetails]);

  useEffect(() => {
    if (coachingId || (coachingId && uploadStatus === "succeeded")) {
      dispatch(getCoachingDetails(coachingId));
      dispatch(listInstituteTeachers(coachingId));
      dispatch(listInstituteStudents(coachingId));
    }

    return () => {
      dispatch(resetCoachingState());
      dispatch(clearAllDocuments());
    };
  }, [coachingId, dispatch, uploadStatus]);

  // New: add current user as teacher
  const handleAddSelfAsTeacher = async () => {
    if (!user || !coachingId) return;
    const payload = {
      user_id: String((user as User)._id ?? ""),
      name: (user as User).full_name || "Unknown",
      email: (user as User).email || "Unknown",
      subjects: undefined,
      avatar: (user as User).avatar || "",
    };
    await dispatch(addTeacherToInstitute({ coaching_id: coachingId, teacher: payload }));
    dispatch(listInstituteTeachers(coachingId));
  };

  // New: add current user as student
  const handleAddSelfAsStudent = async () => {
    if (!user || !coachingId) return;
    const payload = {
      user_id: String((user as User)._id ?? ""),
      name: (user as User).full_name || "Unknown",
      email: (user as User).email || "Unknown",
      avatar: (user as User).avatar || "",
    };
    await dispatch(addStudentToInstitute({ coaching_id: coachingId, student: payload }));
    dispatch(listInstituteStudents(coachingId));
  };


  if (!coachingId) return null;

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const isMember = (isTeacher && teachers?.some(t => t.user_id === user?._id)) ||
    (isStudent && students?.some(s => s.user_id === user?._id));

  const tabList = [
    { key: 'study_material', label: 'Study Material', icon: 'fi-rr-book-alt' },
    { key: 'pyq', label: 'Previous Year Papers', icon: 'fi-rr-calendar' },
    { key: 'tests', label: 'Test Questions', icon: 'fi-rr-edit' },
    { key: 'practice', label: 'Daily Practice', icon: 'fi-rr-checkbox' },
    { key: 'people', label: 'People', icon: 'fi-rr-users-alt' },
  ];

  const handleDocumentClick = (document: DocumentItem) => {
    if (isTeacher) {
      navigate(`/documents/${document.id}`);
    }
    if (isStudent) {
      window.open(document.s3_url)
      // navigate(`/teacher/profile/${document.user_id}?document=${document.id}`)
    }
  };

  return (
    <FullLayout>
      <div className="min-h-screen max-w-7xl mx-auto p-4 lg:p-8">
        {/* Hero Header */}
        <div className="relative mb-4 lg:mb-8 p-3 lg:p-6 rounded-3xl bg-white dark:bg-black backdrop-blur-xl border border-white shadow-lg">
          <div className="absolute top-2 left-2 flex flex-col gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-xl font-bold text-sm bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fi fi-rr-arrow-small-left flex items-center justify-center" />
            </button>
          </div>
          <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 lg:gap-6">
            <div className="w-full flex items-start gap-3 lg:gap-6">
              <div className="relative group p-1.5 rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                <div className="relative w-16 h-16 lg:w-24 lg:h-24 rounded-2xl bg-white dark:bg-black flex items-center justify-center text-4xl font-bold shadow-md border-2 border-white dark:border-gray-800">
                  <span className="bg-gradient-to-br from-logoBlue to-logoViolet bg-clip-text text-transparent">
                    {coachingData?.name?.charAt(0) || "I"}
                  </span>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-wrap items-center gap-1 lg:gap-4 mb-2">
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent capitalize">
                    {coachingData?.name || "Institute Name"}
                  </h1>
                  {isMember && (
                    <span className="px-3 py-1 bg-gradient-to-r from-logoSky to-logoPurple text-white text-xs font-bold rounded-full">
                      Member
                    </span>
                  )}
                </div>

                <div className="w-full flex gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <i className="fi fi-rr-users-alt flex items-center justify-center text-logoBlue"></i>
                      <span>{teachers?.length || 0} <span className="hidden lg:inline-block">Teachers</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fi fi-rr-graduation-cap flex items-center justify-center text-logoViolet"></i>
                      <span>{students?.length || 0} <span className="hidden lg:inline-block">Students</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fi fi-rr-document flex items-center justify-center text-logoSky"></i>
                      <span>{documents?.length || 0} <span className="hidden lg:inline-block">Resources</span></span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {!isMember && isTeacher && (
                      <button
                        onClick={handleAddSelfAsTeacher}
                        disabled={coachingLoading}
                        className="px-2 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold hover:shadow-lg hover:shadow-logoBlue transition-all flex items-center gap-2"
                      >
                        <i className="fi fi-rr-briefcase flex items-center justify-center"></i>
                        <span className="hidden lg:inline-block">Join as Teacher</span>
                      </button>
                    )}
                    {!isMember && isStudent && (
                      <button
                        onClick={handleAddSelfAsStudent}
                        disabled={coachingLoading}
                        className="px-2 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold hover:shadow-lg hover:shadow-logoBlue transition-all flex items-center gap-2"
                      >
                        <i className="fi fi-rr-user-add flex items-center justify-center"></i>
                        <span className="hidden lg:inline-block">Join as Student</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 lg:mb-8 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex p-1 bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl w-max md:w-auto mx-auto md:mx-0 min-w-full md:min-w-0">
            {tabList.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2.5 px-6 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab.key
                    ? 'bg-gradient-to-r from-logoBlue to-logoViolet text-white shadow-lg shadow-logoBlue'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-800'
                  }`}
              >
                <i className={`fi ${tab.icon} flex items-center justify-center`}></i>
                <span className={`${activeTab === tab.key ? "" : "hidden lg:inline-block"}`}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white backdrop-blur-sm rounded-3xl min-h-full">
          {activeTab === 'people' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:p-4">
              {/* Teachers Column */}
              <div className="bg-white rounded-3xl border border-white shadow-sm overflow-hidden">
                <div className="p-3 lg:p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <i className="fi fi-rr-chalkboard-user text-logoBlue flex items-center justify-center"></i>
                    Teachers
                  </h3>
                  <span className="bg-logoBlue px-3 py-1 rounded-full text-xs font-bold text-white">
                    {teachers?.length || 0}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {teachers?.length ? (
                    (teachers as TeacherModel[]).map((t) => (
                      <div key={t.id || t.user_id} className="group p-2 lg:p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-default hover:shadow-md rounded-xl">
                        <div className="relative w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                          {t.avatar ? (
                            <img src={t.avatar} alt={t.name} className="relative w-full h-full object-cover border border-white hover:border-4 rounded-full" />
                          ) : (
                            <span className="font-bold text-lg text-slate-400">{t.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-logoBlue transition-colors">{t.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {t.subjects ? `${t.subjects.length} Subjects` : 'Teacher'} • {t.documents?.length || 0} Uploads
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">No teachers found</div>
                  )}
                </div>
              </div>

              {/* Students Column */}
              <div className="bg-white rounded-3xl border border-white shadow-sm overflow-hidden">
                <div className="p-3 lg:p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <i className="fi fi-rr-users-alt text-logoViolet flex items-center justify-center"></i>
                    Students
                  </h3>
                  <span className="bg-logoViolet px-3 py-1 rounded-full text-xs font-bold text-white">
                    {students?.length || 0}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {students?.length ? (
                    (students as StudentModel[]).map((s) => (
                      <div key={s.id || s.user_id} className="group p-2 lg:p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-default hover:shadow-md rounded-xl">
                        <div className="relative w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                          {s.avatar ? (
                            <img src={s.avatar} alt={s.name} className="relative w-full h-full object-cover border border-white hover:border-4 rounded-full" />
                          ) : (
                            <span className="font-bold text-lg text-slate-400">{s.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-logoBlue transition-colors">{s.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Student • {s.documents?.length || 0} Uploads
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">No students found</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-12">
              {['study_material', 'pyq', 'tests', 'practice'].includes(activeTab) && (
                <div className="space-y-8">
                  {documents && documents.filter(doc =>
                    (activeTab === 'study_material' && doc?.type === 'study_material') ||
                    (activeTab === 'pyq' && doc?.type === 'pyq_paper') ||
                    (activeTab === 'tests' && doc?.type === 'mocktest') ||
                    (activeTab === 'practice' && doc?.type === 'dpp')
                  ).length > 0 ? (
                    Object.entries(
                      documents.filter(doc =>
                        (activeTab === 'study_material' && doc?.type === 'study_material') ||
                        (activeTab === 'pyq' && doc?.type === 'pyq_paper') ||
                        (activeTab === 'tests' && doc?.type === 'mocktest') ||
                        (activeTab === 'practice' && doc?.type === 'dpp')
                      ).reduce((acc, doc) => {
                        const domain = doc.domain || 'General';
                        if (!acc[domain]) acc[domain] = [];
                        acc[domain].push(doc);
                        return acc;
                      }, {} as Record<string, typeof documents>)
                    ).map(([domain, domainDocs]) => (
                      <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-3 mb-6 px-2">
                          <h2 className="text-xl font-bold text-slate-900 capitalize flex items-center gap-2">
                            <i className="fi fi-rr-folder flex items-center justify-center text-logoBlue"></i>
                            {domain}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                            {domainDocs.length}
                          </span>
                          <div className="h-px bg-slate-100 flex-1 ml-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {domainDocs.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => handleDocumentClick(doc)}
                              className="group bg-white rounded-2xl p-4 border border-white shadow-sm hover:shadow-xl hover:border-logoBlue hover:-translate-y-1 transform block transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
                            >
                              <div className="aspect-[3/4] w-full mb-4 bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100 group-hover:border-blue-100 transition-colors z-10">
                                {doc.s3_url ? (
                                  <iframe
                                    src={doc.s3_url}
                                    className="w-full h-full object-cover pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                                    title={doc.filename}
                                    loading="lazy"
                                    scrolling="no"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <i className="fi fi-rr-document text-4xl"></i>
                                  </div>
                                )}
                                {/* Type Badge */}
                                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-white backdrop-blur-sm text-logoBlue rounded-md uppercase tracking-wider shadow-sm z-20">
                                  {doc.type === 'pyq_paper' ? 'PYQ' : doc.type === 'mocktest' ? 'TEST' : doc.type === 'dpp' ? 'DPP' : 'PDF'}
                                </span>
                              </div>

                              <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-sm group-hover:text-logoBlue transition-colors truncate relative z-10">
                                {doc.filename}
                              </h3>

                              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 relative z-10">
                                <span className="font-medium">{new Date(doc.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 font-bold group-hover:text-logoBlue transition-colors">
                                  View <i className="fi fi-rr-arrow-small-right flex items-center justify-center"></i>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-black rounded-3xl border-2 border-dashed border-slate-200 dark:border-gray-800">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className={`fi ${activeTab === 'study_material' ? 'fi-rr-book-alt text-logoBlue' :
                            activeTab === 'pyq' ? 'fi-rr-calendar text-logoViolet' :
                              activeTab === 'tests' ? 'fi-rr-edit text-logoPink' :
                                'fi-rr-checkbox text-logoSky'
                          } text-3xl`}></i>
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg mb-1">No {tabList.find(t => t.key === activeTab)?.label} yet</h3>
                      <p className="text-slate-500 text-sm mb-6">Upload materials to help students learn better.</p>
                      {isMember && (
                        <button
                          onClick={() => navigate("/documents")}
                          className="px-6 py-2.5 bg-logoBlue text-white rounded-xl font-bold hover:shadow-lg hover:shadow-logoBlue transition-all inline-flex items-center gap-2"
                        >
                          <i className="fi fi-rr-cloud-upload flex items-center justify-center"></i>
                          Upload Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FullLayout>
  );
};
