import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useAppSelector } from '../../store';
import type { User } from '../../types';

interface Tab {
  key: number;
  label: string;
  value: string;
  icon?: string;
}


const UserTypeDetails = ({ user }: { user: User | null }) => {
  if (!user) return null;

  if (user.role === 'student') {
    return (
      <div>
        {user.role}
      </div>
    );
  }

  if (user.role === 'teacher') {
    return <div>{user.role}</div>;
  }

  return null;
};

export function UserProfilePage() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<string>('teachers');
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
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
    setIsEditing(false);
  };


  const tabs: Tab[] = [
    {
      key: 1,
      label: 'Teachers',
      value: 'teachers',
    },
    {
      key: 2,
      label: 'Notes',
      value: 'notes',
    },
    {
      key: 3,
      label: 'Details',
      value: 'details',
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
                <h1 className="text-2xl text-black dark:text-white font-bold">{user?.full_name}</h1>
                <p className="text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2 max-w-screen grid grid-cols-3 gap-4">
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

          {currentTab === "teachers" ? (
            <div className="p-2">
              <h1 className="text-lg font-bold">My Teachers</h1>
            </div>
          ) : currentTab === "notes" ? (
            <div className="p-2">
              <h1 className="text-lg font-bold">My Notes</h1>
            </div>
          ) : (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Profile Information
                      </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      {isEditing ? (
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
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Full Name</p>
                              <p className="text-gray-900 dark:text-white">
                                {user?.firstName} {user?.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="text-gray-900 dark:text-white">{user?.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">User Type</p>
                              <p className="text-gray-900 dark:text-white">{user?.role}</p>
                            </div>
                          </div>
                          {user?.role && ["retailer","distributor"].includes(user?.role) && (
                            <div>
                              <UserTypeDetails user={user} />
                              <div>
                                <p className="text-sm font-medium text-black dark:text-white">Name</p>
                                <p className="mt-1 text-sm text-black dark:text-white">{formData.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-black dark:text-white">Email</p>
                                <p className="mt-1 text-sm text-black dark:text-white">{formData.email}</p>
                              </div>
                              <div className="pt-2">
                                <button
                                  onClick={() => setIsEditing(true)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                                >
                                  Edit Profile
                                </button>
                              </div>
                            </div>
                          )}
                          
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Security
                      </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">•••••••••••••</p>
                          <button
                            onClick={() => navigate('/change-password')}
                            className="mt-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                          >
                            Change Password
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Two-Factor Authentication</p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">Not enabled</p>
                          <button
                            onClick={() => navigate('/security/2fa')}
                            className="mt-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                          >
                            Set up two-factor authentication
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          )}

          {/* Profile Details */}
        


            </div>
          </div>
    </SimpleLayout>
  );
}

export default UserProfilePage;
