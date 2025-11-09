import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getTeacherDetails } from '../../store/slices/teachersSlice';
import { getStudentDetails } from '../../store/slices/studentsSlice';

interface Tab {
  key: number;
  label: string;
  value: string;
  icon?: string;
}


export function UserProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentTab, setCurrentTab] = useState<string>('teachers');
  const { user } = useAppSelector((state) => state.auth);
  const { teacher_details } = useAppSelector((state) => state.teachers);
  const { student_details } = useAppSelector((state) => state.students);
  console.log(teacher_details)
  const [formData, setFormData] = useState<{name: string, email: string}>({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user's profile here
  };

  useEffect(() => {
    if (user?.role == "teacher") {
      dispatch(getTeacherDetails(user?._id || ""));
    }
    if (user?.role == "student") {
      dispatch(getStudentDetails(user?._id || ""));
    }
  },[dispatch, user]);


  const tabs: Tab[] = [
    {
      key: 1,
      label: 'Details',
      value: 'details',
    },{
      key: 2,
      label: 'Edit',
      value: 'edit',
    }
  ];

  return (
    <SimpleLayout>
      <div className="bg-white max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
            <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
            <h1 className="text-sm font-semibold">
              back
            </h1>
          </div>
          {/* Profile Header */}
          <div className="py-4">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full"
                  src={user?.avatar}
                  alt={user?.full_name}
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl text-black dark:text-white font-bold capitalize">{user?.full_name}</h1>
                <p className="text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2 max-w-screen grid grid-cols-2 gap-4">
            {tabs?.map((tab: Tab) => (
              <div className="col-span-1" key={tab.key}>
                <button
                  type="button"
                  onClick={() => setCurrentTab(tab.value)}
                  className={`p-2 w-full focus:outline-none ${
                    currentTab === tab.value
                      ? 'border-b-2 border-green text-green font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              </div>
            ))}
          </div>

          {currentTab === "edit1" ? (
            <div className="p-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h1 className="text-lg font-medium text-black dark:text-white capitalize">{user?.role} profile</h1>
                    <p className="text-sm text-black dark:text-white capitalize">{teacher_details?.organization?.name || student_details?.organization?.name}</p>
                  
                  </div>
                  <div>
                    <h1 className="text-sm text-black dark:text-white">Subjects</h1>
                    <p className="text-sm font-medium text-black dark:text-white capitalize">{teacher_details?.subjects?.join(", ") || student_details?.subjects?.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">Notes</p>
                    <p className="mt-1 text-sm text-black dark:text-white">{teacher_details?.documents?.length || student_details?.documents?.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{user?.role === "teacher" ? "Students" : "Teachers"}</p>
                    <p className="mt-1 text-sm text-black dark:text-white">{teacher_details?.students?.length || student_details?.teachers?.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
}

export default UserProfilePage;
