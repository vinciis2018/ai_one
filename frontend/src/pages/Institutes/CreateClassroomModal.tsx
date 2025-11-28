import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { createClassroom, resetCoachingState } from "../../store/slices/coachingSlice";

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading, error, success } = useAppSelector((state) => state.coachings);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    description: ""
  });

  const validateForm = () => {
    const errors = {
      name: "",
      description: ""
    };

    if (!formData.name.trim()) {
      errors.name = "Classroom name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    setFormErrors(errors);
    return !errors.name && !errors.description;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?._id) {
      setFormErrors({
        ...formErrors,
        name: "Teacher ID not found. Please ensure you're logged in as a teacher."
      });
      return;
    }

    try {
      const result = await dispatch(createClassroom({
        name: formData.name,
        description: formData.description,
        teacher_id: user._id
      }));

      if (createClassroom.fulfilled.match(result)) {
        // Reset form
        setFormData({ name: "", description: "" });
        setFormErrors({ name: "", description: "" });

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Reset state and close modal immediately
        dispatch(resetCoachingState());
        onClose();
      }
    } catch (err) {
      console.error("Error creating classroom:", err);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setFormErrors({ name: "", description: "" });
    dispatch(resetCoachingState());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Classroom</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <i className="fi fi-sr-cross-small text-xl" />
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <i className="fi fi-sr-check-circle mr-2" />
            Classroom created successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <i className="fi fi-sr-exclamation mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="classroom-name" className="block text-sm font-medium mb-2">
              Classroom Name <span className="text-red-500">*</span>
            </label>
            <input
              id="classroom-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Class 10-A, Physics 101"
              className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="classroom-description" className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="classroom-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Grade 10 Section A, Advanced Physics Course"
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${formErrors.description ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              disabled={loading}
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green hover:bg-green-600"
                }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fi fi-sr-spinner animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Classroom"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
