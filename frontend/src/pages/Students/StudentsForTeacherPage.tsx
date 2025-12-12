
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { getAllStudents, type StudentModel } from "../../store/slices/studentsSlice";
import { useNavigate } from "react-router-dom";
import { LoadingComponent } from "../../components/molecules/LoadingComponent";

export const StudentsForTeacherPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { all_students, loading, error } = useAppSelector((state) => state.students);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState("all");

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
      {({setIsChatOpen}) => (
        <div className="min-h-screen">
          <div className="max-w-5xl mx-auto px-4 py-8">

            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center lg:gap-4 gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <i className="fi fi-rr-arrow-small-left text-slate-700 dark:text-gray-600 group-hover:text-logoBlue transition-colors" />
                  </button>
                  <div>
                    <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">
                      My Students
                    </h1>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} enrolled
                    </p>
                  </div>
                </div>

                {/* Stats (Optional - kept small to fit layout) */}
                <div className="hidden sm:flex gap-3">
                  <div className="px-4 py-2 rounded-xl bg-logoBlue/5 border border-logoBlue/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-logoBlue animate-pulse"></span>
                    <p className="text-xs font-bold text-logoBlue uppercase tracking-wide">
                      Total: {all_students.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl pb-2">
                <div className="flex flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search students by name..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="text-sm w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative flex">
                    <select
                      value={selectedDomain}
                      onChange={handleDomainChange}
                      className="text-sm w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-600 dark:text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="all">All Subjects</option>
                      <option value="physics">Physics</option>
                      <option value="maths">Maths</option>
                      <option value="chemistry">Chemistry</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <LoadingComponent size="sm" message="Loading class roster..." />
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                  <i className="fi fi-rr-cross-circle text-red-500 text-xl" />
                </div>
                <div>
                  <p className="text-red-800 dark:text-red-200 font-semibold">Failed to load students</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
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
                        className="group bg-white dark:bg-black backdrop-blur-xl rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white hover:border-logoBlue dark:hover:border-logoBlue transform hover:-translate-y-1"
                        onClick={() => {}}
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative p-1 rounded-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <img
                              src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff&bold=true`}
                              alt={student.name}
                              className="relative z-10 w-12 h-12 bg-white rounded-full object-cover border border-slate-100 dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full z-20"></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-logoBlue transition-colors">
                              {student.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <i className="fi fi-rr-document text-[10px]"></i>
                              <span>{student.documents?.length || 0} Resources</span>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          {student.subjects?.slice(0, 3).map((subject, idx) => (
                            <span
                              key={idx}
                              className={`
                                px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded-lg 
                                bg-gradient-to-br from-logoSky to-logoPurple text-white
                              `}
                            >
                              {subject}
                            </span>
                          ))}
                          {(student.subjects?.length || 0) > 3 && (
                            <span className="px-2 py-1 text-sm font-semibold rounded-lg bg-slate-100 text-slate-500">
                              +{student.subjects!.length - 3}
                            </span>
                          )}
                          {(!student.subjects || student.subjects.length === 0) && (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
                              No Subjects
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-slate-50 dark:border-gray-800">
                          <button
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 
                              ${true
                                ? 'bg-gradient-to-r from-logoBlue to-logoViolet text-white hover:shadow-lg hover:shadow-logoBlue/20 hover:-translate-y-0.5'
                                : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-logoBlue hover:text-logoBlue'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsChatOpen(true);
                            }}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <i className="fi fi-rr-comment-alt flex items-center justify-center"></i>
                              Chat Now
                            </span>
                          </button>

                          <button
                            className="px-4 py-2 bg-slate-50 dark:bg-white text-slate-600 dark:text-slate-900 rounded-xl font-bold transition-all duration-300 hover:bg-logoBlue hover:text-white flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/student/profile/${student?.user_id}`);
                            }}
                          >
                            <i className="fi fi-rr-user flex items-center justify-center"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Empty State
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white border border-slate-100 dark:border-white flex items-center justify-center mb-6">
                      <i className="fi fi-rr-users-alt text-slate-300 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {searchQuery || selectedDomain !== "all" ? "No students found" : "Your classroom is empty"}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 font-medium">
                      {searchQuery || selectedDomain !== "all"
                        ? "We couldn't find any students matching your filters."
                        : "Once students join your class, they will appear here."}
                    </p>

                    {(searchQuery || selectedDomain !== "all") && (
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedDomain('all') }}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:shadow-md transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
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
