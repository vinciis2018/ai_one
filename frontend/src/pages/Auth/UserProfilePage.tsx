import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useAppSelector } from '../../store';
import type { User } from '../../types';


const UserTypeDetails = ({ user }: { user: User | null }) => {
  if (!user) return null;

  if (user.role === 'retailer' && user.retailerDetails) {
    const details = user.retailerDetails;
    return (
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Retailer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Business Name</p>
            <p className="text-gray-900 dark:text-white">{details.name}</p>
          </div>
          {details.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900 dark:text-white">{details.phone}</p>
            </div>
          )}
          {details.gstNumber && (
            <div>
              <p className="text-sm text-gray-500">GST Number</p>
              <p className="text-gray-900 dark:text-white">{details.gstNumber}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              details.status === 'active' ? 'bg-green-100 text-green-800' :
              details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
            </span>
          </div>
        </div>
        {(details.address || details.city || details.state || details.pincode) && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-gray-900 dark:text-white">
              {[details.address, details.city, details.state, details.pincode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (user.role === 'distributor' && user.distributorDetails) {
    const details = user.distributorDetails;
    return (
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Distributor Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Business Name</p>
            <p className="text-gray-900 dark:text-white">{details.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Number</p>
            <p className="text-gray-900 dark:text-white">{details.contactNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900 dark:text-white">{details.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GST Number</p>
            <p className="text-gray-900 dark:text-white">{details.gstNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              details.status === 'active' ? 'bg-green-100 text-green-800' :
              details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Address</p>
          <p className="text-gray-900 dark:text-white">
            {[details.address, details.city, details.state, details.pincode].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Location</p>
          <p className="text-gray-900 dark:text-white">
            Lat: {details.latitude}, Lng: {details.longitude}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export function UserProfilePage() {
  const navigate = useNavigate();
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


  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-white to-violet text-white">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full border-4 border-white"
                  src={user?.avatar}
                  alt={user?.firstName}
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl text-black dark:text-white font-bold">{user?.firstName}</h1>
                <p className="text-primary">{user?.email}</p>
                {/* <p className="text-blue-100 text-sm mt-1">Member since {mockUserData.joinDate}</p> */}
              </div>
            </div>
          </div>

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


            </div>
          </div>
    </SimpleLayout>
  );
}

export default UserProfilePage;
