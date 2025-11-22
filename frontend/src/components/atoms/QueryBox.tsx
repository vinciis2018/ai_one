// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Now with S3 image upload before processing
// ============================================

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { askQuery, askImageQuery } from "../../store/slices/assistantSlice";
import { ResponseCard } from "./ResponseCard";
import { fetchChatById } from "../../store/slices/conversationsSlice";
import { getS3Url } from "../../utilities/awsUtils";

import type { DocumentItem } from "../../store/slices/documentsSlice";

interface QueryBoxProps {
  documentContext?: DocumentItem | null;
}

export const QueryBox: React.FC<QueryBoxProps> = ({ documentContext }) => {
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
    if (!user?._id) return alert("Please login first!");

    await dispatch(askQuery({
      text: question,
      userId: user?._id || '',
      chatId: response?.chat_id || "",
      previousConversation: response?.conversation_id || "",
      domain_expertise: domain,
      s3_url: documentContext?.s3_url,
    }));
    setQuestion(""); // Clear input after asking
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
    if (!user?._id) return alert("Please login first!");

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
        setQuestion("");
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


  const domains = [{
    key: 1,
    label: "Science",
    value: "science",
    icon: "fi-br-physics",
  }, {
    key: 2,
    label: "Physics",
    value: "physics",
    icon: "fi-br-magnet",
  }, {
    key: 3,
    label: "Chemistry",
    value: "chemistry",
    icon: "fi-br-flask-gear",
  }, {
    key: 4,
    label: "Maths",
    value: "maths",
    icon: "fi-br-square-root",
  }, {
    key: 5,
    label: "Biology",
    value: "biology",
    icon: "fi-br-dna",
  }, {
    key: 6,
    label: "General",
    value: "general",
    icon: "fi-br-messages-question",
  }];


  // Add this inside the QueryBox component, before the return statement
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholders = useMemo(() => [
    "Ask your queries and get answers based on your collective notes...",
    "How to find out the dimension of magnetic flux?",
    "What is the bi-product in redox reaction?",
    "What is the probability of getting 3 sixes on rolling 11 dices?",
    "What is the formula of photosynthesis?",
    imagePreview ? "Is the solution correct in the uploaded image?" : "Upload and image of your notes and ask your query from it..."
  ], [imagePreview]);

  // Update the typing effect
  useEffect(() => {
    const currentText = placeholders[currentIndex % placeholders.length];

    if (!isDeleting) {
      // Typing animation
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setPlaceholderText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 50); // Typing speed
        return () => clearTimeout(timeout);
      } else {
        // Show full text for 2 seconds
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting animation
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setPlaceholderText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 30); // Deleting speed
        return () => clearTimeout(timeout);
      } else {
        // Move to next placeholder
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % placeholders.length);
        setCharIndex(0);
      }
    }
  }, [charIndex, currentIndex, isDeleting, placeholders]);


  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      {/* Chat History (Visible if documentContext is present or if there's history) */}
      {(documentContext || (chatConversation && chatConversation.conversations.length > 0)) && (
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 min-h-[200px] max-h-[500px]">
          {documentContext && (
            <div className="flex justify-center mb-4">
              <span className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
                <i className="fi fi-rr-document"></i>
                Chatting with {documentContext.filename}
              </span>
            </div>
          )}

          {chatConversation?.conversations.map((conversation) => (
            <div key={conversation.id} className="space-y-2">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-black text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                  {conversation.query}
                </div>
              </div>
              {/* AI Answer */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[90%] text-sm shadow-sm">
                  <div className="font-medium mb-1 text-xs text-purple-600 flex items-center gap-1">
                    <i className="fi fi-rr-sparkles"></i> AI Assistant
                  </div>
                  {conversation.answer}
                </div>
              </div>
            </div>
          ))}

          {response && !chatConversation?.conversations.some(c => c.answer === response.answer) && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-end">
                <div className="bg-black text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                  {question || "..."}
                </div>
              </div>
              <div className="flex justify-start">
                <ResponseCard response={response} />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-gray-500">
                Thinking...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border border-blue-100 rounded-2xl hover:shadow-lg transition-shadow focus-within:ring-1 focus-within:ring-green focus-within:outline-none p-2">
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
                      className={`absolute -top-2 -right-2 flex items-center px-2 py-1 rounded-full font-medium transition ${isLoading
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
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={placeholderText}
              className="w-full h-24 rounded-lg p-3 text-gray-700 border-none focus:outline-none focus:ring-0 resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (selectedImage) handleImageQuery();
                  else handleAsk();
                }
              }}
            />
          </div>
        </div>


        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUploadButtonClick}
              disabled={isLoading}
              className={`flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 ${isLoading
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDomainDropdown((s) => !s)}
                disabled={isLoading}
                className={`flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 ${isLoading ? "bg-baigeLight cursor-not-allowed" : "bg-baigeLight hover:bg-gray-200"
                  }`}
                title="Select domain"
                aria-label="Select domain"
              >
                <i className={`fi ${domains.find((d) => d.value === domain)?.icon} flex items-center justify-center text-violet`} />
              </button>

              {showDomainDropdown && (
                <div className="absolute z-40 mt-2 w-40 bg-white border rounded shadow-sm bottom-full mb-2">
                  {domains.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => { setDomain(d.value); setShowDomainDropdown(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm capitalize"
                      type="button"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {selectedImage ? (
              <button
                onClick={handleImageQuery}
                disabled={isLoading}
                type="button"
                className={`flex-1 px-5 py-2 rounded-full font-medium text-white transition ${isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green hover:bg-green2"
                  }`}
              >
                {isUploadingToS3 ? "Uploading..." :
                  queryStatus === "loading" ? "Analysing..." : "Ask"}
              </button>
            ) : (
              <button
                onClick={handleAsk}
                disabled={isLoading}
                type="button"
                className={`flex-1 px-5 py-2 rounded-full font-medium text-white transition ${isLoading
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

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">❌ {error}</p>
      )}
    </div>
  );
};