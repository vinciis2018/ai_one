import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  resetCoachingState,
  getCoachingDetails,
  listInstituteTeachers,
  listInstituteStudents,
  addTeacherToInstitute,
  addStudentToInstitute,
  type OrganisationModel,
} from "../../store/slices/coachingSlice";
import { UploadBox } from "../../components/atoms/UploadBox";
import type { User } from "../../types";
import { clearAllDocuments, fetchDocuments } from "../../store/slices/documentsSlice";
import { DocumentDetailsModal } from "./DocumentDetailsModal";
import type { TeacherModel } from "../../store/slices/teachersSlice";
import type { StudentModel } from "../../store/slices/studentsSlice";


interface Props {
  coachingId: string | null | undefined;
  onClose: () => void;
}

export const CoachingDetailsModal: React.FC<Props> = ({ coachingId, onClose }) => {
  const dispatch = useAppDispatch();

  const [coachingData, setCoachingData] = useState<OrganisationModel | null>(null);
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  // Coaching slice selectors
  const { coachingDetails, loading: coachingLoading, teachers, students } = useAppSelector(
    (state) => state.coachings
  );
  const { documents } = useAppSelector(
    (state) => state.documents
  );
  const { uploadStatus } = useAppSelector((state) => state.assistant);
  

  useEffect(() => {
    if (coachingDetails && Object.keys(coachingDetails).length > 0) {
      setCoachingData(coachingDetails as OrganisationModel);
    } else {
      setCoachingData(null);
    }
  }, [coachingDetails]);

  useEffect(() => {
    if (coachingDetails) {
      const user_ids = new Set<string>();
      teachers?.forEach((teacher: TeacherModel) => user_ids.add(teacher.user_id));
      students?.forEach((student: StudentModel) => user_ids.add(student.user_id));
      dispatch(fetchDocuments({user_ids: Array.from(user_ids)}));
    }
  },[dispatch, teachers, students, coachingDetails]);

  useEffect(() => {
    if (coachingId || (coachingId && uploadStatus === "succeeded")) {
      dispatch(getCoachingDetails(coachingId));
      dispatch(listInstituteTeachers(coachingId));
      dispatch(listInstituteStudents(coachingId));
    }
   
    return () => {
      dispatch(resetCoachingState());
      dispatch(clearAllDocuments());
    };
  }, [coachingId, dispatch, uploadStatus]);

  if (!coachingId) return null;

  // New: add current user as teacher
  const handleAddSelfAsTeacher = async () => {
    if (!user) return;
    const payload = {
      user_id: String((user as User)._id ?? ""),
      name: (user as User).full_name || "Unknown",
      email: (user as User).email || "Unknown",
      subjects: undefined,
      avatar: (user as User).avatar || "",
    };
    await dispatch(addTeacherToInstitute({ coaching_id: coachingId, teacher: payload }));
    dispatch(listInstituteTeachers(coachingId));
  };

  // New: add current user as student
  const handleAddSelfAsStudent = async () => {
    if (!user) return;
    const payload = {
      user_id: String((user as User)._id ?? ""),
      name: (user as User).full_name || "Unknown",
      email: (user as User).email || "Unknown",
      avatar: (user as User).avatar || "",
    };
    await dispatch(addStudentToInstitute({ coaching_id: coachingId, student: payload }));
    dispatch(listInstituteStudents(coachingId));
  };

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
      {/* Main Modal */}
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl my-auto mx-4 max-h-[80vh] flex flex-col border border-[var(--border)]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)] relative">
          <h3 className="text-lg font-semibold text-[var(--text)]">
            {coachingData?.name || "Detail Viewer"}
          </h3>

          <div className="flex items-center space-x-2">
            {/* Upload Button */}
            {user && (
              <button
                type="button"
                onClick={() => setShowUploadBox(!showUploadBox)}
                className="p-2 rounded-md hover:bg-[var(--background-alt)]"
                title="Upload documents"
                aria-label="Upload documents"
              >
                <span className="text-xl">📄</span>
              </button>
            )}
            

            {/* Add self as Teacher (no popup) */}
            {user?.role === "teacher" && !teachers?.map((teacher: TeacherModel) => teacher?.user_id).includes(user?._id as string) && (
              <button
                type="button"
                onClick={handleAddSelfAsTeacher}
                className="p-2 rounded-md hover:bg-[var(--background-alt)]"
                title="Add yourself as teacher"
                aria-label="Add yourself as teacher"
                disabled={coachingLoading}
              >
                <span className="text-xl">👩‍🏫</span>
              </button>
            )}
            

            {/* Add self as Student (no popup) */}
            {user?.role === "student" && !students?.map((student: StudentModel) => student?.user_id).includes(user?._id as string) && (
              <button
                type="button"
                onClick={handleAddSelfAsStudent}
                className="p-2 rounded-md hover:bg-[var(--background-alt)]"
                title="Add yourself as student"
                aria-label="Add yourself as student"
                disabled={coachingLoading}
              >
                <span className="text-xl">🎓</span>
              </button>
            )}
            <i className="fi fi-br-x flex items-center" onClick={onClose} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[var(--background)] text-[var(--text)]">
          {/* Upload Box - Show only when showUploadBox is true */}
          {showUploadBox && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Upload Documents</h4>
              <UploadBox isOpen={showUploadBox} onClose={() => setShowUploadBox(false)} />
            </div>
          )}

          {/* Coaching meta */}
          <div className="p-3 border border-[var(--border)] rounded-md bg-[var(--background-alt)] mb-4">
            <p className="text-sm"><strong>Institute:</strong> {coachingData?.name || "—"}</p>
            <div className="mt-2 flex space-x-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Teachers</p>
                <ul className="text-sm list-disc list-inside max-h-28 overflow-y-auto capitalize">
                  {teachers?.length ? (teachers as TeacherModel[]).map((t: TeacherModel) => <li key={t.id || t.user_id}>{t.name} {t.subjects ? `(${t.documents?.length || 0}/${t.subjects.length})` : ""}</li>) : <li className="text-[var(--text-muted)]">No teachers</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Students</p>
                <ul className="text-sm list-disc list-inside max-h-28 overflow-y-auto capitalize">
                  {students?.length ? (students as StudentModel[]).map((s: StudentModel) => <li key={s.id || s.user_id}>{s.name} {s.subjects ? `(${s.documents?.length || 0}/${s.subjects.length})` : ""}</li>) : <li className="text-[var(--text-muted)]">No students</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-4">Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 hover:shadow cursor-pointer"
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <p className="font-semibold">{doc.filename}</p>
                  <p className="text-sm text-gray-600">{doc.source_type}</p>
                  <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleString()}</p>
                </div>
              ))}
              {!documents?.length && (
                <p className="text-sm text-[var(--text-muted)] col-span-2">
                  No documents uploaded yet.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Document Details Modal */}
      {selectedDocumentId && (
        <DocumentDetailsModal
          documentId={selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
};
