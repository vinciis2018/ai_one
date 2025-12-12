
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createCoaching } from '../../store/slices/coachingSlice';
import { allDomains } from '../../constants/helperConstants';

interface CreateCoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCoachingModal: React.FC<CreateCoachingModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.coachings);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjects: [] as string[],
    avatar: '',
    address: '',
    contact_email: '',
    phone: '',
    website: '',
    gst: '',
    pan: '',
  });

  const availableSubjects = [
    "maths", "physics", "chemistry", "biology",
  ];

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      subjects: formData.subjects,
      address: formData.address,
      contact_email: formData.contact_email,
      phone: formData.phone,
      website: formData.website,
      gst: formData.gst,
      pan: formData.pan,
      admin_id: user._id,
      source_type: 'manual', // Default source type
      avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff&bold=true`
    };

    // @ts-ignore - Ignoring type strictness for partial model creation if needed, though checks align with OrganisationModel
    await dispatch(createCoaching(payload));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white/60 dark:bg-black/60 transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-white/20 dark:border-white/10">

        {/* Header */}
        <div className="bg-gradient-to-r from-logoBlue/10 to-logoViolet/10 p-6 border-b border-logoBlue/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-logoBlue to-logoViolet flex items-center justify-center text-white shadow-lg shadow-logoBlue/20">
              <i className="fi fi-rr-building flex items-center justify-center text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Institute</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Establish your digital presence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="fi fi-rr-cross-small text-xl flex items-center justify-center"></i>
          </button>
        </div>

        {/* Form */}
        <div className="p-8 h-120 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Institute Name</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Viraaz Academy"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all font-medium"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-logoBlue transition-colors">
                  <i className="fi fi-rr-school flex items-center justify-center"></i>
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
              <div className="relative group">
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your institute, vision, and teaching methodology..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all font-medium resize-none"
                />
                <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-logoBlue transition-colors">
                  <i className="fi fi-rr-info flex items-center justify-center"></i>
                </div>
              </div>
            </div>

            {/* Subjects Selection */}
            <div className="space-y-4 pt-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Focus Subjects</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSubjects.map((subject) => (
                  <div
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`
                                    cursor-pointer relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2
                                    ${formData.subjects.includes(subject)
                        ? 'bg-gradient-to-br from-logoBlue/10 to-logoViolet/10 border-logoBlue text-logoBlue'
                        : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-500 hover:border-logoBlue/50'
                      }
                                `}
                  >
                    <i className={`fi ${allDomains?.find(d => d.value === subject)?.icon || 'fi-rr-book'} text-xl ${formData.subjects.includes(subject) ? 'text-logoBlue' : 'text-slate-400'}`}></i>
                    <span className="text-xs font-bold capitalize">{subject}</span>
                    {formData.subjects.includes(subject) && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-logoBlue"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contact Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@institute.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete address of your institute..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all text-sm font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Website (Optional)</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.your-institute.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Tax Details Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gst}
                    onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all text-sm font-medium uppercase placeholder:normal-case"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-logoBlue focus:ring-1 focus:ring-logoBlue transition-all text-sm font-medium uppercase placeholder:normal-case"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name}
            className={`
                    px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
                    ${loading || !formData.name
                ? 'bg-slate-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-logoBlue to-logoViolet hover:shadow-logoBlue/25 hover:-translate-y-0.5'
              }
                `}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              <>
                <span>Create Institute</span>
                <i className="fi fi-rr-arrow-right flex items-center justify-center mt-0.5"></i>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
