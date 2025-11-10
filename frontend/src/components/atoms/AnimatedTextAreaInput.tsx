// ============================================
// QueryBox.tsx
// Lets users ask questions to the AI Assistant
// Now with S3 image upload before processing
// ============================================

import React, { useEffect, useState, useMemo } from "react";
// import { ResponseCard } from "./ResponseCard";


export const AnimatedTextAreaInput: React.FC<{
  domain: string,
  imagePreview?: string | null,
  isLoading?: boolean,
  question?: string,
  setQuestion?: (question: string) => void,
}> = ({domain, imagePreview, isLoading, question, setQuestion }) => {
  
  // Add this inside the QueryBox component, before the return statement
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholders = useMemo(() => [
    "Ask your queries and get answers based on your collective notes...",
    domain === "physics" 
      ? "How to find out the dimension of magnetic flux?" : domain === "chemistry"
      ? "What is the bi-product in redox reaction?" : domain === "biology" 
      ? "What is the formula of photosynthesis?" : domain === "maths" 
      ? "What is the probability of getting 3 sixes on rolling 11 dices?" : 
      "Do you have any doubts?",
    imagePreview ? "Is the solution correct in the uploaded image?" : "Upload an image of your notes and ask your query from it..." 
  ], [imagePreview, domain]);

  // Update the typing effect
  useEffect(() => {
    const currentText = placeholders[currentIndex % placeholders.length] as string;
    
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
      <textarea
        value={question}
        onChange={(e) => setQuestion?.(e.target.value)}
        placeholder={placeholderText}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 w-full h-24 rounded-lg p-3 text-gray-700 border-none focus:outline-none focus:ring-0 resize-none"
        disabled={isLoading}
      />
  );
};