// ============================================
// LandingPage.tsx
// Role-based landing page for teachers and students
// ============================================

import React, { useState, useEffect } from "react";
import { FullLayout } from "../../layouts/AppLayout";
import NeuronAnimation from "../../components/NeuronAnimation";
import { QueryModal } from "../../components/popups/QueryModal";
import { useAppDispatch, useAppSelector } from "../../store";
import { getAllTeachers, getTeacherLandingPageAnalytics, type TeacherModel } from "../../store/slices/teachersSlice";
import { getAllStudents, getStudentLandingPageAnalytics, type StudentModel } from "../../store/slices/studentsSlice";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { all_teachers, teacher_landing_page_analytics } = useAppSelector((state) => state.teachers);
  const { all_students, student_landing_page_analytics } = useAppSelector((state) => state.students);

  useEffect(() => {
    if (user?.student_id) {
      dispatch(getAllTeachers({
        user_id: user._id,
        page: 1,
        limit: 1000,
        search: ''
      }));
      dispatch(getStudentLandingPageAnalytics(user._id as string));
    }
    if (user?.teacher_id) {
      dispatch(getAllStudents({
        user_id: user._id,
        page: 1,
        limit: 1000,
        search: ''
      }));
      dispatch(getTeacherLandingPageAnalytics(user._id as string));
    }
  }, [dispatch, user]);

  const joinedTeachers = all_teachers.filter(t => t.students?.includes(user?.student_id || ''));
  const myStudents = all_students;
  const isTeacher = !!user?.teacher_id;
  const isStudent = !!user?.student_id;

  // Quick Actions for Teachers
  const teacherActions = [
    { icon: "fi-rr-upload", label: "Upload Notes", action: () => navigate('/notes'), color: "from-blue-500 to-blue-600" },
    { icon: "fi-rr-edit", label: "Create Quiz", action: () => {alert("Coming soon...\nStay tuned!!!")}, color: "from-purple-500 to-purple-600" },
    { icon: "fi-rr-chart-histogram", label: "View Analytics", action: () => {alert("Coming soon...\nStay tuned!!!")}, color: "from-green-500 to-green-600" },
    { icon: "fi-rr-users-alt", label: "My Students", action: () => navigate('/students'), color: "from-orange-500 to-orange-600" },
  ];

  // Quick Actions for Students
  const studentActions = [
    { icon: "fi-rr-sparkles", label: "Ask AI", action: () => {alert("Coming soon...\nStay tuned!!!")}, color: "from-green-500 to-green-600" },
    { icon: "fi-rr-document", label: "My Notes", action: () => navigate('/notes'), color: "from-blue-500 to-blue-600" },
    { icon: "fi-rr-graduation-cap", label: "Find Teachers", action: () => navigate('/teachers'), color: "from-purple-500 to-purple-600" },
    { icon: "fi-rr-quiz-alt", label: "Take Quiz", action: () => {alert("Coming soon...\nStay tuned!!!")}, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <FullLayout>
      <NeuronAnimation />
      <div className="min-h-screen w-full bg-white">

        {/* Floating Action Button */}
        <button
          onClick={() => setIsQueryOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-green2 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Assistant"
        >
          <i className="fi fi-rr-sparkles text-2xl flex items-center justify-center"></i>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask AI
          </span>
        </button>

        {isQueryOpen && (
          <QueryModal setIsQueryOpen={setIsQueryOpen} />
        )}

        {/* TEACHER VIEW */}
        {isTeacher && (
          <>
            {/* Teacher Hero Section */}
            <div className="w-full bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                      Welcome back, <span className="text-green2">{user?.firstName}</span>!
                    </h1>
                    <p className="text-lg text-slate-600">
                      Your AI Twin is ready to help your students 24/7
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-3 bg-green2 hover:bg-green-600 text-white rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="fi fi-rr-microchip-ai"></i>
                    <span>Manage AI Twin</span>
                  </button>
                </div>

                {/* Teacher Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <i className="fi fi-rr-users-alt text-blue-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{teacher_landing_page_analytics?.total_students}</p>
                        <p className="text-sm text-slate-500">Students</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <i className="fi fi-rr-document text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{teacher_landing_page_analytics?.total_documents}</p>
                        <p className="text-sm text-slate-500">Documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                        <i className="fi fi-rr-comment-alt text-purple-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{teacher_landing_page_analytics?.total_chats}</p>
                        <p className="text-sm text-slate-500">Chats</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                        <i className="fi fi-rr-sparkles text-orange-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{teacher_landing_page_analytics?.total_conversations}</p>
                        <p className="text-sm text-slate-500">AI Response</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teacherActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-green2/50 shadow-sm hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <i className={`fi ${action.icon} text-white text-xl`}></i>
                    </div>
                    <p className="font-semibold text-slate-900 group-hover:text-green2 transition-colors">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Students Section */}
            {myStudents.length > 0 && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Students</h2>
                    <p className="text-slate-500 mt-1">Manage and guide your students</p>
                  </div>
                  <button
                    onClick={() => navigate('/students')}
                    className="text-sm font-medium text-green2 hover:text-green-600 flex items-center gap-1 transition-colors"
                  >
                    View all <i className="fi fi-rr-arrow-small-right"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myStudents.slice(0, 6).map((student: StudentModel) => (
                    <div
                      key={student.id}
                      onClick={() => navigate(`/student/profile/${student.user_id}`)}
                      className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green2/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                            alt={student.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-green2 transition-colors truncate">
                            {student.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.subjects?.slice(0, 2).map((subject, idx) => (
                              <span key={idx} className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <i className="fi fi-rr-document text-xs"></i>
                          <span>{student.documents?.length || 0} docs</span>
                        </div>
                        <button className="px-4 py-1.5 bg-green2 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* STUDENT VIEW */}
        {isStudent && (
          <>
            {/* Student Hero Section */}
            <div className="w-full bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                      Hey <span className="text-green2">{user?.firstName}</span>, ready to learn?
                    </h1>
                    <p className="text-lg text-slate-600">
                      Your AI tutors are here to help you succeed
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQueryOpen(true)}
                    className="px-6 py-3 bg-green2 hover:bg-green-600 text-white rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="fi fi-rr-sparkles"></i>
                    <span>Ask AI Now</span>
                  </button>
                </div>

                {/* Student Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <i className="fi fi-rr-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{student_landing_page_analytics?.total_teachers}</p>
                        <p className="text-sm text-slate-500">Teachers</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <i className="fi fi-rr-document text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{student_landing_page_analytics?.total_documents}</p>
                        <p className="text-sm text-slate-500">Documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                        <i className="fi fi-rr-quiz-alt text-purple-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{student_landing_page_analytics?.total_quizzes}</p>
                        <p className="text-sm text-slate-500">Quizzes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                        <i className="fi fi-rr-flame text-orange-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{student_landing_page_analytics?.total_chats}</p>
                        <p className="text-sm text-slate-500">Chats</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {studentActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-green2/50 shadow-sm hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <i className={`fi ${action.icon} text-white text-xl`}></i>
                    </div>
                    <p className="font-semibold text-slate-900 group-hover:text-green2 transition-colors">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Teachers Section */}
            {joinedTeachers.length > 0 && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Teachers</h2>
                    <p className="text-slate-500 mt-1">Continue learning with your mentors</p>
                  </div>
                  <button
                    onClick={() => navigate('/teachers')}
                    className="text-sm font-medium text-green2 hover:text-green-600 flex items-center gap-1 transition-colors"
                  >
                    Find more <i className="fi fi-rr-arrow-small-right"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedTeachers.slice(0, 6).map((teacher: TeacherModel) => (
                    <div
                      key={teacher.id}
                      onClick={() => navigate(`/teacher/profile/${teacher.user_id}`)}
                      className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green2/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`}
                            alt={teacher.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-green2 transition-colors truncate">
                            {teacher.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {teacher.subjects?.slice(0, 2).map((subject, idx) => (
                              <span key={idx} className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                                {subject}
                              </span>
                            ))}
                            {(teacher.subjects?.length || 0) > 2 && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                +{(teacher.subjects?.length || 0) - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <i className="fi fi-rr-users-alt text-xs"></i>
                          <span>{teacher.students?.length || 0} students</span>
                        </div>
                        <button className="px-4 py-1.5 bg-green2 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </FullLayout>
  );
};
