import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateUser } from '../../../store/slices/usersSlice';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
      setUpdateError(null);
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setIsLoading(true);
    setUpdateError(null);

    try {
      // Split name if needed or just send updated fields that the backend accepts
      // Assuming 'updateUser' takes Partial<User> inside 'userData'

      const resultAction = await dispatch(updateUser({
        id: user._id,
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          // usually email isn't editable directly here without verification, but we'll include it read-only in UI
        }
      }));

      if (updateUser.fulfilled.match(resultAction)) {
        onClose();
      } else {
        if (resultAction.payload) {
          setUpdateError(resultAction.payload as string);
        } else {
          setUpdateError('Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setUpdateError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100 animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-logoBlue flex items-center justify-center text-white">
              <i className="fi fi-rr-edit text-base flex items-center justify-center"></i>
            </span>
            Edit Profile
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <i className="fi fi-rr-cross hover:rotate-90 transition-transform duration-300 flex"></i>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-logoBlue focus:ring-4 focus:ring-logoBlue/10 outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white font-medium"
                    placeholder="First Name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-logoBlue focus:ring-4 focus:ring-logoBlue/10 outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white font-medium"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative opacity-70 cursor-not-allowed">
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 font-medium cursor-not-allowed"
                  placeholder="email@example.com"
                />
              </div>
              <p className="text-xs text-slate-400 ml-1">Email cannot be changed directly.</p>
            </div>
          </div>

          {updateError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-3">
              <i className="fi fi-rr-exclamation-triangle"></i>
              {updateError}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-logoBlue/25 transition-all flex items-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-logoBlue to-logoViolet hover:scale-[1.02] hover:shadow-xl'}`}
            >
              {isLoading ? (
                <>
                  <i className="fi fi-rr-spinner animate-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fi fi-rr-disk"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
