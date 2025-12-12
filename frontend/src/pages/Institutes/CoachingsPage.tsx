import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { addStudentToInstitute, addTeacherToInstitute, getAllCoachings, resetCoachingState } from "../../store/slices/coachingSlice";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";
import { getMe } from "../../store/slices/authSlice";
import { allDomains } from "../../constants/helperConstants";

export const CoachingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { coachings, loading, error, success } = useAppSelector((state) => state.coachings);
  const [showSubjectPopup, setShowSubjectPopup] = useState(false);
  const [selectedCoachingId, setSelectedCoachingId] = useState<string | null>(null);
  const [isJoiningAsTeacher, setIsJoiningAsTeacher] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState("all");

  const availableSubjects = [
    "maths", "physics", "chemistry", "biology",
  ];
  useEffect(() => {
    dispatch(getAllCoachings());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(resetCoachingState());
      dispatch(getMe());
    }
  }, [success, dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomainFilter(e.target.value);
  };

  // New: add current user as teacher
  const handleAddSelfAsTeacher = async (coachingId: string) => {
    if (!user) return;
    const payload = {
      user_id: String((user as User)._id ?? ""),
      name: (user as User).full_name || "Unknown",
      email: (user as User).email || "Unknown",
      avatar: (user as User).avatar || "",
      subjects: selectedSubjects,
    };
    await dispatch(addTeacherToInstitute({ coaching_id: coachingId as string, teacher: payload }));
    dispatch(getAllCoachings());
  };

  // New: add current user as student
  const handleAddSelfAsStudent = async (coachingId: string) => {
    if (!user) return;
    const payload = {
      user_id: String((user as User)._id ?? ""),
      name: (user as User).full_name || "Unknown",
      email: (user as User).email || "Unknown",
      avatar: (user as User).avatar || "",
      subjects: selectedSubjects,
    };
    await dispatch(addStudentToInstitute({ coaching_id: coachingId as string, student: payload }));
    dispatch(getAllCoachings());
  };


  const SubjectSelectionPopup = () => (
    <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black border border-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
          Select Subjects <span className="text-logoBlue">({selectedSubjects.length})</span>
        </h3>
        <div className="overflow-y-auto grid grid-cols-2 gap-4 mb-6">
          {availableSubjects.map((subject, index) => (
            <div
              key={index}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group
                ${selectedSubjects.includes(subject)
                  ? "border-logoBlue bg-logoBlue"
                  : "border-slate-100 dark:border-gray-800 hover:border-logoBlue hover:shadow-md"
                }
              `}
              onClick={() => {
                if (!selectedSubjects.includes(subject)) {
                  setSelectedSubjects([...selectedSubjects, subject]);
                } else {
                  setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                }
              }}
            >
              <h3 className={`text-lg font-bold capitalize mb-1 ${selectedSubjects.includes(subject) ? 'text-logoBlue' : 'text-slate-700 dark:text-slate-300'}`}>
                {subject}
              </h3>
              <div className={`absolute bottom-2 right-2 text-4xl opacity-10 transition-opacity group-hover:opacity-20 ${selectedSubjects.includes(subject) ? 'text-logoBlue' : 'text-slate-400'}`}>
                <i className={`fi ${allDomains?.find((domain) => domain.value === subject)?.icon} flex items-center justify-center`}></i>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
          <button
            onClick={() => {
              setShowSubjectPopup(false);
              setSelectedSubjects([]);
            }}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setShowSubjectPopup(false);
              if (selectedCoachingId) {
                if (isJoiningAsTeacher) {
                  await handleAddSelfAsTeacher(selectedCoachingId);
                } else {
                  await handleAddSelfAsStudent(selectedCoachingId);
                }
              }
              setSelectedSubjects([]);
            }}
            disabled={selectedSubjects.length === 0}
            className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg shadow-logoBlue
              ${selectedSubjects.length === 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-logoBlue to-logoViolet hover:-translate-y-0.5'
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <FullLayout>
      <div className="min-h-screen max-w-5xl mx-auto px-4 py-8">

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
                  Coachings
                </h1>
                <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {Array.isArray(coachings) ? coachings.length : 0} {Array.isArray(coachings) && coachings.length === 1 ? 'institute' : 'institutes'} available
                </p>
              </div>
            </div>

            {/* Create Action (Teacher Only) */}
            {user?.role === "teacher" && (
              <button
                title="Create Coaching"
                type="button"
                onClick={() => {}}
                className="group flex items-center gap-3 px-6 py-2 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-logoBlue to-logoViolet text-white shadow-lg shadow-logoBlue hover:shadow-xl hover:shadow-logoBlue hover:scale-105"
              >
                <i className="fi fi-rr-plus flex items-center justify-center group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Coaching</span>
              </button>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl pb-2">
            <div className="flex flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search coachings..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="text-sm w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="relative flex">
                <select
                  title="select domain"
                  value={selectedDomainFilter}
                  onChange={handleDomainChange}
                  className="text-sm w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-600 dark:text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="all">All</option>
                  {user?.subjects?.map((subject: string) => (
                    <option key={subject} value={subject}>
                      {subject.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-logoBlue border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Loading coachings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <i className="fi fi-rr-cross-circle text-red-500 text-xl" />
            </div>
            <div>
              <p className="text-red-800 dark:text-red-200 font-semibold">Failed to load coachings</p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">Please try again later</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            {Array.isArray(coachings) && coachings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coachings.map((coaching, index) => (
                  <div
                    key={coaching._id}
                    className="group bg-white dark:bg-black backdrop-blur-xl rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white hover:border-logoBlue dark:hover:border-logoBlue transform hover:-translate-y-1 block"
                    onDoubleClick={() => navigate(`/coachings/${coaching._id}`)}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative p-1 rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 w-14 h-14 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-gray-700">
                          <i className="fi fi-rr-building flex items-center justify-center text-2xl text-slate-400 transition-colors" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-logoBlue transition-colors">
                          {coaching.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <i className="fi fi-rr-chalkboard-user flex items-center justify-center text-slate-400 transition-colors"></i>
                            {coaching.teachers?.length || 0} teachers
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fi fi-rr-users-alt flex items-center justify-center text-slate-400 transition-colors"></i>
                            {coaching.students?.length || 0} students
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subject Tags */}
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[2rem]">
                      {coaching.subjects?.slice(0, 3).map((subject: string, idx: number) => (
                        <span
                          key={idx}
                          className={`
                            px-2.5 py-1 text-xs font-semibold uppercase tracking-wide rounded-lg 
                            bg-gradient-to-br from-logoSky to-logoPurple text-white
                          `}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-gray-800">
                      <button
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
                          ${(user?.role === "student" && !coaching.students.includes(user?.student_id)) || (user?.role === "teacher" && !coaching.teachers.includes(user?.teacher_id))
                            ? 'bg-gradient-to-r from-logoBlue to-logoViolet text-white hover:shadow-lg hover:shadow-logoBlue hover:-translate-y-0.5'
                            : 'bg-slate-50 text-slate-600 hover:bg-logoBlue hover:text-white'
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if ((user?.role === "student" && !coaching.students.includes(user?.student_id)) || (user?.role === "teacher" && !coaching.teachers.includes(user?.teacher_id))) {
                            setSelectedCoachingId(coaching._id);
                            setIsJoiningAsTeacher(user?.role === "teacher");
                            setShowSubjectPopup(true);
                          } else {
                            navigate(`/coachings/${coaching._id}`);
                          }
                        }}
                      >
                        {(user?.role === "student" && !coaching.students.includes(user?.student_id)) || (user?.role === "teacher" && !coaching.teachers.includes(user?.teacher_id)) ? (
                          <>
                            <i className="fi fi-rr-sign-in-alt flex items-center justify-center"></i>
                            Join Institute
                          </>
                        ) : (
                          <>
                            <i className="fi fi-rr-eye flex items-center justify-center"></i>
                            View Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white border border-slate-100 dark:border-white flex items-center justify-center mb-6">
                  <i className="fi fi-rr-building text-slate-300 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {searchQuery || selectedDomainFilter !== "all" ? "No coachings found" : "No coachings available"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 font-medium">
                  {searchQuery || selectedDomainFilter !== "all"
                    ? "We couldn't find any institutes matching your filters."
                    : "Check back later for new institutes."}
                </p>
                {(searchQuery || selectedDomainFilter !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedDomainFilter('all') }}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:shadow-md transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {showSubjectPopup && <SubjectSelectionPopup />}
      </div>
    </FullLayout>
  );
};
