
import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetStatus, uploadMaterial, type UploadRequestPayload } from "../../store/slices/assistantSlice";
import { useNavigate } from "react-router-dom";
import { getS3Url } from "../../utilities/awsUtils";

interface UploadBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onClose, onUploadSuccess }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { uploadStatus, error } = useAppSelector((state) => state.assistant);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [domain, setDomain] = useState<string>("general");
  const [level, setLevel] = useState<string>("general");
  const [docType, setDocType] = useState<string>("study_material");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    // Step 1: Upload to S3
    const s3Url = await getS3Url(file);

    // Step 2: Send to backend
    const payload: UploadRequestPayload = {
      fileName: file.name,
      s3Url,
      subject: subject.toLowerCase(),
      domain: domain.toLowerCase(),
      level: level.toLowerCase(),
      type: docType,
      file_type: file.type,
      source_type: user?.role || 'default',
      user_id: user?._id || '',
      file_size: file.size,
    };

    await dispatch(uploadMaterial(payload));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }

    if (uploadStatus === "succeeded") {
      setFile(null);
      setSubject("");
      setDomain("");
      setLevel("");
      setDocType("study_material");
      dispatch(resetStatus());

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isAuthenticated, dispatch, navigate, uploadStatus, onClose, onUploadSuccess]);

  return (
    <div className="bg-white w-full overflow-hidden flex flex-col h-full border border-white">
      {/* Header */}
      <div className="relative px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-black">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-logoBlue to-logoViolet flex items-center justify-center shadow-lg shadow-logoBlue transform hover:scale-105 transition-transform duration-300">
            <i className="fi fi-rr-cloud-upload flex items-center justify-center text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Upload Material
            </h2>
            <p className="text-sm text-gray-500 font-medium">Add study resources to your library</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900 dark:hover:text-red-400 transition-all duration-200"
        >
          <i className="fi fi-rr-cross flex items-center justify-center text-xs"></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

        {/* File Drop Zone */}
        <div
          className={`
            group relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer text-center
            ${isDragOver
              ? 'border-logoBlue bg-blue-50 dark:bg-blue-900 scale-[1.01]'
              : file
                ? 'border-green-400 bg-green-50 dark:bg-green-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-logoBlue hover:bg-gray-50 dark:hover:bg-gray-800'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            {file ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm mb-2">
                  <i className="fi fi-rr-document-signed text-3xl"></i>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 break-all px-4">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                >
                  Remove File
                </button>
              </>
            ) : (
              <>
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-300 group-hover:-translate-y-1
                  ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50 group-hover:text-logoBlue dark:group-hover:bg-blue-900'}
                `}>
                  <i className="fi fi-rr-cloud-upload flex items-center justify-center text-3xl"></i>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    PDF or Image files (max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Topic/Chapter</label>
            <div className="relative">
              <i className="fi fi-rr-book-alt absolute left-3 top-1/3 -translate-y-1/3 text-gray-400"></i>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Physics 11 HCV..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-logoBlue focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Document Type</label>
            <div className="relative">
              <i className="fi fi-rr-duplicate absolute left-3 top-1/3 -translate-y-1/3 text-gray-400"></i>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-logoBlue focus:border-transparent transition-all outline-none appearance-none"
              >
                <option value="study_material">Study Material</option>
                <option value="pyq_paper">Previous Year Questions</option>
                <option value="dpp">Daily Practice Paper</option>
                <option value="booklet">Booklet</option>
                <option value="mocktest">Mock Test</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-3 top-1/3 -translate-y-1/3 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Subject</label>
            <div className="relative">
              <i className="fi fi-rr-graduation-cap absolute left-3 top-1/3 -translate-y-1/3 text-gray-400"></i>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-logoBlue focus:border-transparent transition-all outline-none appearance-none"
              >
                <option value="general">General</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Maths</option>
                <option value="biology">Biology</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-3 top-1/3 -translate-y-1/3 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Education Level</label>
            <div className="relative">
              <i className="fi fi-rr-chart-histogram absolute left-3 top-1/3 -translate-y-1/3 text-gray-400"></i>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-logoBlue focus:border-transparent transition-all outline-none appearance-none"
              >
                <option value="general">Standard</option>
                <option value="highschool">High School (10th)</option>
                <option value="intermediate">Intermediate (12th)</option>
                <option value="graduation">Graduation</option>
                <option value="postgraduation">Post Graduation</option>
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-3 top-1/3 -translate-y-1/3 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <i className="fi fi-rr-exclamation text-red-600"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-200">Upload Failed</p>
              <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {uploadStatus === "succeeded" && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <i className="fi fi-rr-check text-green-600"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-green-800 dark:text-green-200">Processing Success</p>
              <p className="text-xs text-green-600 dark:text-green-300">File uploaded smoothly!</p>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 backdrop-blur-sm">
        <button
          onClick={handleUpload}
          disabled={uploadStatus === "loading" || !file}
          className={`
            w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg
            ${uploadStatus === "loading" || !file
              ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-logoBlue via-violet-500 to-logoPink hover:scale-[1.02] hover:shadow-logoBlue"
            }
          `}
        >
          {uploadStatus === "loading" ? (
            <>
              <i className="fi fi-br-circle flex items-center justify-center text-2xl animate-spin"></i>
              <span>Uploading & Processing...</span>
            </>
          ) : (
            <>
              <i className="fi fi-rr-rocket-lunch flex items-center justify-center text-2xl"></i>
              <span>Upload Material</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
