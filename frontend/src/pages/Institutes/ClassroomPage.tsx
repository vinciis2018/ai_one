import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { CreateClassroomModal } from "./CreateClassroomModal";
import { getAllClassrooms } from "../../store/slices/coachingSlice";

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
      <div className="bg-white max-w-4xl mx-auto py-2 px-4">
        <div className="rounded-lg overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
              <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
              <h1 className="text-sm font-semibold">
                Classrooms
              </h1>
            </div>
            {user?.role === "teacher" && (
              <button
                title="create classroom"
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 bg-baigeLight hover:bg-gray-200"
              >
                <i className="fi fi-br-add flex items-center justify-center text-violet" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 py-2">
            <input
              type="text"
              placeholder="Search classrooms..."
              value={searchQuery}
              onChange={handleSearch}
              className="col-span-2 text-sm px-4 py-2 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            />
            <select
              title="select subject"
              value={selectedFilter}
              onChange={handleFilterChange}
              className="col-span-1 px-4 py-2 mx-2 text-sm rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            >
              <option value="all">All</option>
              <option value="physics">Physics</option>
              <option value="maths">Maths</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <i className="fi fi-sr-spinner animate-spin text-2xl text-blue-600" />
              <span className="ml-2 text-gray-600">Loading classrooms...</span>
            </div>
          )}

          {!loading && (
            <div className="py-2">
              <h2 className="text-xs">found {filteredClassrooms.length} classrooms</h2>
              <div className="py-4 space-y-2">
                {filteredClassrooms.map((classroom) => (
                  <div
                    key={classroom._id}
                    className="border border-gray-100 bg-baigeLight rounded-xl p-4 hover:shadow cursor-pointer flex items-center justify-between"
                    onDoubleClick={() => navigate(`/classrooms/${classroom._id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <i className="fi fi-sr-chalkboard-user text-2xl text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{classroom.name}</p>
                        <p className="text-xs text-gray-400">{classroom.description}</p>
                        {classroom.teacher_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Teacher: {classroom.teacher_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {classroom.student_ids?.length || 0} student{classroom.student_ids?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs hover:bg-green hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/classrooms/${classroom.classroom_id}`);
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
                {filteredClassrooms.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <i className="fi fi-sr-search text-4xl mb-2" />
                    <p>No classrooms found</p>
                  </div>
                )}
              </div>
            </div>
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
    </FullLayout>
  );
};
