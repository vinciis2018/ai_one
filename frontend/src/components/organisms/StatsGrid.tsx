import React from 'react';

interface StatsGridProps {
  teacherDetails?: any;
  studentDetails?: any;
}

const StatsGrid: React.FC<StatsGridProps> = ({ teacherDetails, studentDetails }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-logoBlue to-logoSky p-3 rounded-xl">
        <div className="text-white text-lg md:text-xl font-bold">
          {teacherDetails?.students?.length || studentDetails?.teachers?.length || 0}
        </div>
        <div className="text-xs md:text-md text-white opacity-90 font-semibold">Students</div>
      </div>
      <div className="bg-gradient-to-br from-logoSky to-logoPink p-3 rounded-xl">
        <div className="text-white text-lg md:text-xl font-bold">
          {teacherDetails?.documents?.length || studentDetails?.documents?.length || 0}
        </div>
        <div className="text-xs md:text-md text-white opacity-90 font-semibold">Notes</div>
      </div>
      <div className="bg-gradient-to-br from-logoPink to-logoPurple p-3 rounded-xl">
        <div className="text-white text-lg md:text-xl font-bold">
          {teacherDetails?.subjects?.length || studentDetails?.subjects?.length || 0}
        </div>
        <div className="text-xs md:text-md text-white opacity-90 font-semibold">Subjects</div>
      </div>
      <div className="bg-gradient-to-br from-logoPurple to-logoViolet p-3 rounded-xl shadow-md">
        <div className="text-white text-lg md:text-xl font-bold">4.9</div>
        <div className="text-xs md:text-md text-white opacity-90 font-semibold">Rating</div>
      </div>
    </div>
  );
};

export default StatsGrid;
