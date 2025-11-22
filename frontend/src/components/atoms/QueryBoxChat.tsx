// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Now with S3 image upload before processing
// ============================================

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { askQuery, askImageQuery, resetStatus } from "../../store/slices/assistantSlice";
// import { ResponseCard } from "./ResponseCard";
import { fetchChatById } from "../../store/slices/conversationsSlice";
// import { getS3Url } from "../../utilities/awsUtils";
import { AnimatedTextAreaInput } from "./AnimatedTextAreaInput";
import { useLocation } from "react-router-dom";


export const QueryBoxChat: React.FC<{
  domain: string,
  teacher_user_id?: string | null,
  student_user_id?: string | null,
  chatId?: string | null,
  previousConversationId?: string | null
}> = ({domain, teacher_user_id, student_user_id, chatId, previousConversationId}) => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { queryStatus, response, error } = useAppSelector(
    (state) => state.assistant
  );
  const [question, setQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null | undefined>(null);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text query
  const handleAsk = async () => {
    if (!question.trim()) return alert("Please enter a question!");
    await dispatch(askQuery({
      text: question,
      userId: user?._id || '',
      chatId: chatId || response?.chat_id || null,
      previousConversation: previousConversationId || response?.conversation_id || null,
      domain_expertise: domain,
      teacher_id: teacher_user_id,
      student_id: student_user_id,
      subject: `general ${domain}`, // You can make this dynamic if needed
      level: "intermediate",   // You can make this dynamic if needed
      chat_space: pathname.split("/").splice(1).join("/")
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
      // const s3Url = await getS3Url(selectedImage);
      const s3Url = "https://usethisbucketforupload.s3.ap-south-1.amazonaws.com/uploads/WhatsAppImage20251106at084945.jpeg"
      console.log('✅ Image uploaded to S3:', s3Url);

      // Step 2: Prepare payload for backend
      const payload = {
        text: question,
        fileName: selectedImage.name,
        s3Url: s3Url,
        userId: user._id,
        teacher_id: teacher_user_id,
        student_id: student_user_id,
        chatId: chatId || response?.chat_id || "",
        previousConversation: previousConversationId || response?.conversation_id || "",
        domain_expertise: domain,
        file_type: selectedImage.type,
        file_size: selectedImage.size,
        source_type: user?.role || 'user',
        // Add any additional fields your backend expects
        subject: `general ${domain}`, // You can make this dynamic if needed
        level: "intermediate",   // You can make this dynamic if needed
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
      setQuestion("");
      resetStatus();
    }

  
  }, [dispatch, response]);


 
  return (
    <div className="max-w-4xl mx-auto">
      {/* Image Upload Section */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-100 rounded-2xl hover:shadow-lg transition-shadow focus:ring-1 focus:ring-green focus:outline p-2">
        <div className={`grid ${selectedImage ? "grid-cols-4" : "grid-cols-3"}`}>
          {/* Image Preview */}
          {selectedImage && (
            <div className="col-span-1">
              {imagePreview && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                      className={`absolute -top-2 -right-2 flex items-center px-2 py-1 rounded-full font-medium transition ${
                        isLoading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      <span>❌</span>
                    </button>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-32 rounded-lg border border-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {selectedImage?.name} ({(selectedImage?.size || 0 / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
            </div>
          )}
    
          {/* Text Input */}
          <div className="col-span-3">
            <AnimatedTextAreaInput
              domain={domain}
              imagePreview={imagePreview}
              isLoading={isLoading}
              question={question}
              setQuestion={setQuestion}
            />
          </div>
        </div>
        
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUploadButtonClick}
              disabled={isLoading}
              className={`flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 ${
                isLoading
                  ? "bg-baigeLight cursor-not-allowed"
                  : "bg-baigeLight hover:bg-gray-200"
              }`}
            >
              <i className="fi fi fi-br-camera-viewfinder flex items-center justify-center text-orange2" />
              <input
                title="im"
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
              />
            </button>
            
          </div>
          <div className="flex gap-3">
            {selectedImage ? (
              <button
                onClick={handleImageQuery}
                disabled={isLoading}
                type="button"
                className={`flex-1 px-5 py-2 rounded-full font-medium text-white transition ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green hover:bg-green2"
                }`}
              >
                {isUploadingToS3 ? "Uploading to S3..." : 
                queryStatus === "loading" ? "analysing..." : "Ask"}
              </button>
            ) : (
              <button
                onClick={handleAsk}
                disabled={isLoading}
                type="button"
                className={`flex-1 px-5 py-2 rounded-full font-medium text-white transition ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green hover:bg-green2"
                }`}
              >
                {queryStatus === "loading" ? "Thinking..." : "Ask"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}


      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">❌ {error}</p>
      )}

      {/* {response && (
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
      )} */}
    </div>
  );
};