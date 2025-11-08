import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { addStudentToInstitute, getAllCoachings, resetCoachingState } from "../../store/slices/coachingSlice";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { CoachingDetailsModal } from "../../components/popups/CoachingDetailsModal";
import type { User } from "../../types";
import { getMe } from "../../store/slices/authSlice";

export const CoachingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {user} = useAppSelector((state) => state.auth);
  const { coachings, loading, error, success } = useAppSelector((state) => state.coachings);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState("all");

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
    setSelectedDomain(e.target.value);
  };

    // New: add current user as student
    const handleAddSelfAsStudent = async (coachingId: string) => {
      if (!user) return;
      const payload = {
        user_id: String((user as User)._id ?? ""),
        name: (user as User).full_name || "Unknown",
        email: (user as User).email || "Unknown",
        avatar: (user as User).avatar || "",
      };
      await dispatch(addStudentToInstitute({ coaching_id: coachingId as string, student: payload }));
      dispatch(getAllCoachings());
    };

  return (
    <FullLayout>
      <div className="bg-white max-w-4xl mx-auto py-2 px-4">
        <div className="rounded-lg overflow-hidden">
          <div className="py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
            <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
            <h1 className="text-sm font-semibold">
              Coachings
            </h1>
          </div>
          {loading && <p>Loading coachings...</p>}
          {error && <p className="text-red-500">Failed to load coachings.</p>}
          <div className="grid grid-cols-3 gap-2 py-2">
            <input
              type="text"
              placeholder="Search coachings..."
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

          <div className="py-2">
            <h2 className="text-xs">found {Array.isArray(coachings) && coachings.length} coachings</h2>
            <div className="py-4 space-y-2">
              {Array.isArray(coachings) ? coachings.map((coaching) => (
                <div
                  key={coaching._id}
                  className="border border-gray-100 bg-baigeLight rounded-xl p-4 hover:shadow cursor-pointer flex items-center justify-between"
                  onClick={() => setSelectedId(coaching?._id)}
                >
                  <div className="flex items-center gap-2">
                    {/* <img src={coaching.avatar} alt={coaching.name} className="h-12 w-12 rounded-full" /> */}
                    <div>
                      <p className="font-semibold">{coaching.name}</p>
                      <p className="text-xs text-gray-400">({coaching.subjects?.length}) subjects</p>
                      <p className="text-xs text-gray-400">{coaching.teachers?.length} teachers / {coaching.students?.length} students</p>
                      {/* <p className="text-xs text-gray-400">{teacher.documents?.length} study materials</p> */}
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle assign action here
                      if (!coaching.students.includes(user?.student_id)) {
                        handleAddSelfAsStudent(coaching?._id)
                      } else {
                        navigate(`/institute/coachings/${coaching?._id}`)
                      }
                    }}
                  >
                    {coaching.students.includes(user?.student_id) ? "View" : "Join"}
                  </button>
                </div>
              )) : null}
            </div>
          </div>
        <CoachingDetailsModal coachingId={selectedId} onClose={() => setSelectedId(null)} />
  
        </div>
      </div>
    </FullLayout>
  );
};
