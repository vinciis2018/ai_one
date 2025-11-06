// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Now with S3 image upload before processing
// ============================================

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { askQuery, askImageQuery } from "../../store/slices/assistantSlice";
import { ResponseCard } from "./ResponseCard";
import { fetchChatById } from "../../store/slices/conversationsSlice";
import { getS3Url } from "../../utilities/awsUtils";

export const QueryBox: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { queryStatus, response, error } = useAppSelector(
    (state) => state.assistant
  );
  const { chat: chatConversation } = useAppSelector((state) => state.conversations); 

  const [question, setQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New: domain selection state
  const [domain, setDomain] = useState<string>("science");
  const [showDomainDropdown, setShowDomainDropdown] = useState<boolean>(false);

  // Handle text query
  const handleAsk = async () => {
    if (!question.trim()) return alert("Please enter a question!");
    await dispatch(askQuery({
      text: question,
      userId: user?._id || '',
      chatId: response?.chat_id || "",
      previousConversation: response?.conversation_id || "",
      domain_expertise: domain,
    }));
  };

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file (JPEG, PNG, etc.)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image query with S3 upload first
  const handleImageQuery = async () => {
    if (!selectedImage) return alert("Please select an image first!");
    if (!user?._id) return alert("User not found!");

    setIsUploadingToS3(true);
    
    try {
      console.log('📤 Uploading image to S3...');
      
      // Step 1: Upload to S3
      const s3Url = await getS3Url(selectedImage);
      console.log('✅ Image uploaded to S3:', s3Url);

      // Step 2: Prepare payload for backend
      const payload = {
        text: question,
        fileName: selectedImage.name,
        s3Url: s3Url,
        userId: user._id,
        chatId: response?.chat_id || "",
        previousConversation: response?.conversation_id || "",
        domain_expertise: domain,
        file_type: selectedImage.type,
        file_size: selectedImage.size,
        source_type: user?.role || 'user',
        // Add any additional fields your backend expects
        subject: "general", // You can make this dynamic if needed
        domain: domain,  // use selected domain
        level: "general",   // You can make this dynamic if needed
        type: "image_query" // Different from study_material
      };

      console.log('📦 Sending S3 URL to backend:', payload);

      // Step 3: Send to backend for processing
      const result = await dispatch(askImageQuery(payload));
      
      // If successful, reset image selection
      if (askImageQuery.fulfilled.match(result)) {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        console.log('✅ Image query completed successfully');
      }
      
    } catch (error) {
      console.error('❌ Error in image query process:', error);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsUploadingToS3(false);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Combined loading state
  const isLoading = queryStatus === "loading" || isUploadingToS3;

  useEffect(() => {
    if (response) {
      dispatch(fetchChatById(response.chat_id));
    }
  }, [dispatch, response]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        💭 Ask a Question
      </h2>

      {/* Text Input */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something based on your uploaded materials..."
        className="w-full h-24 border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        disabled={isLoading}
      />

      {/* Image Upload Section */}
      <div className="mt-4">
        <input
          title="im"
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex gap-2 mb-3">
          {/* Domain select button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDomainDropdown((s) => !s)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Select domain"
              aria-label="Select domain"
            >
              <span>🔬</span>
              <span className="capitalize">{domain}</span>
            </button>

            {showDomainDropdown && (
              <div className="absolute z-40 mt-2 w-40 bg-white border rounded shadow-sm">
                {["science","physics","chemistry","maths","biology","general"].map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDomain(d); setShowDomainDropdown(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm capitalize"
                    type="button"
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleUploadButtonClick}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>📷</span>
            Upload Image
          </button>

          {selectedImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              <span>❌</span>
              Remove
            </button>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-32 rounded-lg border border-gray-300"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              File: {selectedImage?.name} ({(selectedImage?.size || 0 / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAsk}
          disabled={isLoading}
          className={`flex-1 px-5 py-2 rounded-lg font-medium text-white transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {queryStatus === "loading" ? "Thinking..." : "Ask Text Question"}
        </button>

        {selectedImage && (
          <button
            onClick={handleImageQuery}
            disabled={isLoading}
            className={`flex-1 px-5 py-2 rounded-lg font-medium text-white transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUploadingToS3 ? "Uploading to S3..." : 
             queryStatus === "loading" ? "Processing Image..." : "Ask from Image"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">❌ {error}</p>
      )}

      {response && (
        <div>
          <ResponseCard response={response} />
          <div className="border-t mt-4 text-sm text-gray-500">
            {chatConversation && chatConversation.conversations.length > 0 && chatConversation.conversations.map((conversation) => (
              <div key={conversation.id} className="mt-4">
                📄 {conversation.query_by}: <span className="font-semibold">{conversation.query}</span><br/>
                🗂️ {conversation.answer_by}: <span className="font-medium">{conversation.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};