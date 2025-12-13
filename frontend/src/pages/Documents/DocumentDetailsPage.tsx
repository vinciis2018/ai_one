
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import { fetchDocumentById, setViewingPageNumber } from "../../store/slices/documentsSlice";
import { createTranscription, saveNotes, generateQuiz, generateNotes, generateMCQ, generateTranscriptForAll } from "../../store/slices/notesSlice";
import { useParams, useNavigate } from "react-router-dom";
import { FullLayout } from "../../layouts/AppLayout";
import { NotesTab } from "./components/NotesTab";
import { QuizTab } from "./components/QuizTab";
import { MCQTab } from "./components/MCQTab";
import { PersonalTricksTab } from "./components/PersonalTricksTab";
import { PYQTab } from "./components/PYQTab";
import { TranscriptionTab } from "./components/TranscriptionTab";
import { MindmapTab } from "./components/MindmapTab";
import { cropImage } from "../../utilities/filesUtils";
import { DocumentViewer } from "./components/DocumentViewer";
import { LoadingComponent } from "../../components/molecules/LoadingComponent";


export const DocumentDetailsPage: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedDocument, selectedStatus, viewingPageNumber } = useAppSelector(
    (state) => state.documents
  );
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { transcriptForAllStatus, transcriptForAllData, transcriptionStatus, saveStatus, quizStatus, quizData, generateNotesStatus, generateNotesData, mcqStatus, mcqData } = useAppSelector((state) => state.notes);

  // const [pageNumber, setPageNumber] = useState<number>(1); // Moved to Redux
  const pageNumber = viewingPageNumber;
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes' | 'quiz' | 'mcq' | 'personalTricks' | 'pyq' | 'mindmap'>('transcription');
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
  }, [documentId, dispatch]);

  // Load existing notes from selectedDocument
  useEffect(() => {
    // Check if the loaded document matches the current URL param
    if (selectedDocument?.id !== documentId) {
      setNotesDescription([]);
      return;
    }

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
    } else {
      setNotesDescription([]);
    }
  }, [selectedDocument, documentId]);


  const handleSaveNotes = async () => {
    console.log("alsks")

    // if (!selectedDocument || notesDescription.length === 0) {
    //   alert("No transcriptions to save");
    //   return;
    // }
    try {
      // await dispatch(saveNotes({
      //   document_id: selectedDocument.id,
      //   notes: notesDescription,
      // })).unwrap();

      await dispatch(generateTranscriptForAll({
        document_id: selectedDocument?.id as string,
      })).unwrap();
      alert(`Successfully saved ${notesDescription.length} transcription(s)!`);
    } catch (error) {
      console.error("Save notes error:", error);
      alert("Failed to save notes.");
    }
  };

  console.log("transcriptForAllStatus", transcriptForAllStatus);
  console.log("transcriptForAllData", transcriptForAllData);

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

  return (
    <FullLayout>
      <div className="min-h-screen">
        <div className="max-w-screen mx-auto px-2 sm:px-4 lg:px-6 py-4 lg:py-8">
          {/* Header */}
          <div className="grid grid-cols-12 bg-white dark:bg-black backdrop-blur-xl border border-gray-50 shadow-sm rounded-3xl py-2 lg:p-6 mb-6 flex flex-col lg:flex-row items-center gap-4 justify-between">
            <div className="col-span-10 flex items-center gap-1 lg:gap-4 w-full lg:w-auto">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <i className="fi fi-rr-arrow-small-left text-slate-700 dark:text-white group-hover:text-logoBlue transition-colors" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base lg:text-xl font-semibold text-slate-900 dark:text-white truncate">
                  {selectedDocument?.filename || "Document Viewer"}
                </h1>
                {selectedDocument && (
                  <p className="text-xs lg:text-sm text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-2">
                    <span className="hidden lg:block uppercase tracking-wider font-bold text-sm bg-gradient-to-r from-logoSky to-logoPurple text-white px-2.5 py-0.5 rounded-lg">
                      {selectedDocument.source_type}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Uploaded {new Date(selectedDocument.created_at).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-2 flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto overflow-x-auto p-2 lg:pb-0">
              {/* {!hasTranscriptionForCurrentPage ? (
                <button
                  onClick={handleTranscribe}
                  disabled={transcriptionStatus === 'loading'}
                  className="px-5 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-logoBlue to-logoViolet text-white hover:shadow-lg hover:shadow-logoBlue hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-md whitespace-nowrap flex-1 lg:flex-none"
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
                  <button onClick={handleGenerateNotes} disabled={generateNotesStatus === 'loading'} className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-white text-slate-700 dark:text-white hover:border-logoBlue hover:text-logoBlue shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-sm font-bold">
                    <i className="fi fi-rr-magic-wand"></i> Notes
                  </button>
                  <button onClick={handleGenerateQuiz} disabled={quizStatus === 'loading'} className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-white text-slate-700 dark:text-white hover:border-logoViolet hover:text-logoViolet shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-sm font-bold">
                    <i className="fi fi-rr-list-check"></i> Quiz
                  </button>
                  <button onClick={handleGenerateMCQ} disabled={mcqStatus === 'loading'} className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-white text-slate-700 dark:text-white hover:border-logoPink hover:text-logoPink shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-sm font-bold">
                    <i className="fi fi-rr-checkbox"></i> MCQ
                  </button>
                </>
              )} */}
              <div className="w-px h-8 bg-slate-200 dark:bg-white mx-1 hidden lg:block"></div>
              <button
                onClick={handleSaveNotes}
                // disabled={saveStatus === 'loading' || notesDescription.length === 0}
                className="p-2 lg:px-5 lg:py-2.5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-logoBlue to-logoViolet dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all disabled:opacity-50 text-sm font-bold shadow-lg"
              >
                <i className="fi fi-rr-disk flex items-center justify-center"></i>
                <span className="hidden lg:block">Save</span>
              </button>
            </div>
          </div>


          {/* Content */}

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-220 h-auto">
            {/* Left Column: Document Viewer */}
            <div className="bg-white dark:bg-black backdrop-blur-xl rounded-2xl shadow-md border border-white flex flex-col lg:h-full h-140 overflow-hidden shrink-0">
              {selectedStatus === "loading" && (
                <LoadingComponent size="sm" message="Loading your notes..." />
              )}
              {selectedStatus === "succeeded" && selectedDocument && (
                <div className="flex flex-col h-full overflow-hidden relative">
                  <div className="absolute inset-0 overflow-hidden">
                    <DocumentViewer
                      selectedDocument={selectedDocument}
                      pageNumber={pageNumber}
                      onPageChange={(page) => dispatch(setViewingPageNumber(page))}
                      onImageSelection={activeTab === 'transcription' ? handleImageSelection : undefined}
                      onPageRendered={setPageImage}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Tabs */}
            <div className="lg:h-full h-[600px] overflow-hidden shrink-0 no-scrollbar">
              <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl shadow-md border border-white flex flex-col overflow-hidden h-full">
                <div className="flex items-center gap-2 p-2 border-b border-slate-100 dark:border-white overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: 'transcription', label: 'Transcribe', icon: 'fi-sr-select', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-logoBlue', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                    { id: 'notes', label: 'Notes', icon: 'fi-sr-journal-alt', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-logoViolet', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                    { id: 'quiz', label: 'Quiz', icon: 'fi-sr-test', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-logoPink', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                    { id: 'mcq', label: 'MCQ', icon: 'fi-sr-quiz-alt', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-indigo-500', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                    { id: 'mindmap', label: 'Mindmap', icon: 'fi-sr-network', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-rose-500', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                    { id: 'personalTricks', label: 'Tricks', icon: 'fi-sr-guide-alt', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-amber-500', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                    { id: 'pyq', label: 'PYQ', icon: 'fi-sr-lightbulb-question', activeClass: 'bg-gradient-to-r from-logoPink to-logoPurple text-white shadow-lg shadow-amber-500', inactiveClass: 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold transition-all whitespace-nowrap
                        ${activeTab === tab.id ? tab.activeClass : tab.inactiveClass}`}
                    >
                      <i className={`fi ${tab.icon} flex items-center justify-center text-base`}></i>
                      <span className={`${activeTab === tab.id ? '' : 'hidden lg:inline-block'}`}>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-white">
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
                  {activeTab === 'mindmap' && <MindmapTab pageNumber={pageNumber} notesDescription={notesDescription} />}
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
