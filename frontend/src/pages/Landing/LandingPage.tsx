// ============================================
// LandingPage.tsx
// Role-based landing page for teachers and students
// ============================================

import { useEffect } from "react";
import { FullLayout } from "../../layouts/AppLayout";
import { useAppDispatch, useAppSelector } from "../../store";
import { getAllTeachers, getTeacherLandingPageAnalytics, type TeacherModel } from "../../store/slices/teachersSlice";
import { getAllStudents, getStudentLandingPageAnalytics, type StudentModel } from "../../store/slices/studentsSlice";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
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
    { icon: "fi-rr-upload", label: "Upload Notes", action: () => navigate('/documents'), color: "from-logoBlue to-logoSky" },
    { icon: "fi-rr-edit", label: "Create Quiz", action: () => { alert("Coming soon...\nStay tuned!!!") }, color: "from-logoSky to-logoPink" },
    { icon: "fi-rr-chart-histogram", label: "View Analytics", action: () => { alert("Coming soon...\nStay tuned!!!") }, color: "from-logoPink to-logoPurple" },
    { icon: "fi-rr-users-alt", label: "My Students", action: () => navigate('/students'), color: "from-logoPurple to-logoViolet" },
  ];

  // Quick Actions for Students
  const studentActions = [
    { icon: "fi-rr-document", label: "My Notes", action: () => navigate('/documents'), color: "from-logoBlue to-logoSky" },
    { icon: "fi-rr-messages", label: "My Chats", action: () => navigate('/teachers'), color: "from-logoSky to-logoPink" },
    { icon: "fi-rr-lesson", label: "My Classes", action: () => { alert("Coming soon...\nStay tuned!!!") }, color: "from-logoPink to-logoPurple" },
    { icon: "fi-rr-quiz-alt", label: "Take Quiz", action: () => { alert("Coming soon...\nStay tuned!!!") }, color: "from-logoPurple to-logoViolet" },
  ];

  return (
    <FullLayout>
      {({ setIsChatOpen }) => (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5">
          <div className="relative z-10 space-y-8 pb-12">
            {/* TEACHER VIEW */}
            {isTeacher && (
              <>
                {/* Teacher Hero Section */}
                <div className="w-full">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-xl rounded-3xl p-8 md:p-12 transform transition-all hover:scale-[1.002] duration-500">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">{user?.firstName}</span>! 👋
                          </h1>
                          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-300">
                            Your AI Twin is ready to assist your students with efficiency and joy.
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/profile')}
                          className="px-8 py-4 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-logoBlue/25 hover:scale-105 transition-all duration-300 flex items-center gap-3 backdrop-blur-md"
                        >
                          <i className="fi fi-rr-microchip-ai flex items-center justify-center animate-pulse"></i>
                          <span>Manage AI Twin</span>
                        </button>
                      </div>

                      {/* Teacher Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        {[
                          { icon: "fi-rr-users-alt", count: teacher_landing_page_analytics?.total_students, label: "Students", color: "text-white", bg: "bg-logoBlue dark:bg-logoBlue" },
                          { icon: "fi-rr-document", count: teacher_landing_page_analytics?.total_documents, label: "Documents", color: "text-white", bg: "bg-logoSky dark:bg-logoSky" },
                          { icon: "fi-rr-comment-alt", count: teacher_landing_page_analytics?.total_chats, label: "Chats", color: "text-white", bg: "bg-logoPurple dark:bg-logoPurple" },
                          { icon: "fi-rr-sparkles", count: teacher_landing_page_analytics?.total_conversations, label: "Responses", color: "text-white", bg: "bg-logoViolet dark:bg-logoViolet" }
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-white dark:bg-white backdrop-blur-md rounded-2xl p-2 md:p-6 border border-white dark:border-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner`}>
                                <i className={`fi ${stat.icon} ${stat.color} flex items-center justify-center text-2xl`}></i>
                              </div>
                              <div>
                                <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.count}</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:block">{stat.label}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <i className="fi fi-rr-rocket-lunch flex items-center justify-center text-logoViolet"></i> Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {teacherActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={action.action}
                        className="group bg-white dark:bg-black backdrop-blur-md rounded-3xl p-6 border border-white hover:border-logoBlue shadow-lg hover:shadow-xl hover:shadow-logoBlue transition-all duration-300 text-left hover:-translate-y-1 relative overflow-hidden"
                      >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:rotate-3`}>
                          <i className={`fi ${action.icon} flex items-center justify-center text-white text-2xl`}></i>
                        </div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-logoBlue transition-colors relative z-10">{action.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Students Section */}
                {myStudents.length > 0 && (
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Students</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and guide your students</p>
                      </div>
                      <button
                        onClick={() => navigate('/students')}
                        className="text-sm font-bold text-logoBlue hover:text-logoViolet flex items-center gap-1 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
                      >
                        View all <i className="fi fi-rr-arrow-small-right"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myStudents.slice(0, 6).map((student: StudentModel) => (
                        <div
                          key={student.id}
                          onClick={() => navigate(`/student/profile/${student.user_id}`)}
                          className="group bg-white dark:bg-black border border-white dark:border-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-logoBlue hover:border-logoBlue transition-all duration-300 cursor-pointer backdrop-blur-md"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

                              <img
                                src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                                alt={student.name}
                                className="relative w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-logoBlue transition-colors truncate">
                                {student.name}
                              </h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {student.subjects?.slice(0, 2).map((subject, idx) => (
                                  <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <i className="fi fi-rr-document flex items-center justify-center text-xs"></i>
                              <span>{student.documents?.length || 0} docs</span>
                            </div>
                            <button className="px-5 py-2 bg-gradient-to-r from-logoBlue to-logoViolet text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-logoBlue hover:text-white">
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
                <div className="w-full">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-xl rounded-3xl p-8 md:p-12 transform transition-all hover:scale-[1.002] duration-500">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                            Hey <span className="bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">{user?.firstName}</span>, ready to learn? 🚀
                          </h1>
                          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-300">
                            Your team of AI tutors is waiting to help you ace your goals!
                          </p>
                        </div>
                        <button
                          onClick={() => setIsChatOpen(true)}
                          className="px-8 py-4 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-logoBlue/25 hover:scale-105 transition-all duration-300 flex items-center gap-3 backdrop-blur-md"
                        >
                          <i className="fi fi-rr-sparkles flex items-center justify-center animate-pulse"></i>
                          <span>Ask AI Now</span>
                        </button>

                      </div>

                      {/* Student Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        {[
                          { icon: "fi-rr-graduation-cap", count: student_landing_page_analytics?.total_teachers, label: "Teachers", color: "text-white", bg: "bg-logoBlue dark:bg-logoBlue" },
                          { icon: "fi-rr-document", count: student_landing_page_analytics?.total_documents, label: "Documents", color: "text-white", bg: "bg-logoSky dark:bg-logoSky" },
                          { icon: "fi-rr-quiz-alt", count: student_landing_page_analytics?.total_quizzes, label: "Quizzes", color: "text-white", bg: "bg-logoPurple dark:bg-logoPurple" },
                          { icon: "fi-rr-flame", count: student_landing_page_analytics?.total_chats, label: "Chats", color: "text-white", bg: "bg-logoViolet dark:bg-logoViolet" }
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-white dark:bg-white backdrop-blur-md rounded-2xl p-2 md:p-6 border border-white dark:border-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner`}>
                                <i className={`fi ${stat.icon} ${stat.color} flex items-center justify-center text-2xl`}></i>
                              </div>
                              <div>
                                <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.count}</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:block">{stat.label}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <i className="fi fi-rr-rocket-lunch flex items-center text-logoViolet"></i> Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {studentActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={action.action}
                        className="group bg-white dark:bg-black backdrop-blur-md rounded-3xl p-6 border border-white hover:border-logoBlue shadow-lg hover:shadow-xl hover:shadow-logoBlue transition-all duration-300 text-left hover:-translate-y-1 relative overflow-hidden"
                      >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:rotate-3`}>
                          <i className={`fi ${action.icon} flex items-center justify-center text-white text-2xl`}></i>
                        </div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-logoBlue transition-colors relative z-10">{action.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teachers Section */}
                {joinedTeachers.length > 0 && (
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Teachers</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Continue learning with your mentors</p>
                      </div>
                      <button
                        onClick={() => navigate('/teachers')}
                        className="text-sm font-bold text-logoBlue hover:text-logoViolet flex items-center gap-1 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
                      >
                        Find more <i className="fi fi-rr-arrow-small-right"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {joinedTeachers.slice(0, 6).map((teacher: TeacherModel) => (
                        <div
                          key={teacher.id}
                          onClick={() => navigate(`/teacher/profile/${teacher.user_id}`)}
                          className="group bg-white dark:bg-black border border-white dark:border-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:shadow-logoBlue hover:border-logoBlue transition-all duration-300 cursor-pointer backdrop-blur-md"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                              <img
                                src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`}
                                alt={teacher.name}
                                className="relative w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-logoBlue transition-colors truncate">
                                {teacher.name}
                              </h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {teacher.subjects?.slice(0, 2).map((subject, idx) => (
                                  <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                                    {subject}
                                  </span>
                                ))}
                                {(teacher.subjects?.length || 0) > 2 && (
                                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    +{(teacher.subjects?.length || 0) - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <i className="fi fi-rr-users-alt flex items-center justify-center text-xs"></i>
                              <span>{teacher.students?.length || 0} students</span>
                            </div>
                            <button className="px-5 py-2 bg-gradient-to-r from-logoBlue to-logoViolet text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-logoBlue hover:text-white">
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
        </div>
      )}
    </FullLayout>
  );
};
