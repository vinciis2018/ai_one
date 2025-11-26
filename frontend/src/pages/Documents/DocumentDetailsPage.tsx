
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearSelectedDocument, fetchDocumentById } from "../../store/slices/documentsSlice";
import { createTranscription, saveNotes, generateQuiz, generateNotes, generateMCQ } from "../../store/slices/notesSlice";
import { useParams, useNavigate } from "react-router-dom";
import { FullLayout } from "../../layouts/AppLayout";
import { NotesTab } from "./components/NotesTab";
import { QuizTab } from "./components/QuizTab";
import { MCQTab } from "./components/MCQTab";
import { PersonalTricksTab } from "./components/PersonalTricksTab";
import { PYQTab } from "./components/PYQTab";
import { TranscriptionTab } from "./components/TranscriptionTab";
import { cropImage } from "../../utilities/filesUtils";
import { DocumentViewer } from "./components/DocumentViewer";


export const DocumentDetailsPage: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedDocument, selectedStatus } = useAppSelector(
    (state) => state.documents
  );
  const { user } = useAppSelector((state) => state.auth);
  const { transcriptionStatus, saveStatus, quizStatus, quizData, generateNotesStatus, generateNotesData, mcqStatus, mcqData } = useAppSelector((state) => state.notes);

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
  const [pageImage, setPageImage] = useState<string | null>(null);

  const isUserEditing = React.useRef(false);

  // Clear pageImage when page changes to prevent stale cropping
  useEffect(() => {
    setPageImage(null);
  }, [pageNumber]);

  // Update transcription from sentences (called when reordering or editing)
  const updateTranscriptionFromSentences = (newSentences: string[]) => {
    isUserEditing.current = true;
    setSentences(newSentences);
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
      // Split logic including snippet blocks
      // Regex looks for [DIAGRAM:...] or [SNIPPET:...]
      const parts = text.split(/(\[(?:DIAGRAM|SNIPPET):[\s\S]*?\])/);
      let finalSentences: string[] = [];

      parts.forEach(part => {
        if (part.startsWith('[DIAGRAM:') || part.startsWith('[SNIPPET:')) {
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
      const transformedNotes = selectedDocument.notes_description.map((note: any) => {
        const quiz = note.quiz;
        const multipleChoice = note.mcq;
        if (quiz && quiz.subjective && quiz.mcq) {
          return { ...note, quiz: quiz.subjective, mcq: quiz.mcq };
        }
        if (quiz && (quiz.easy || quiz.medium || quiz.hard) && !multipleChoice) {
          return { ...note, quiz: { easy: quiz.easy || [], medium: quiz.medium || [], hard: quiz.hard || [] }, mcq: { easy: [], medium: [], hard: [] } };
        }
        return { ...note, quiz: quiz || { easy: [], medium: [], hard: [] }, mcq: multipleChoice || { easy: [], medium: [], hard: [] } };
      });
      setNotesDescription(transformedNotes);
    }
  }, [selectedDocument?.notes_description]);


  const handleTranscribe = async () => {
    if (!selectedDocument || !user?._id) {
      alert("Please ensure document is loaded and you are logged in");
      return;
    }

    if (!pageImage) {
      alert("Please wait for the page to finish loading.");
      return;
    }

    try {
      const result = await dispatch(createTranscription({
        // pageImage: pageImage,
        page_number: pageNumber,
        file_url: selectedDocument.s3_url,
        document_id: selectedDocument.id,
        user_id: user._id,
      })).unwrap();

      if (result && result.transcription) {
        setNotesDescription(prev => {
          const filtered = prev.filter(note => note.page !== pageNumber);
          return [...filtered, {
            page: pageNumber,
            transcription: result.transcription || '',
            notes: '',
            quiz: { easy: [], medium: [], hard: [] },
            mcq: { easy: [], medium: [], hard: [] }
          }].sort((a, b) => a.page - b.page);
        });
      } else {
        alert('Transcription created but no content returned.');
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to create transcription. Please try again.");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedDocument || notesDescription.length === 0) {
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
      alert("Failed to save notes.");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocument) return;
    try {
      await dispatch(generateQuiz({
        page_number: pageNumber,
        document_id: selectedDocument.id,
        num_questions: 3,
        transcription: notesDescription.find(n => n.page === pageNumber)?.transcription,
      })).unwrap();
      setActiveTab('quiz');
    } catch (error) {
      console.error("Generate quiz error:", error);
    }
  };

  const handleGenerateMCQ = async () => {
    if (!selectedDocument) return;
    try {
      await dispatch(generateMCQ({
        page_number: pageNumber,
        document_id: selectedDocument.id,
        transcription: notesDescription.find(n => n.page === pageNumber)?.transcription,
        num_questions: 15,
      })).unwrap();
      setActiveTab('mcq');
    } catch (error) {
      console.error("Generate MCQ error:", error);
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedDocument) return;
    try {
      await dispatch(generateNotes({
        page_number: pageNumber,
        document_id: selectedDocument.id,
        transcription: notesDescription.find(n => n.page === pageNumber)?.transcription,
      })).unwrap();
      setActiveTab('notes');
    } catch (error) {
      console.error("Generate notes error:", error);
    }
  };

  useEffect(() => {
    if (quizStatus === 'succeeded' && quizData) {
      const responsePage = quizData.page_number || pageNumber;
      setNotesDescription(prev => {
        const newNotes = [...prev];
        const noteIndex = newNotes.findIndex(n => n.page === responsePage);
        const quizContent = quizData.questions || quizData;

        if (noteIndex >= 0) {
          newNotes[noteIndex] = { ...newNotes[noteIndex], quiz: quizContent };
        } else {
          newNotes.push({
            page: responsePage,
            transcription: '', notes: '', quiz: quizContent, mcq: { easy: [], medium: [], hard: [] }
          });
        }
        return newNotes.sort((a, b) => a.page - b.page);
      });
    }
  }, [quizStatus, quizData]);

  useEffect(() => {
    if (mcqStatus === 'succeeded' && mcqData) {
      const responsePage = mcqData.page_number || pageNumber;
      setNotesDescription(prev => {
        const newNotes = [...prev];
        const noteIndex = newNotes.findIndex(n => n.page === responsePage);
        const mcqContent = mcqData.mcq || mcqData;

        if (noteIndex >= 0) {
          newNotes[noteIndex] = { ...newNotes[noteIndex], mcq: mcqContent };
        } else {
          newNotes.push({
            page: responsePage,
            transcription: '', notes: '', quiz: { easy: [], medium: [], hard: [] }, mcq: mcqContent
          });
        }
        return newNotes.sort((a, b) => a.page - b.page);
      });
    }
  }, [mcqStatus, mcqData]);

  useEffect(() => {
    if (generateNotesStatus === 'succeeded' && generateNotesData) {
      const responsePage = generateNotesData.page_number || pageNumber;
      setNotesDescription(prev => {
        const newNotes = [...prev];
        const noteIndex = newNotes.findIndex(n => n.page === responsePage);
        let notesContent = generateNotesData.generated_notes || generateNotesData.notes || generateNotesData.note || generateNotesData;
        if (typeof notesContent === 'object' && notesContent.notes) notesContent = notesContent.notes;

        if (noteIndex >= 0) {
          newNotes[noteIndex] = { ...newNotes[noteIndex], notes: notesContent };
        } else {
          newNotes.push({
            page: responsePage,
            transcription: '', notes: notesContent, quiz: { easy: [], medium: [], hard: [] }, mcq: { easy: [], medium: [], hard: [] }
          });
        }
        return newNotes.sort((a, b) => a.page - b.page);
      });
    }
  }, [generateNotesStatus, generateNotesData]);

  const handleUpdateTricks = (page: number, tricks: string[]) => {
    setNotesDescription(prev => {
      const newNotes = [...prev];
      const noteIndex = newNotes.findIndex(n => n.page === page);
      if (noteIndex >= 0) {
        newNotes[noteIndex] = { ...newNotes[noteIndex], personalTricks: tricks };
      } else {
        newNotes.push({ page: page, transcription: '', notes: '', quiz: { easy: [], medium: [], hard: [] }, mcq: { easy: [], medium: [], hard: [] }, personalTricks: tricks });
      }
      return newNotes;
    });
  };

  const handleImageSelection = async (selection: { box_2d: number[], pageNumber: number }) => {
    if (!pageImage) return;

    try {
      const croppedImageUrl = await cropImage(pageImage, selection.box_2d);

      const snippetId = `snippet-${Date.now()}`;

      const newBlock = {
        id: snippetId,
        type: 'drawing',
        content: 'Analyzing selection...',
        box_2d: selection.box_2d,
        imageUrl: croppedImageUrl,
        settings: { width: 50, align: 'center' }
      };

      const currentNote = notesDescription.find(n => n.page === pageNumber);
      let currentBlocks: any[] = [];
      try {
        currentBlocks = currentNote ? JSON.parse(currentNote.transcription) : [];
        if (!Array.isArray(currentBlocks)) throw new Error("Not array");
      } catch {
        if (currentNote?.transcription) {
          currentBlocks = [{ type: 'text', content: currentNote.transcription }];
        }
      }

      const updatedBlocks = [...currentBlocks, newBlock];

      setNotesDescription(prev => {
        const newNotes = [...prev];
        const noteIndex = newNotes.findIndex(n => n.page === pageNumber);
        if (noteIndex >= 0) {
          newNotes[noteIndex] = { ...newNotes[noteIndex], transcription: JSON.stringify(updatedBlocks) };
        } else {
          newNotes.push({
            page: pageNumber,
            transcription: JSON.stringify(updatedBlocks),
            notes: '', quiz: { easy: [], medium: [], hard: [] }, mcq: { easy: [], medium: [], hard: [] }
          });
        }
        return newNotes;
      });

      // analyzeSnippet(croppedImageUrl).then(explanation => {
      //    setNotesDescription(prev => {
      //        const newNotes = [...prev];
      //        const idx = newNotes.findIndex(n => n.page === pageNumber);
      //        if (idx >= 0) {
      //            try {
      //                const blocks = JSON.parse(newNotes[idx].transcription);
      //                const updated = blocks.map((b: any) => b.id === snippetId ? { ...b, content: explanation } : b);
      //                newNotes[idx] = { ...newNotes[idx], transcription: JSON.stringify(updated) };
      //            } catch (e) { console.error(e); }
      //        }
      //        return newNotes;
      //    });
      // });

    } catch (err) {
      console.error("Failed to add snippet", err);
    }
  };

  if (!documentId) return null;
  const hasTranscriptionForCurrentPage = notesDescription.some(note => note.page === pageNumber);

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
                  <button onClick={handleGenerateNotes} disabled={generateNotesStatus === 'loading'} className="px-4 py-2 flex items-center gap-2 rounded-lg bg-orange2 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm font-medium">
                    <i className="fi fi-rr-magic-wand"></i> Notes
                  </button>
                  <button onClick={handleGenerateQuiz} disabled={quizStatus === 'loading'} className="px-4 py-2 flex items-center gap-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium">
                    <i className="fi fi-rr-list-check"></i> Quiz
                  </button>
                  <button onClick={handleGenerateMCQ} disabled={mcqStatus === 'loading'} className="px-4 py-2 flex items-center gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium">
                    <i className="fi fi-rr-checkbox"></i> MCQ
                  </button>
                </>
              )}
              <button onClick={handleSaveNotes} disabled={saveStatus === 'loading' || notesDescription.length === 0} className="px-4 py-2 flex items-center gap-2 rounded-lg bg-green2 text-white hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium">
                <i className="fi fi-rr-disk"></i> Save
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-180px)]">
            {/* Left Column: Document Viewer */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex flex-col min-h-[400px] lg:min-h-0">
              {selectedStatus === "loading" && <div className="p-12 text-center text-gray-400">Loading...</div>}
              {selectedStatus === "succeeded" && selectedDocument && (
                <div className="p-1 flex flex-col h-full">
                  <DocumentViewer
                    selectedDocument={selectedDocument}
                    pageNumber={pageNumber}
                    onPageChange={setPageNumber}
                    onImageSelection={activeTab === 'transcription' ? handleImageSelection : undefined}
                    onPageRendered={setPageImage}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Tabs */}
            <div className="relative min-h-[500px] lg:h-full">
              <div className="lg:absolute lg:inset-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
                <div className="flex items-center border-b border-gray-100 overflow-x-auto">
                  {[
                    { id: 'transcription', label: 'Transcription', icon: 'fi-rr-edit', color: 'text-blue-600', bg: 'bg-blue-600' },
                    { id: 'notes', label: 'Notes', icon: 'fi-rr-magic-wand', color: 'text-orange-600', bg: 'bg-orange-600' },
                    { id: 'quiz', label: 'Quiz', icon: 'fi-rr-list-check', color: 'text-violet-600', bg: 'bg-violet-600' },
                    { id: 'mcq', label: 'MCQ', icon: 'fi-rr-checkbox', color: 'text-indigo-600', bg: 'bg-indigo-600' },
                    { id: 'personalTricks', label: 'Tricks', icon: 'fi-rr-lightbulb', color: 'text-indigo-600', bg: 'bg-indigo-600' },
                    { id: 'pyq', label: 'PYQ', icon: 'fi-rr-calendar', color: 'text-purple-600', bg: 'bg-purple-600' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-3 px-4 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? `${tab.color} bg-gray-50` : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <i className={`fi ${tab.icon}`}></i>
                      <span>{tab.label}</span>
                      {activeTab === tab.id && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.bg} rounded-t-full mx-2`} />}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  {activeTab === 'transcription' && (
                    <TranscriptionTab
                      pageNumber={pageNumber}
                      selectedDocument={selectedDocument}
                      notesDescription={notesDescription}
                      sentences={sentences}
                      updateTranscriptionFromSentences={updateTranscriptionFromSentences}
                      handleTranscribe={handleTranscribe}
                      transcriptionStatus={transcriptionStatus}
                      pageImage={pageImage}
                    />
                  )}
                  {activeTab === 'notes' && <NotesTab pageNumber={pageNumber} notesDescription={notesDescription} generateNotesStatus={generateNotesStatus} handleGenerateNotes={handleGenerateNotes} />}
                  {activeTab === 'quiz' && <QuizTab pageNumber={pageNumber} notesDescription={notesDescription} quizData={quizData} quizStatus={quizStatus} handleGenerateQuiz={handleGenerateQuiz} />}
                  {activeTab === 'mcq' && <MCQTab pageNumber={pageNumber} notesDescription={notesDescription} mcqData={mcqData} mcqStatus={mcqStatus} handleGenerateMCQ={handleGenerateMCQ} />}
                  {activeTab === 'personalTricks' && <PersonalTricksTab pageNumber={pageNumber} notesDescription={notesDescription} onUpdateTricks={handleUpdateTricks} />}
                  {activeTab === 'pyq' && <PYQTab pageNumber={pageNumber} notesDescription={notesDescription} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullLayout>
  );
};
