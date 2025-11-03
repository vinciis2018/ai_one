// ============================================
// UploadBox.tsx
// Uploads PDF or image study materials
// Connected to Redux (assistantSlice)
// ============================================

import React, { useEffect, useState } from "react";
import {  useAppDispatch, useAppSelector } from "../../store";
import { uploadMaterial, type UploadRequestPayload } from "../../store/slices/assistantSlice";
import { useNavigate } from "react-router-dom";
// import { getS3Url } from "../../utilities/awsUtils";

export const UploadBox: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { uploadStatus, error } = useAppSelector((state) => state.assistant);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    // // Step 1: Upload to S3
    // console.log('📤 Uploading to S3...');
    // const s3Url = await getS3Url(file);
    // console.log('✅ File uploaded to S3:', s3Url);
// {
//     "filename": "HC VERMA Solutions for Class 11 Physics Chapter 1.pdf",
//     "upload_url": "https://usethisbucketforupload.s3.amazonaws.com/uploads/HC_VERMA_Solutions_for_Class_11_Physics_Chapter_1.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4U5FOV25LU6VRNO3%2F20251103%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251103T100044Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Signature=473bbc21c8df6cbe3136e115990386bc1b3d91f19cc112960659e2dac15e98f2",
    const s3Url = "https://usethisbucketforupload.s3.ap-south-1.amazonaws.com/uploads/HC_VERMA_Solutions_for_Class_11_Physics_Chapter_1.pdf"
// }
    // Step 2: Send the S3 URL to backend for processing
    const payload: UploadRequestPayload = {
      fileName: file.name,
      s3Url,
      source_type: 'student',
      user_id: user?._id || '',
    };
    console.log(payload);
    await dispatch(uploadMaterial(payload));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  },[isAuthenticated, navigate]);
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 border border-gray-200 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        📤 Upload Study Material
      </h2>

      <input
        title="Select file to upload"
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none mb-3"
      />

      <button
        onClick={handleUpload}
        disabled={uploadStatus === "loading"}
        className={`px-5 py-2 rounded-lg font-medium text-white transition ${
          uploadStatus === "loading"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploadStatus === "loading" ? "Uploading..." : "Upload File"}
      </button>

      {file && (
        <p className="text-sm mt-2 text-gray-500">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">
          ❌ {error}
        </p>
      )}

      {uploadStatus === "succeeded" && (
        <p className="text-green-600 text-sm mt-3">✅ Upload successful!</p>
      )}
    </div>
  );
};
