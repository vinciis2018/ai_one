import React from 'react';
import type { TeacherModel } from '../../../store/slices/teachersSlice';
import type { User } from '../../../types';

interface TeacherListViewProps {
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  all_teachers: TeacherModel[] | null;
  user: User | null;
  handleAddSelfAsStudentToTeacher: (teacher: TeacherModel) => void;
}

export const TeacherListView: React.FC<TeacherListViewProps> = ({
  searchQuery,
  handleSearch,
  all_teachers,
  user,
  handleAddSelfAsStudentToTeacher
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search teachers..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
        />
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {all_teachers?.length || 0} teachers found
        </p>
      </div>

      <div className="space-y-2">
        {all_teachers && all_teachers.length > 0 ? (
          all_teachers.map((teacher: TeacherModel) => (
            <div
              key={teacher.id}
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={teacher.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt={teacher.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                      {teacher.subjects?.join(", ") || "No subjects"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {teacher.students?.length || 0} students
                    </p>
                  </div>
                </div>
                <button
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xs transition-colors flex-shrink-0"
                  onClick={() => handleAddSelfAsStudentToTeacher(teacher)}
                >
                  {teacher.students?.includes(user?.student_id as string) ? "Chat" : "Join"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <i className="fi fi-rr-users text-4xl mb-2"></i>
            <p className="text-sm">No teachers found</p>
            <p className="text-xs">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
