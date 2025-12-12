import React from 'react';
import type { StudentModel } from '../../../store/slices/studentsSlice';

interface StudentListViewProps {
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  all_students: StudentModel[] | null;
  handleSelectStudent: (student: StudentModel) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  // searchQuery,
  // handleSearch,
  all_students,
  handleSelectStudent
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full text-xs pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-logoBlue focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all"
          />
          <i className="fi fi-rr-search flex items-center justify-center absolute left-3 top-3 text-xs text-slate-400"></i>
        </div>
      </div> */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {all_students?.length || 0} students found
        </p>
      </div>

      <div className="space-y-3">
        {all_students && all_students.length > 0 ? (
          all_students.map((student: StudentModel) => (
            <div
              key={student.id}
              className="group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 hover:shadow-lg hover:border-logoBlue transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-logoPink rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <img
                      src={student.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt={student.name}
                      className="relative h-12 w-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center" />

                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate font-medium">
                      {student.subjects?.join(", ") || "No subjects"}
                    </p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-logoBlue to-logoViolet hover:from-logoBlue hover:to-logoViolet text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
                  onClick={() => handleSelectStudent(student)}
                >
                  <i className="fi fi-rr-comment-alt flex items-center justify-center"></i>
                  Chat
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <i className="fi fi-rr-users text-4xl mb-2 flex items-center justify-center"></i>
            <p className="text-sm">No students found</p>
            <p className="text-xs">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
