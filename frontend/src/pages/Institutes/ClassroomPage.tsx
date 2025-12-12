import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { CreateClassroomModal } from "./CreateClassroomModal";
import { getAllClassrooms } from "../../store/slices/coachingSlice";
import { LoadingComponent } from "../../components/molecules/LoadingComponent";

export const ClassroomPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { classrooms, loading } = useAppSelector((state) => state.coachings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch classrooms on component mount
  useEffect(() => {
    if (user?._id) {
      dispatch(getAllClassrooms([user._id]));
    }
  }, [dispatch, user?._id]);

  const fetchClassrooms = () => {
    if (user?._id) {
      dispatch(getAllClassrooms([user._id]));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
  };

  // Filter classrooms based on search
  const filteredClassrooms = Array.isArray(classrooms) ? classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  return (
    <FullLayout>
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
                    Classrooms
                  </h1>
                  <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {filteredClassrooms.length} {filteredClassrooms.length === 1 ? 'classroom' : 'classrooms'} found
                  </p>
                </div>
              </div>

              {/* Create/Add Button */}
              {user?.role === "teacher" && (
                <button
                title="Create Classroom"
                type="button"
                onClick={() => setShowCreateModal(true)}

                className="group flex items-center gap-3 px-6 py-2 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-logoBlue to-logoViolet text-white shadow-lg shadow-logoBlue hover:shadow-xl hover:shadow-logoBlue hover:scale-105"
              >
                <i className="fi fi-rr-plus flex items-center justify-center group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Classroom</span>
              </button>
              )}
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-sm rounded-2xl pb-2">
              <div className="flex flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search classrooms..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="text-sm w-full px-4 py-2 rounded-xl border border-slate-100 dark:border-white focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all duration-300 bg-slate-50 dark:bg-white font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="relative flex">
                  <select
                    title="select subject"
                    value={selectedFilter}
                    onChange={handleFilterChange}
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
            <LoadingComponent size="sm" message="Loading classrooms..." />
          )}

          {/* Grid */}
          {!loading && (
            <>
              {filteredClassrooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClassrooms.map((classroom, index) => (
                    <div
                      key={classroom._id}
                      className="group bg-white dark:bg-black backdrop-blur-xl rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white hover:border-logoBlue dark:hover:border-logoBlue transform hover:-translate-y-1 block"
                      onDoubleClick={() => navigate(`/classrooms/${classroom._id}`)}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative p-1 rounded-2xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-logoSky to-logoPurple rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative z-10 w-14 h-14 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-gray-700">
                            <i className="fi fi-rr-chalkboard-user flex items-center justify-center text-2xl text-slate-400 transition-colors" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-logoBlue transition-colors">
                            {classroom.name}
                          </h3>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {classroom.description}
                          </div>
                          {classroom.teacher_name && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                              <i className="fi fi-rr-user text-[10px] flex items-center justify-center"></i>
                              <span>{classroom.teacher_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <i className="fi fi-rr-users-alt flex items-center justify-center"></i>
                          <span>{classroom.student_ids?.length || 0} Students</span>
                        </div>
                        <button
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 group-hover:bg-logoBlue group-hover:text-white transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/classrooms/${classroom.classroom_id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white border border-slate-100 dark:border-white flex items-center justify-center mb-6">
                    <i className="fi fi-rr-search text-slate-300 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {searchQuery || selectedFilter !== "all" ? "No classrooms found" : "No classrooms available"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 font-medium">
                    {searchQuery || selectedFilter !== "all"
                      ? "Try adjusting your search filters."
                      : "Create a new classroom to get started."}
                  </p>
                  {(searchQuery || selectedFilter !== "all") && (
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedFilter('all') }}
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

      {/* Create Classroom Modal */}
      <CreateClassroomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchClassrooms();
        }}
      />

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
