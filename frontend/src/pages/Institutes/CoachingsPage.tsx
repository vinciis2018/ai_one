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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Select Subjects ({selectedSubjects.length})</h3>
        <div className="overflow-y-auto grid grid-cols-2 gap-4">
          {availableSubjects.map((subject, index) => (
            <div
              key={index}
              className={
                `${selectedSubjects.includes(subject) ? "border-green" : "border-blue-100"} relative p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border hover:shadow-lg transition-shadow hover:border-green`
              }
              onClick={() => {
                if (!selectedSubjects.includes(subject)) {
                  setSelectedSubjects([...selectedSubjects, subject]);
                } else {
                  setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                }
              }}
            >
              <h3 className="text-2xl font-semibold text-gray-800 capitalize">{subject}</h3>
              <div className="text-6xl absolute bottom-2 right-2 opacity-10">
                <i className={`fi ${allDomains?.find((domain) => domain.value === subject)?.icon} flex items-center justify-center`}></i>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 flex justify-start gap-2">
          <button
            onClick={() => {
              setShowSubjectPopup(false);
              setSelectedSubjects([]);
            }}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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
            className={`px-4 py-2 text-sm text-white rounded-md ${selectedSubjects.length === 0
              ? 'bg-green cursor-not-allowed'
              : 'bg-green hover:bg-green-2'
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
      <div className="bg-white max-w-4xl mx-auto py-2 px-4">
        <div className="rounded-lg overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
              <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
              <h1 className="text-sm font-semibold">
                Coachings
              </h1>
            </div>
            {user?.role === "teacher" && (
              <button
                title="create coaching"
                type="button"
                // onClick={() => setShowUploadBox(!showUploadBox)}
                className="flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 bg-baigeLight hover:bg-gray-200"
              >
                <i className="fi fi-br-add flex items-center justify-center text-violet" />
              </button>
            )}
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
              value={selectedDomainFilter}
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
                  onDoubleClick={() => navigate(`/coachings/${coaching._id}`)}
                >
                  <div className="flex items-center gap-2">
                    {/* <img src={coaching.avatar} alt={coaching.name} className="h-12 w-12 rounded-full" /> */}
                    <div>
                      <p className="font-semibold">{coaching.name}</p>
                      <p className="text-xs text-gray-400 capitalize font-semibold">{coaching.subjects?.join(", ")}</p>
                      <p className="text-xs text-gray-400 capitalize">{coaching.teachers?.length} teachers / {coaching.students?.length} students</p>
                      {/* <p className="text-xs text-gray-400">{teacher.documents?.length} study materials</p> */}
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle assign action here

                      if ((user?.role === "student" && !coaching.students.includes(user?.student_id)) || (user?.role == "teacher" && !coaching.teachers.includes(user?.teacher_id))) {
                        setSelectedCoachingId(coaching._id);
                        setIsJoiningAsTeacher(user?.role === "teacher");
                        setShowSubjectPopup(true);
                      } else {
                        navigate(`/coachings/${coaching._id}`);
                      }

                    }}
                  >
                    {
                      user?.role == "student" && !coaching.students.includes(user?.student_id)
                        ? "Join"
                        : user?.role == "teacher" && !coaching.teachers.includes(user?.teacher_id)
                          ? "Join" : "View"
                    }
                  </button>
                </div>
              )) : null}
            </div>
          </div>
          {showSubjectPopup && <SubjectSelectionPopup />}
        </div>
      </div>
    </FullLayout>
  );
};
