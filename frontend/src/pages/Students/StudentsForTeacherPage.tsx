import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { getAllStudents, type StudentModel } from "../../store/slices/studentsSlice";
import { useNavigate } from "react-router-dom";

export const StudentsForTeacherPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { all_students, loading, error } = useAppSelector((state) => state.students);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState("all");

  console.log(selectedId);

  useEffect(() => {
    if (user) {
      dispatch(getAllStudents({
        user_id: user?._id || '',
        page: 1,
        limit: 1000,
        search: searchQuery
      }));
    }
  }, [dispatch, user, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    dispatch(getAllStudents({
      user_id: user?._id || '',
      page: 1,
      limit: 1000,
      search: e.target.value
    }));
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
  };

  // Filter students by domain
  const filteredStudents = selectedDomain === "all"
    ? all_students
    : all_students.filter(s => s.subjects?.some(sub => sub.toLowerCase() === selectedDomain.toLowerCase()));

  return (
    <FullLayout>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <i className="fi fi-sr-arrow-small-left text-slate-700 group-hover:text-green2 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} enrolled
                </p>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 backdrop-blur-sm bg-opacity-80 border border-slate-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search students by name..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white"
                  />
                </div>
                <div className="relative sm:w-48">
                  <i className="fi fi-rr-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <select
                    title="Filter by subject"
                    value={selectedDomain}
                    onChange={handleDomainChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent transition-all duration-300 bg-slate-50 hover:bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Subjects</option>
                    <option value="physics">Physics</option>
                    <option value="maths">Maths</option>
                    <option value="chemistry">Chemistry</option>
                  </select>
                  <i className="fi fi-rr-angle-small-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-green2 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading students...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <i className="fi fi-rr-cross-circle text-red-500 text-2xl" />
              <div>
                <p className="text-red-800 font-semibold">Failed to load students</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            </div>
          )}

          {/* Students Grid */}
          {!loading && !error && (
            <>
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student: StudentModel, index) => (
                    <div
                      key={student.id}
                      className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 hover:border-green2/50 transform hover:-translate-y-1"
                      onClick={() => setSelectedId(student?.id)}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                            alt={student.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-green2 transition-colors truncate">
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <i className="fi fi-rr-document text-xs"></i>
                            <span>{student.documents?.length || 0} documents</span>
                          </div>
                        </div>
                      </div>

                      {/* Subject Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.subjects?.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 capitalize"
                          >
                            {subject}
                          </span>
                        ))}
                        {(student.subjects?.length || 0) > 3 && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                            +{(student.subjects?.length || 0) - 3}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 py-2.5 bg-green2 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-green-600 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teacher/chats/${user?._id}/${student?.user_id}`);
                          }}
                        >
                          <i className="fi fi-rr-comment-alt"></i>
                          Chat
                        </button>
                        <button
                          className="px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all duration-300 hover:border-green2 hover:text-green2 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/profile/${student?.user_id}`);
                          }}
                        >
                          <i className="fi fi-rr-user"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green2/20 to-blue-100 flex items-center justify-center mb-6">
                    <i className="fi fi-rr-users-alt text-green2 text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {searchQuery || selectedDomain !== "all" ? "No students found" : "No students yet"}
                  </h3>
                  <p className="text-slate-500 text-center max-w-md">
                    {searchQuery || selectedDomain !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Students will appear here once they join your class"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </FullLayout>
  );
};
