import React from 'react';

interface StatsGridProps {
  teacherDetails?: any;
  studentDetails?: any;
}

const StatsGrid: React.FC<StatsGridProps> = ({ teacherDetails, studentDetails }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-violet-50 p-3 rounded-xl border border-violet-100">
        <div className="text-violet-600 text-lg font-bold">
          {teacherDetails?.students?.length || studentDetails?.teachers?.length || 0}
        </div>
        <div className="text-xs text-violet-800 opacity-70">Students</div>
      </div>
      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <div className="text-orange-600 text-lg font-bold">
          {teacherDetails?.documents?.length || studentDetails?.documents?.length || 0}
        </div>
        <div className="text-xs text-orange-800 opacity-70">Notes</div>
      </div>
      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
        <div className="text-blue-600 text-lg font-bold">
          {teacherDetails?.subjects?.length || studentDetails?.subjects?.length || 0}
        </div>
        <div className="text-xs text-blue-800 opacity-70">Subjects</div>
      </div>
      <div className="bg-green-50 p-3 rounded-xl border border-green-100">
        <div className="text-green-600 text-lg font-bold">4.9</div>
        <div className="text-xs text-green-800 opacity-70">Rating</div>
      </div>
    </div>
  );
};

export default StatsGrid;
