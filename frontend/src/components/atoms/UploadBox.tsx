// ============================================
// UploadBox.tsx
// Uploads PDF or image study materials
// Connected to Redux (assistantSlice)
// ============================================

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetStatus, uploadMaterial, type UploadRequestPayload } from "../../store/slices/assistantSlice";
import { useNavigate } from "react-router-dom";
import { getS3Url } from "../../utilities/awsUtils";

interface UploadBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { uploadStatus, error } = useAppSelector((state) => state.assistant);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [domain, setDomain] = useState<string>("general");
  const [level, setLevel] = useState<string>("general");
  const [docType, setDocType] = useState<string>("study_material");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    // Step 1: Upload to S3
    console.log('📤 Uploading to S3...');
    const s3Url = await getS3Url(file);
    console.log('✅ File uploaded to S3:', s3Url);
    // {
    //     "filename": "HC VERMA Solutions for Class 11 Physics Chapter 1.pdf",
    //     "upload_url": "https://usethisbucketforupload.s3.amazonaws.com/uploads/HC_VERMA_Solutions_for_Class_11_Physics_Chapter_1.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4U5FOV25LU6VRNO3%2F20251103%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251103T100044Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Signature=473bbc21c8df6cbe3136e115990386bc1b3d91f19cc112960659e2dac15e98f2",
    // const s3Url = "https://usethisbucketforupload.s3.ap-south-1.amazonaws.com/uploads/HC_VERMA_Solutions_for_Class_11_Physics_Chapter_1.pdf"
    // }
    // Step 2: Send the S3 URL to backend for processing
    const payload: UploadRequestPayload = {
      fileName: file.name,
      s3Url,
      // : "https://usethisbucketforupload.s3.ap-south-1.amazonaws.com/uploads/ChemicalBondingNotesGautami.pdf",
      subject: subject.toLowerCase(),
      domain: domain.toLowerCase(),
      level: level.toLowerCase(),
      type: docType,
      file_type: file.type,
      source_type: user?.role || 'default',
      user_id: user?._id || '',
      file_size: file.size,
    };
    console.log(payload);
    await dispatch(uploadMaterial(payload));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }

    if (uploadStatus === "succeeded") {
      // Reset form
      setFile(null);
      setSubject("");
      setDomain("");
      setLevel("");
      setDocType("study_material");
      dispatch(resetStatus());

      // Notify parent about success
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Close the panel after successful upload
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isAuthenticated, dispatch, navigate, uploadStatus, onClose, onUploadSuccess]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
              <i className="fi fi-rr-cloud-upload text-lg"></i>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Upload Material</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add study resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close upload panel"
          >
            <i className="fi fi-rr-cross text-gray-600 dark:text-gray-300 flex"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject / Topic
              </label>
              <input
                type="text"
                placeholder="e.g., CBSE 11 Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Domain Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="general">General</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Maths</option>
                <option value="biology">Biology</option>
              </select>
            </div>

            {/* Level Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Education Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="general">Standard</option>
                <option value="highschool">High School (10th)</option>
                <option value="intermediate">Intermediate (12th)</option>
                <option value="graduation">Graduation</option>
                <option value="postgraduation">Post Graduation</option>
              </select>
            </div>

            {/* Document Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="study_material">Study Material</option>
                <option value="pyq_paper">Previous Year Question Paper</option>
                <option value="dpp">Daily Practice Paper</option>
                <option value="booklet">Booklet</option>
                <option value="mocktest">Mock Test</option>
              </select>
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 focus:outline-none file:mr-4 file:py-3 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <i className="fi fi-rr-document text-blue-600"></i>
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <i className="fi fi-rr-exclamation text-red-600 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Upload Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === "succeeded" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <i className="fi fi-rr-check-circle text-green-600 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Upload Successful!</p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">Your file has been uploaded and is being processed.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Upload Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <button
            onClick={handleUpload}
            disabled={uploadStatus === "loading" || !file}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${uploadStatus === "loading" || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              }`}
          >
            {uploadStatus === "loading" ? (
              <>
                <i className="fi fi-br-circle animate-spin"></i>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <i className="fi fi-rr-cloud-upload"></i>
                <span>Upload File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
