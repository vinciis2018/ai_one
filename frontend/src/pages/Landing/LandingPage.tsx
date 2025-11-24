// ============================================
// LandingPage.tsx
// Main landing page with features and query box
// ============================================

import React, { useState, useEffect } from "react";
import { FullLayout } from "../../layouts/AppLayout";
import NeuronAnimation from "../../components/NeuronAnimation";
import { FeaturesSection } from "./FeaturesSection";
import { QueryModal } from "../../components/popups/QueryModal";
import { useAppDispatch, useAppSelector } from "../../store";
import { getAllTeachers, type TeacherModel } from "../../store/slices/teachersSlice";
import { getAllStudents, type StudentModel } from "../../store/slices/studentsSlice";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { all_teachers } = useAppSelector((state) => state.teachers);
  const { all_students } = useAppSelector((state) => state.students);

  useEffect(() => {
    if (user?.student_id) {
      dispatch(getAllTeachers({
        user_id: user._id,
        page: 1,
        limit: 1000,
        search: ''
      }));
    }
    if (user?.teacher_id) {
      dispatch(getAllStudents({
        user_id: user._id,
        page: 1,
        limit: 1000,
        search: ''
      }));
    }
  }, [dispatch, user]);

  const joinedTeachers = all_teachers.filter(t => t.students?.includes(user?.student_id || ''));
  const myStudents = all_students; // Since getAllStudents already filters by user_id for teachers

  return (
    <FullLayout>
      <NeuronAnimation />
      <div className="min-h-screen w-full bg-gradient-to-br from-white to-blue-50 flex flex-col items-center">

        {/* Floating Action Button */}
        <button
          onClick={() => setIsQueryOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-green hover:bg-green2 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Assistant"
        >
          <i className="fi fi-rr-sparkles text-2xl flex items-center justify-center animate-pulse"></i>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask AI
          </span>
        </button>

        {isQueryOpen && (
          <QueryModal
            setIsQueryOpen={setIsQueryOpen}
          />
        )}

        {/* Joined Teachers Section (For Students) */}
        {user?.student_id && joinedTeachers.length > 0 && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Teachers</h2>
                <p className="text-gray-500 mt-1">Continue learning with your mentors</p>
              </div>
              <button
                onClick={() => navigate('/teachers')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                Find more teachers <i className="fi fi-rr-arrow-small-right"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedTeachers.map((teacher: TeacherModel) => (
                <div
                  key={teacher.id}
                  onClick={() => navigate(`/teacher/profile/${teacher.user_id}`)}
                  className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <i className="fi fi-rr-arrow-small-right text-xl"></i>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {teacher.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.subjects?.slice(0, 2).map((subject, idx) => (
                          <span key={idx} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                            {subject}
                          </span>
                        ))}
                        {(teacher.subjects?.length || 0) > 2 && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            +{(teacher.subjects?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fi fi-rr-users-alt"></i>
                      <span>{teacher.students?.length || 0} students</span>
                    </div>
                    <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Chat Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Students Section (For Teachers) */}
        {user?.teacher_id && myStudents.length > 0 && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Students</h2>
                <p className="text-gray-500 mt-1">Manage and guide your students</p>
              </div>
              <button
                onClick={() => navigate('/students')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                View all students <i className="fi fi-rr-arrow-small-right"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myStudents.map((student: StudentModel) => (
                <div
                  key={student.id}
                  onClick={() => navigate(`/student/profile/${student.user_id}`)}
                  className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <i className="fi fi-rr-arrow-small-right text-xl"></i>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {student.subjects?.slice(0, 2).map((subject, idx) => (
                          <span key={idx} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <i className="fi fi-rr-document"></i>
                      <span>{student.documents?.length || 0} documents</span>
                    </div>
                    <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Chat Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <FeaturesSection />

      </div>
    </FullLayout>
  );
};
