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
  // searchQuery,
  // handleSearch,
  all_teachers,
  user,
  handleAddSelfAsStudentToTeacher
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* <div className="mb-4">
        <div className="relative">
          <i className="fi fi-rr-search absolute left-3 top-3 text-slate-400 text-xs"></i>

          <input
            type="text"
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full text-xs pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-logoBlue focus:border-transparent bg-white dark:bg-slate-800 shadow-sm transition-all"
          />
        </div>
      </div> */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {all_teachers?.length || 0} teachers found
        </p>
      </div>

      <div className="space-y-3">
        {all_teachers && all_teachers.length > 0 ? (
          all_teachers.map((teacher: TeacherModel) => (
            <div
              key={teacher.id}
              className="group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 hover:shadow-lg hover:border-logoBlue transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:scale-105"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-logoPink rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-logoSky to-logoPurple rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <img
                      src={teacher.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt={teacher.name}
                      className="relative h-12 w-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                    />
                    {teacher.students?.includes(user?.student_id as string) && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate font-medium">
                      {teacher.subjects?.join(", ") || "No subjects"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <i className="fi fi-rr-users flex items-center justify-center"></i>
                      {teacher.students?.length || 0} students
                    </p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-logoBlue to-logoViolet hover:from-logoBlue/90 hover:to-logoViolet/90 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
                  onClick={() => handleAddSelfAsStudentToTeacher(teacher)}
                >
                  {teacher.students?.includes(user?.student_id as string) ? (
                    <>
                      <i className="fi fi-rr-comment-alt flex items-center justify-center"></i>
                      Chat
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-user-add flex items-center justify-center"></i>
                      Join
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <i className="fi fi-rr-users flex items-center justify-center text-4xl mb-2"></i>
            <p className="text-sm">No teachers found</p>
            <p className="text-xs">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
