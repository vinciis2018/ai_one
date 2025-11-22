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
import { UploadBox } from "../../components/atoms/UploadBox";
import type { User } from "../../types";
import { clearAllDocuments, fetchDocuments } from "../../store/slices/documentsSlice";
import type { TeacherModel } from "../../store/slices/teachersSlice";
import type { StudentModel } from "../../store/slices/studentsSlice";
import { useParams, useNavigate } from "react-router-dom";
import { FullLayout } from "../../layouts/AppLayout";

export const CoachingDetailsPage: React.FC = () => {
  const { id: coachingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [coachingData, setCoachingData] = useState<OrganisationModel | null>(null);
  const [showUploadBox, setShowUploadBox] = useState(false);
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

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  if (!coachingId) return null;

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const isMember = (isTeacher && teachers?.some(t => t.user_id === user?._id)) ||
    (isStudent && students?.some(s => s.user_id === user?._id));

  return (
    <FullLayout>
      <div className="min-h-screen bg-gray-50/50">
        {/* Hero Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-6">
                <button onClick={() => navigate(-1)} className="mt-1 p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Go back">
                  <i className="fi fi-sr-arrow-small-left text-xl flex"></i>
                </button>
                {/* Avatar Placeholder */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {coachingData?.name?.charAt(0) || "I"}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {coachingData?.name || "Institute Name"}
                    </h1>
                    {isMember && (
                      <span className="px-3 py-1 bg-green/10 text-green text-xs font-medium rounded-full border border-green/20">
                        Member
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <i className="fi fi-rr-users-alt text-gray-400"></i>
                      <span>{teachers?.length || 0} Teachers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fi fi-rr-graduation-cap text-gray-400"></i>
                      <span>{students?.length || 0} Students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="fi fi-rr-document text-gray-400"></i>
                      <span>{documents?.length || 0} Resources</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {!isMember && isTeacher && (
                      <button
                        onClick={handleAddSelfAsTeacher}
                        disabled={coachingLoading}
                        className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <i className="fi fi-rr-briefcase"></i>
                        Join as Teacher
                      </button>
                    )}
                    {!isMember && isStudent && (
                      <button
                        onClick={handleAddSelfAsStudent}
                        disabled={coachingLoading}
                        className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <i className="fi fi-rr-user-add"></i>
                        Join as Student
                      </button>
                    )}
                    {isMember && (
                      <button
                        onClick={() => setShowUploadBox(!showUploadBox)}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <i className="fi fi-rr-cloud-upload"></i>
                        Upload Material
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-12 border-b border-gray-100 overflow-x-auto">
              <button
                onClick={() => setActiveTab('study_material')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'study_material'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Study Material
                {activeTab === 'study_material' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('pyq')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'pyq'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Previous Year Papers
                {activeTab === 'pyq' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'tests'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Test Questions
                {activeTab === 'tests' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'practice'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Daily Practice
                {activeTab === 'practice' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'people'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                People
                {activeTab === 'people' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Upload Box Slide Panel */}
          <UploadBox isOpen={showUploadBox} onClose={() => setShowUploadBox(false)} />

          {activeTab === 'study_material' ? (
            <div className="space-y-12">
              {documents && documents.length > 0 ? (
                Object.entries(
                  documents.filter(doc => doc?.type === 'study_material').reduce((acc, doc) => {
                    const domain = doc.domain || 'general';
                    if (!acc[domain]) acc[domain] = [];
                    acc[domain].push(doc);
                    return acc;
                  }, {} as Record<string, typeof documents>)
                ).map(([domain, domainDocs]) => (
                  <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 capitalize">{domain}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                        {domainDocs.length}
                      </span>
                      <div className="h-px bg-gray-100 flex-1 ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {domainDocs.filter((doc) => doc?.type === "study_material").map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                        >
                          {/* Document Snapshot / Preview */}
                          <div className="aspect-[3/4] w-full mb-4 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 group-hover:border-blue-50 transition-colors">
                            {doc.s3_url ? (
                              <iframe
                                src={doc.s3_url}
                                className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                                title={doc.filename}
                                loading="lazy"
                                scrolling="no"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <i className="fi fi-rr-document text-4xl"></i>
                              </div>
                            )}
                            {/* Overlay to ensure card click works */}
                            <div className="absolute inset-0 bg-transparent z-10" />

                            {/* Type Badge Overlay */}
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-600 rounded-md uppercase tracking-wider shadow-sm z-20">
                              {doc.source_type || 'PDF'}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {doc.filename}
                          </h3>

                          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                              View <i className="fi fi-rr-arrow-small-right"></i>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-2xl">
                    <i className="fi fi-rr-folder-open"></i>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No documents yet</h3>
                  <p className="text-gray-500 text-sm">Be the first to upload study material!</p>
                </div>
              )}
            </div>
          ) : activeTab === 'pyq' ? (
            <div className="space-y-12">
              {documents && documents.filter(doc => doc?.type === 'pyq_paper').length > 0 ? (
                Object.entries(
                  documents.filter(doc => doc?.type === 'pyq_paper').reduce((acc, doc) => {
                    const domain = doc.domain || 'general';
                    if (!acc[domain]) acc[domain] = [];
                    acc[domain].push(doc);
                    return acc;
                  }, {} as Record<string, typeof documents>)
                ).map(([domain, domainDocs]) => (
                  <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 capitalize">{domain}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-xs font-medium border border-purple-200">
                        {domainDocs.length}
                      </span>
                      <div className="h-px bg-gray-100 flex-1 ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {domainDocs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="group bg-white rounded-2xl p-4 border border-purple-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                        >
                          <div className="aspect-[3/4] w-full mb-4 bg-purple-50 rounded-xl overflow-hidden relative border border-purple-100 group-hover:border-purple-200 transition-colors">
                            {doc.s3_url ? (
                              <iframe
                                src={doc.s3_url}
                                className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                                title={doc.filename}
                                loading="lazy"
                                scrolling="no"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-purple-300">
                                <i className="fi fi-rr-document text-4xl"></i>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-transparent z-10" />
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-600 rounded-md uppercase tracking-wider shadow-sm z-20">
                              PYQ
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-purple-600 transition-colors truncate">
                            {doc.filename}
                          </h3>

                          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 group-hover:text-purple-500 transition-colors">
                              View <i className="fi fi-rr-arrow-small-right"></i>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fi fi-rr-calendar text-purple-400 text-2xl"></i>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No previous year papers yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Upload past exam papers for students to practice</p>
                  {isMember && (
                    <button
                      onClick={() => setShowUploadBox(true)}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <i className="fi fi-rr-cloud-upload"></i>
                      Upload Papers
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'tests' ? (
            <div className="space-y-12">
              {documents && documents.filter(doc => doc?.type === 'mocktest').length > 0 ? (
                Object.entries(
                  documents.filter(doc => doc?.type === 'mocktest').reduce((acc, doc) => {
                    const domain = doc.domain || 'General';
                    if (!acc[domain]) acc[domain] = [];
                    acc[domain].push(doc);
                    return acc;
                  }, {} as Record<string, typeof documents>)
                ).map(([domain, domainDocs]) => (
                  <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 capitalize">{domain}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium border border-orange-200">
                        {domainDocs.length}
                      </span>
                      <div className="h-px bg-gray-100 flex-1 ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {domainDocs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="group bg-white rounded-2xl p-4 border border-orange-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                        >
                          <div className="aspect-[3/4] w-full mb-4 bg-orange-50 rounded-xl overflow-hidden relative border border-orange-100 group-hover:border-orange-200 transition-colors">
                            {doc.s3_url ? (
                              <iframe
                                src={doc.s3_url}
                                className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                                title={doc.filename}
                                loading="lazy"
                                scrolling="no"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-orange-300">
                                <i className="fi fi-rr-document text-4xl"></i>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-transparent z-10" />
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-white/90 backdrop-blur-sm text-orange-600 rounded-md uppercase tracking-wider shadow-sm z-20">
                              TEST
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-orange-600 transition-colors truncate">
                            {doc.filename}
                          </h3>

                          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                              View <i className="fi fi-rr-arrow-small-right"></i>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fi fi-rr-edit text-orange-400 text-2xl"></i>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No test questions yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Upload coaching test papers and mock exams</p>
                  {isMember && (
                    <button
                      onClick={() => setShowUploadBox(true)}
                      className="px-6 py-2.5 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <i className="fi fi-rr-cloud-upload"></i>
                      Upload Tests
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'practice' ? (
            <div className="space-y-12">
              {documents && documents.filter(doc => doc?.type === 'dpp').length > 0 ? (
                Object.entries(
                  documents.filter(doc => doc?.type === 'dpp').reduce((acc, doc) => {
                    const domain = doc.domain || 'General';
                    if (!acc[domain]) acc[domain] = [];
                    acc[domain].push(doc);
                    return acc;
                  }, {} as Record<string, typeof documents>)
                ).map(([domain, domainDocs]) => (
                  <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 capitalize">{domain}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-600 text-xs font-medium border border-green-200">
                        {domainDocs.length}
                      </span>
                      <div className="h-px bg-gray-100 flex-1 ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {domainDocs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="group bg-white rounded-2xl p-4 border border-green-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                        >
                          <div className="aspect-[3/4] w-full mb-4 bg-green-50 rounded-xl overflow-hidden relative border border-green-100 group-hover:border-green-200 transition-colors">
                            {doc.s3_url ? (
                              <iframe
                                src={doc.s3_url}
                                className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                                title={doc.filename}
                                loading="lazy"
                                scrolling="no"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-green-300">
                                <i className="fi fi-rr-document text-4xl"></i>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-transparent z-10" />
                            <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-white/90 backdrop-blur-sm text-green-600 rounded-md uppercase tracking-wider shadow-sm z-20">
                              DPP
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-green-600 transition-colors truncate">
                            {doc.filename}
                          </h3>

                          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 group-hover:text-green-500 transition-colors">
                              View <i className="fi fi-rr-arrow-small-right"></i>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fi fi-rr-checkbox text-green-400 text-2xl"></i>
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No practice materials yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Upload daily practice sheets and exercises</p>
                  {isMember && (
                    <button
                      onClick={() => setShowUploadBox(true)}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <i className="fi fi-rr-cloud-upload"></i>
                      Upload Materials
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Teachers Column */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Teachers</h3>
                  <span className="bg-white px-2 py-1 rounded-md text-xs font-medium text-gray-500 border border-gray-200">
                    {teachers?.length || 0}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {teachers?.length ? (
                    (teachers as TeacherModel[]).map((t) => (
                      <div key={t.id || t.user_id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-bold">
                          {t.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">
                            {t.subjects ? `${t.subjects.length} Subjects` : 'Teacher'} • {t.documents?.length || 0} Uploads
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No teachers found</div>
                  )}
                </div>
              </div>

              {/* Students Column */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Students</h3>
                  <span className="bg-white px-2 py-1 rounded-md text-xs font-medium text-gray-500 border border-gray-200">
                    {students?.length || 0}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {students?.length ? (
                    (students as StudentModel[]).map((s) => (
                      <div key={s.id || s.user_id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-600 font-bold">
                          {s.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">
                            Student • {s.documents?.length || 0} Uploads
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No students found</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </FullLayout>
  );
};
