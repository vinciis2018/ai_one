import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { getAllStudents, type StudentModel } from "../../store/slices/studentsSlice";
import { useNavigate } from "react-router-dom";

export const StudentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {user} = useAppSelector((state) => state.auth);
  const { all_students, loading, error } = useAppSelector((state) => state.students);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState("all");
console.log(selectedId)
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

  return (
    <FullLayout>
      <div className="bg-white max-w-4xl mx-auto py-2 px-4">
        <div className="w-full rounded-lg overflow-hidden">
          <div className="max-w-4xl mx-auto py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
            <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
            <h1 className="w-full text-sm font-semibold">
              Students
            </h1>
          </div>
          {loading && <p>Loading students...</p>}
          {error && <p className="text-red-500">Failed to load students.</p>}
          <div className="grid grid-cols-3 gap-2 py-2">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearch}
              className="col-span-2 text-sm px-4 py-2 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            />
            <select
              title="select domain"
              value={selectedDomain}
              onChange={handleDomainChange}
              className="col-span-1 px-4 py-2 mx-2 text-sm rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            >
              <option value="all">All</option>
              <option value="physics">Physics</option>
              <option value="maths">Maths</option>
              <option value="chemistry">Chemistry</option>
            </select>
          </div>

          <div className="py-2 w-full">
            <h2 className="text-xs">found {all_students.length} students</h2>
            <div className="py-4 space-y-2">
              {Array.isArray(all_students) ? all_students.map((student: StudentModel) => (
                <div
                  key={student.id}
                  className="border border-gray-100 bg-baigeLight rounded-xl p-4 hover:shadow cursor-pointer flex items-center justify-between"
                  onClick={() => setSelectedId(student?.id)}
                >
                  <div className="flex items-center gap-2">
                    <img src={student.avatar} alt={student.name} className="h-12 w-12 rounded-full" />
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{student.subjects?.join(", ")}</p>
                      {/* <p className="text-xs text-gray-400">{student.documents?.length} study materials</p> */}
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(student);
                      // Handle assign action here
                      // navigate(`/teacher/chats/${user?._id}`);
                    }}
                  >
                    Chat
                  </button>
                </div>
              )) : null}
            </div>
          </div>
 
        </div>
      </div>
    </FullLayout>
  );
};
