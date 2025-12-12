// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Now with S3 image upload before processing
// ============================================

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { askQuery, resetStatus } from "../../store/slices/assistantSlice";
// import { ResponseCard } from "./ResponseCard";
import { fetchChatById } from "../../store/slices/conversationsSlice";
import { getS3Url } from "../../utilities/awsUtils";
import { AnimatedTextAreaInput } from "./AnimatedTextAreaInput";
import { useLocation, useSearchParams } from "react-router-dom";
import { getTeacherDetails } from "../../store/slices/teachersSlice";



export const QueryBoxChat: React.FC<{
  setReplyContext: (context: string | null) => void,
  replyContext?: string | null,
  setSelectedData: (data: string | null) => void,
  selectedData: string | null,
  selectedDocument: string | null,
  setSelectedDocument: (data: string | null) => void,
  teacher_user_id?: string | null,
  student_user_id?: string | null,
  chatId?: string | null,
  previousConversationId?: string | null
}> = ({
  replyContext,
  teacher_user_id,
  student_user_id,
  chatId,
  previousConversationId,
  setReplyContext,
  setSelectedData,
  selectedData,
  selectedDocument,
  setSelectedDocument,
}) => {
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { queryStatus, response, error } = useAppSelector(
      (state) => state.assistant
    );
    const { teacher_details } = useAppSelector((state) => state.teachers);
    const [question, setQuestion] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null | undefined>(null);
    const [isUploadingToS3, setIsUploadingToS3] = useState(false);
    const [domain, setDomain] = useState("general");
    const [chat_space, setChatSpace] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle text query
    const handleAsk = async () => {
      if (!question.trim()) return alert("Please enter a question!");

      const result = await dispatch(askQuery({
        text: question,
        userId: user?._id || '',
        chatId: chatId || response?.chat_id || null,
        previousConversation: previousConversationId || response?.conversation_id || null,
        domain_expertise: domain,
        teacher_id: teacher_user_id,
        student_id: student_user_id,
        subject: `general ${domain}`, // You can make this dynamic if needed
        level: "intermediate",   // You can make this dynamic if needed
        chat_space: chat_space as string,
        reply_context: replyContext as string,
        selected_document: JSON.stringify(selectedDocument),
      }));

      // If successful, reset image selection
      if (askQuery.fulfilled.match(result)) {
        setSelectedImage(null);
        setImagePreview(null);
        setReplyContext(null);
        setSelectedDocument(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        console.log('✅ Image query completed successfully');
      }
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
        // const s3Url = "https://usethisbucketforupload.s3.ap-south-1.amazonaws.com/uploads/page1selectedarea8104911000902ChemicalBondingNotesGautamipdf.jpg"
        console.log('✅ Image uploaded to S3:', s3Url);

        const result = await dispatch(askQuery({
          text: question,
          userId: user?._id || '',
          chatId: chatId || response?.chat_id || null,
          previousConversation: previousConversationId || response?.conversation_id || null,
          domain_expertise: domain,
          teacher_id: teacher_user_id,
          student_id: student_user_id,
          subject: `general ${domain}`, // make this dynamic if needed
          level: "intermediate",   // make this dynamic if needed
          chat_space: chat_space as string,
          s3_url: s3Url,
          selected_document: JSON.stringify(selectedDocument),
        }));

        // If successful, reset image selection
        if (askQuery.fulfilled.match(result)) {
          setSelectedImage(null);
          setImagePreview(null);
          setReplyContext(null);
          setSelectedDocument(null);
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
      setSelectedData(null);

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

      if (teacher_user_id) {
        dispatch(getTeacherDetails(teacher_user_id));
      }
    }, [dispatch, response, teacher_user_id]);

    useEffect(() => {
      if (teacher_details) {
        setDomain(teacher_details?.subjects?.[0] as string);
      }

      const document_id = searchParams.get("document");
      const chat_space = document_id ? `${pathname.split("/").splice(1).join("/")}?document=${document_id}` : pathname.split("/").splice(1).join("/");
      setChatSpace(chat_space);
    }, [teacher_details, chat_space]);

    useEffect(() => {
      if (selectedData) {
        try {
          const data = JSON.parse(selectedData);
          if (data.image) {
            setImagePreview(data.image);

            // Convert base64 to File
            const arr = data.image.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], `${data.filename}.jpg`, { type: mime });
            setSelectedImage(file);

            // Clear selectedData after processing
            setSelectedData(null);
          }
        } catch (e) {
          console.error("Error parsing selectedData", e);
        }
      }
    }, [selectedData, setSelectedData]);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Image Upload Section */}
        {replyContext && (
          <div className="text-xs text-gray-400 truncate m-1 p-1 h-12 bg-slate-100 rounded-lg">
            <div className="p-1 font-semibold flex justify-between items-center">
              <p className="font-semibold">Reply:</p>
              <i className="fi fi-rr-cross text-red-500 cursor-pointer" onClick={() => setReplyContext(null)}></i>
            </div>
            <div className="p-1 truncate">
              {replyContext}
            </div>
          </div>
        )}
        <div className="bg-white border border-blue-100 rounded-2xl hover:shadow-lg transition-shadow focus:ring-1 focus:ring-green2 focus:outline p-2">
          <div className={`grid ${selectedImage ? "grid-cols-6" : "grid-cols-5"}`}>
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
                        className={`absolute -top-1 -right-1 flex items-center justify-center p-0.5 rounded-full font-medium transition ${isLoading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                      >
                        <i className="fi fi-rr-cross-small text-xs leading-none flex items-center justify-center"></i>
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
            <div className="col-span-5 bg-white">
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
                className={`flex items-center gap-2 p-3 rounded-full font-medium transition hover:shadow-md ${isLoading
                  ? "bg-logoPink cursor-not-allowed"
                  : "bg-logoPink hover:bg-logoPurple"
                  }`}
              >
                <i className="fi fi fi-br-camera-viewfinder flex items-center justify-center text-white" />
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
                  className={`flex-1 px-5 py-2 rounded-full font-medium text-white transition ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-logoBlue to-logoViolet hover:shadow-lg hover:font-bold"
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
                  className={`flex-1 px-5 py-2 rounded-full font-medium text-white transition ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-logoBlue to-logoViolet hover:shadow-lg hover:font-bold"
                    }`}
                >
                  {queryStatus === "loading" ? "Thinking..." : "Ask"}
                </button>
              )}
            </div>
          </div>
        </div>


        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">❌ {error}</p>
        )}


      </div>
    );
  };