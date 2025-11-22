import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearSelectedDocument, fetchDocumentById } from "../../store/slices/documentsSlice";
import { createTranscription, saveNotes, generateQuiz, generateNotes, generateMCQ, createPersonalTricks } from "../../store/slices/notesSlice";
import { useParams, useNavigate } from "react-router-dom";
import { FullLayout } from "../../layouts/AppLayout";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'katex/dist/katex.min.css';
import { TranscriptionTab } from "./components/TranscriptionTab";
import { NotesTab } from "./components/NotesTab";
import { QuizTab } from "./components/QuizTab";
import { MCQTab } from "./components/MCQTab";
import { PersonalTricksTab } from "./components/PersonalTricksTab";
import { PYQTab } from "./components/PYQTab";
// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();



export const DocumentDetailsPage: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedDocument, selectedStatus } = useAppSelector(
    (state) => state.documents
  );
  const { user } = useAppSelector((state) => state.auth);
  const { transcriptionStatus, saveStatus, quizStatus, quizData, generateNotesStatus, generateNotesData, mcqStatus, mcqData } = useAppSelector((state) => state.notes);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes' | 'quiz' | 'mcq' | 'personalTricks' | 'pyq'>('transcription');
  const [notesDescription, setNotesDescription] = useState<Array<{
    page: number;
    transcription: string;
    notes: string;
    quiz: { easy: string[], medium: string[], hard: string[] };
    mcq: {
      easy: Array<{ question: string, options: string[], answer: string }>;
      medium: Array<{ question: string, options: string[], answer: string }>;
      hard: Array<{ question: string, options: string[], answer: string }>;
    };
    personalTricks?: string[];
    pyq?: any[];
  }>>([]);
  const [sentences, setSentences] = useState<string[]>([]);
  const isUserEditing = React.useRef(false);

  // Update transcription from sentences (called when reordering or editing)
  const updateTranscriptionFromSentences = (newSentences: string[]) => {
    isUserEditing.current = true;
    setSentences(newSentences);

    // Join sentences with space to form the full transcription
    // We need to be careful not to double spaces if sentences already end with space
    // But for simplicity, let's join with space and trim later if needed.
    // Actually, if we split by space, we should join by space.
    // If we split by newline, we join by newline.
    // Our split logic was complex. Let's just join with space for now as it's the most common case.
    const fullText = newSentences.join(' ');

    setNotesDescription(prev => {
      const newNotes = [...prev];
      const noteIndex = newNotes.findIndex(n => n.page === pageNumber);
      if (noteIndex >= 0) {
        newNotes[noteIndex] = { ...newNotes[noteIndex], transcription: fullText };
      } else {
        newNotes.push({
          page: pageNumber,
          transcription: fullText,
          notes: '',
          quiz: { easy: [], medium: [], hard: [] },
          mcq: { easy: [], medium: [], hard: [] }
        });
      }
      return newNotes;
    });

    // Reset the flag after a short delay to allow the state update to propagate without triggering useEffect split
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // Sync sentences when page changes or notes load
  useEffect(() => {
    if (isUserEditing.current) return;

    const currentNote = notesDescription.find(n => n.page === pageNumber);
    if (currentNote) {
      const text = currentNote.transcription;
      // Split by diagram blocks first
      const parts = text.split(/(\[DIAGRAM:[\s\S]*?\[\/DIAGRAM\])/);
      let finalSentences: string[] = [];

      parts.forEach(part => {
        if (part.startsWith('[DIAGRAM:')) {
          finalSentences.push(part);
        } else {
          // Split text by sentence terminators or new lines
          let splits = part.split(/(?<=[.!?])\s+|\n+/);
          splits = splits.filter(s => s.trim().length > 0);
          finalSentences.push(...splits);
        }
      });

      setSentences(finalSentences);
    } else {
      setSentences([]);
    }
  }, [pageNumber, notesDescription]);

  useEffect(() => {
    if (documentId) dispatch(fetchDocumentById(documentId));
    return () => {
      dispatch(clearSelectedDocument());
    };
  }, [documentId, dispatch]);

  // Load existing notes from selectedDocument
  useEffect(() => {
    if (selectedDocument?.notes_description && selectedDocument.notes_description.length > 0) {
      // Transform old quiz structure to new structure if necessary
      const transformedNotes = selectedDocument.notes_description.map(note => {
        const quiz = note.quiz as any;
        const multipleChoice = (note as any).mcq;

        // Handle old nested structure: quiz: { subjective: {...}, mcq: {...} }
        if (quiz && quiz.subjective && quiz.mcq) {
          return {
            ...note,
            quiz: quiz.subjective,
            mcq: quiz.mcq
          };
        }

        // Handle legacy structure: quiz: { easy: [...], medium: [...], hard: [...] }
        if (quiz && (quiz.easy || quiz.medium || quiz.hard) && !multipleChoice) {
          return {
            ...note,
            quiz: {
              easy: quiz.easy || [],
              medium: quiz.medium || [],
              hard: quiz.hard || []
            },
            mcq: {
              easy: [],
              medium: [],
              hard: []
            }
          };
        }

        // Already in correct format or needs default values
        return {
          ...note,
          quiz: quiz || { easy: [], medium: [], hard: [] },
          mcq: multipleChoice || { easy: [], medium: [], hard: [] }
        };
      });

      setNotesDescription(transformedNotes as any);
    }
  }, [selectedDocument?.notes_description]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const handleTranscribe = async () => {
    if (!selectedDocument || !user?._id) {
      alert("Please ensure document is loaded and you are logged in");
      return;
    }

    try {
      const result = await dispatch(createTranscription({
        page_number: pageNumber,
        file_url: selectedDocument.s3_url,
        document_id: selectedDocument.id,
        user_id: user._id,
      })).unwrap();

      // Save transcription to state
      // result is a NoteItem object with transcription property
      if (result && result.transcription) {
        setNotesDescription(prev => {
          // Remove existing transcription for this page if any
          const filtered = prev.filter(note => note.page !== pageNumber);
          // Add new transcription
          return [...filtered, {
            page: pageNumber,
            transcription: result.transcription || '',
            notes: '',
            quiz: { easy: [], medium: [], hard: [] },
            mcq: { easy: [], medium: [], hard: [] }
          }].sort((a, b) => a.page - b.page);
        });
        alert(`Transcription created for page ${pageNumber}!`);
      } else {
        alert('Transcription created but no content returned.');
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to create transcription. Please try again.");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedDocument) {
      alert("No document selected");
      return;
    }

    if (notesDescription.length === 0) {
      alert("No transcriptions to save");
      return;
    }

    try {
      await dispatch(saveNotes({
        document_id: selectedDocument.id,
        notes: notesDescription,
      })).unwrap();

      alert(`Successfully saved ${notesDescription.length} transcription(s)!`);
    } catch (error) {
      console.error("Save notes error:", error);
      alert("Failed to save notes. Please try again.");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocument) {
      alert("No document selected");
      return;
    }

    try {
      await dispatch(generateQuiz({
        page_number: pageNumber,
        document_id: selectedDocument.id,
        num_questions: 3,
        transcription: selectedDocument?.notes_description?.find((note: any) => note.page === pageNumber)?.transcription,
      })).unwrap();

      // Success alert handled by useEffect or here
      alert("Quiz generated successfully! Check the console for now (UI coming soon).");
    } catch (error) {
      console.error("Generate quiz error:", error);
      alert("Failed to generate quiz. Please try again.");
    }
  };

  useEffect(() => {
    if (quizStatus === 'succeeded' && quizData) {
      console.log("Quiz Data:", quizData);
      // In a real app, we would open a modal here
    }
  }, [quizStatus, quizData]);


  const handleGenerateMCQ = async () => {
    if (!selectedDocument) {
      alert("No document selected");
      return;
    }

    try {
      await dispatch(generateMCQ({
        page_number: pageNumber,
        document_id: selectedDocument.id,
        transcription: selectedDocument?.notes_description?.find((note: any) => note.page === pageNumber)?.transcription,
        num_questions: 15,
      })).unwrap();

      alert("MCQ generated successfully! Check the Quiz tab.");
    } catch (error) {
      console.error("Generate MCQ error:", error);
      alert("Failed to generate MCQ. Please try again.");
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedDocument) {
      alert("No document selected");
      return;
    }

    try {
      await dispatch(generateNotes({
        page_number: pageNumber,
        document_id: selectedDocument.id,
        transcription: selectedDocument?.notes_description?.find((note: any) => note.page === pageNumber)?.transcription,
      })).unwrap();

      alert("Notes generated successfully! Check the console for now.");
    } catch (error) {
      console.error("Generate notes error:", error);
      alert("Failed to generate notes. Please try again.");
    }
  };


  const handleUpdateTricks = (page: number, tricks: string[]) => {
    setNotesDescription(prev => {
      const newNotes = [...prev];
      const noteIndex = newNotes.findIndex(n => n.page === page);
      if (noteIndex >= 0) {
        newNotes[noteIndex] = { ...newNotes[noteIndex], personalTricks: tricks };
      } else {
        newNotes.push({
          page: page,
          transcription: '',
          notes: '',
          quiz: { easy: [], medium: [], hard: [] },
          mcq: { easy: [], medium: [], hard: [] },
          personalTricks: tricks
        });
      }
      return newNotes;
    });
  };

  useEffect(() => {
    if (generateNotesStatus === 'succeeded' && notesDescription.find((note: any) => note.page === pageNumber)?.notes) {
      console.log("Generated Notes Data:", notesDescription.find((note: any) => note.page === pageNumber)?.notes);
      // In a real app, we would display these notes
    }
  }, [generateNotesStatus, notesDescription]);

  if (!documentId) return null;

  // Check if current page already has a transcription
  const hasTranscriptionForCurrentPage = notesDescription.some(note => note.page === pageNumber);

  const renderContent = () => {
    if (!selectedDocument) return null;

    const fileUrl = selectedDocument.s3_url;
    const fileName = selectedDocument.filename || "";
    const fileExt = fileName.split(".").pop()?.toLowerCase();

    if (fileExt === "pdf") {
      return (
        <div className="flex flex-col items-center w-full h-full">
          <div className="flex-1 overflow-auto w-full flex justify-center bg-gray-100 p-4 rounded-xl">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error('Error loading PDF:', error)}
              className="flex flex-col items-center"
              loading={
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <i className="fi fi-br-circle animate-spin text-3xl mb-3" />
                  <p>Loading PDF...</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                  <i className="fi fi-rr-exclamation text-3xl mb-3" />
                  <p>Failed to load PDF.</p>
                  <p className="text-xs text-gray-500 mt-2">Check console for details.</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
                width={600} // Adjust width as needed or make it responsive
              />
            </Document>
          </div>

          {/* Navigation Controls */}
          {numPages && (
            <div className="flex items-center gap-4 mt-4 bg-white p-2 rounded-full shadow-sm border border-gray-200">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={previousPage}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fi fi-rr-angle-left text-lg flex"></i>
              </button>
              <p className="text-sm font-medium text-gray-700">
                Page {pageNumber} of {numPages}
              </p>
              <button
                type="button"
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fi fi-rr-angle-right text-lg flex"></i>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (["jpg", "jpeg", "png", "gif"].includes(fileExt || "")) {
      return (
        <div className="flex justify-center bg-gray-50 rounded-xl border border-gray-200 p-4">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full h-auto max-h-[80vh] rounded-lg shadow-sm"
          />
        </div>
      );
    }

    if (["txt", "md"].includes(fileExt || "")) {
      return (
        <pre className="whitespace-pre-wrap text-sm text-gray-800 p-6 border border-gray-200 rounded-xl bg-white shadow-sm max-h-[80vh] overflow-y-auto font-mono leading-relaxed">
          {selectedDocument.content || "No text content available."}
        </pre>
      );
    }

    return (
      <div className="text-center p-12 border border-gray-200 rounded-xl bg-gray-50">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
          <i className="fi fi-rr-document"></i>
        </div>
        <p className="text-gray-500 mb-4 font-medium">
          File type not supported for preview.
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          <i className="fi fi-rr-download"></i>
          Download {fileName}
        </a>
      </div>
    );
  };

  return (
    <FullLayout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600"
              aria-label="Go back"
            >
              <i className="fi fi-sr-arrow-small-left text-2xl flex"></i>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedDocument?.filename || "Document Viewer"}
              </h1>
              {selectedDocument && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span className="uppercase tracking-wider font-semibold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    {selectedDocument.source_type}
                  </span>
                  <span>•</span>
                  <span>Uploaded {new Date(selectedDocument.created_at).toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!hasTranscriptionForCurrentPage ? (
                <button
                  onClick={handleTranscribe}
                  disabled={transcriptionStatus === 'loading'}
                  className="px-4 py-2 flex items-center gap-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  title="Transcribe Page"
                >
                  {transcriptionStatus === 'loading' ? (
                    <>
                      <i className="fi fi-br-circle animate-spin text-xs"></i>
                      <span>Transcribing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-microphone"></i>
                      <span>Transcribe</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleGenerateNotes}
                    disabled={generateNotesStatus === 'loading'}
                    className="px-4 py-2 flex items-center gap-2 rounded-lg bg-orange2 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title="Generate Notes"
                  >
                    {generateNotesStatus === 'loading' ? (
                      <>
                        <i className="fi fi-br-circle animate-spin text-xs"></i>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <i className="fi fi-rr-magic-wand"></i>
                        <span>Notes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={quizStatus === 'loading'}
                    className="px-4 py-2 flex items-center gap-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title="Generate Quiz"
                  >
                    {quizStatus === 'loading' ? (
                      <>
                        <i className="fi fi-br-circle animate-spin text-xs"></i>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <i className="fi fi-rr-list-check"></i>
                        <span>Quiz</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGenerateMCQ}
                    disabled={mcqStatus === 'loading'}
                    className="px-4 py-2 flex items-center gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title="Generate MCQ"
                  >
                    {mcqStatus === 'loading' ? (
                      <>
                        <i className="fi fi-br-circle animate-spin text-xs"></i>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <i className="fi fi-rr-checkbox"></i>
                        <span>MCQ</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Save Button - Always Visible */}
              <button
                onClick={handleSaveNotes}
                disabled={saveStatus === 'loading' || notesDescription.length === 0}
                className="px-4 py-2 flex items-center gap-2 rounded-lg bg-green text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Save Notes"
              >
                {saveStatus === 'loading' ? (
                  <>
                    <i className="fi fi-br-circle animate-spin text-xs"></i>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fi fi-rr-disk"></i>
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
            {/* Left Column: Document Viewer */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 overflow-hidden flex flex-col h-full">
              {selectedStatus === "loading" && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <i className="fi fi-br-circle animate-spin text-3xl mb-3" />
                  <p>Loading document...</p>
                </div>
              )}

              {selectedStatus === "failed" && (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                  <i className="fi fi-rr-exclamation text-3xl mb-3" />
                  <p>Failed to load document details.</p>
                </div>
              )}

              {selectedStatus === "succeeded" && selectedDocument && (
                <div className="h-full overflow-hidden p-1 flex flex-col">
                  {renderContent()}
                </div>
              )}
            </div>

            {/* Right Column: Tabs & Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('transcription')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'transcription'
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  <i className="fi fi-rr-edit"></i>
                  <span>Transcription</span>
                  {activeTab === 'transcription' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full mx-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'notes'
                    ? 'text-orange-600 bg-orange-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  <i className="fi fi-rr-magic-wand"></i>
                  <span>Notes</span>
                  {activeTab === 'notes' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-t-full mx-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'quiz'
                    ? 'text-violet-600 bg-violet-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  <i className="fi fi-rr-list-check"></i>
                  <span>Quiz</span>
                  {activeTab === 'quiz' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-t-full mx-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('mcq')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'mcq'
                    ? 'text-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  <i className="fi fi-rr-checkbox"></i>
                  <span>MCQ</span>
                  {activeTab === 'mcq' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full mx-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('personalTricks')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'mcq'
                    ? 'text-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  <i className="fi fi-rr-lightbulb"></i>
                  <span>Tricks</span>
                  {activeTab === 'personalTricks' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full mx-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('pyq')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'pyq'
                    ? 'text-purple-600 bg-purple-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  <i className="fi fi-rr-calendar"></i>
                  <span>PYQ</span>
                  {activeTab === 'pyq' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full mx-4" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* TRANSCRIPTION TAB */}
                {activeTab === 'transcription' && (
                  <TranscriptionTab
                    pageNumber={pageNumber}
                    selectedDocument={selectedDocument}
                    notesDescription={notesDescription}
                    sentences={sentences}
                    updateTranscriptionFromSentences={updateTranscriptionFromSentences}
                    handleTranscribe={handleTranscribe}
                    transcriptionStatus={transcriptionStatus}
                  />
                )}

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                  <NotesTab
                    pageNumber={pageNumber}
                    notesDescription={notesDescription}
                    generateNotesData={generateNotesData}
                    generateNotesStatus={generateNotesStatus}
                    handleGenerateNotes={handleGenerateNotes}
                  />
                )}

                {/* QUIZ TAB - Subjective Questions Only */}
                {activeTab === 'quiz' && (
                  <QuizTab
                    pageNumber={pageNumber}
                    notesDescription={notesDescription}
                    quizData={quizData}
                    quizStatus={quizStatus}
                    handleGenerateQuiz={handleGenerateQuiz}
                  />
                )}

                {/* MCQ TAB - Multiple Choice Questions Only */}
                {activeTab === 'mcq' && (
                  <MCQTab
                    pageNumber={pageNumber}
                    notesDescription={notesDescription}
                    mcqData={mcqData}
                    mcqStatus={mcqStatus}
                    handleGenerateMCQ={handleGenerateMCQ}
                  />
                )}
                {activeTab === 'personalTricks' && (
                  <PersonalTricksTab
                    pageNumber={pageNumber}
                    notesDescription={notesDescription}
                    onUpdateTricks={handleUpdateTricks}
                  />
                )}
                {activeTab === 'pyq' && (
                  <PYQTab
                    pageNumber={pageNumber}
                    notesDescription={notesDescription}
                  />
                )}
              </div>
            </div>
          </div>
        </div >
      </div >
    </FullLayout >
  );
};
