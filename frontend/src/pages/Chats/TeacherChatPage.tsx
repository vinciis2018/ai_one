import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { getTeacherDetails } from "../../store/slices/teachersSlice";
import { useNavigate, useParams } from "react-router-dom";
import { QueryBoxChat } from "../../components/atoms/QueryBoxChat";
import { clearConversations, fetchChatById, fetchTeacherStudentChats, type ChatResponse } from "../../store/slices/conversationsSlice";
import { getStudentDetails } from "../../store/slices/studentsSlice";
import { EnhancedTextDisplay } from "../../components/atoms/EnhancedTextDisplay";
import { fetchSelectedDocuments } from "../../store/slices/documentsSlice";
import { StudentAnalyticsModal } from "../../components/popups/StudentAnalytics";

export const TeacherChatPage: React.FC = () => {
  const { teacher_user_id, student_user_id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // New: domain selection state
  const [domain, setDomain] = useState<string>("science");
  const [showDomainDropdown, setShowDomainDropdown] = useState<boolean>(false);
  const [conversation, setConversation] = useState<ChatResponse | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [previousConversationId, setPreviousConversationId] = useState<string | null>(null);

  const {user} = useAppSelector((state) => state.auth);
  const { teacher_details, loading: teacherLoading, error: teacherError } = useAppSelector((state) => state.teachers);
  const { student_details, loading: studentLoading, error: studentError } = useAppSelector((state) => state.students);
  const { chats } = useAppSelector((state) => state.conversations);
  const { chat: chatConversation } = useAppSelector((state) => state.conversations); 
  
  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (conversation) {
      const sources_used = [...new Set(
            conversation.conversations
            ?.flatMap(conv => conv.sources_used || [])
            .filter(Boolean) // Remove any null/undefined values
        )] as string[];
      dispatch(fetchSelectedDocuments({doc_ids: sources_used}));
    }
  }, [dispatch, conversation]);

  useEffect(() => {
    if (user) {
      dispatch(fetchTeacherStudentChats({user_id: user._id, student_id: student_user_id as string, teacher_id: teacher_user_id as string}))
      dispatch(getTeacherDetails(teacher_user_id as string));
      dispatch(getStudentDetails(student_user_id as string));
    }
  }, [dispatch, user, teacher_user_id, student_user_id]);

    const allDomains = [
    { key: 1, label: "Science", value: "science", icon: "fi-br-physics" },
    { key: 2, label: "Physics", value: "physics", icon: "fi-br-magnet" },
    { key: 3, label: "Chemistry", value: "chemistry", icon: "fi-br-flask-gear" },
    { key: 4, label: "Maths", value: "maths", icon: "fi-br-square-root" },
    { key: 5, label: "Biology", value: "biology", icon: "fi-br-dna" },
    { key: 6, label: "General", value: "general", icon: "fi-br-messages-question" },
  ];

  // Filter domains based on teacher's subjects
  const domains = allDomains.filter(domain => 
    teacher_details?.subjects?.some(subject => 
      subject.toLowerCase() === domain.value.toLowerCase()
    )
  );
  
  // If no matching domains found, default to general
  const availableDomains = domains.length > 0 ? domains : allDomains.filter(d => d.value === 'general');
  
  // Set initial domain to first available domain if current domain is not in available domains
  useEffect(() => {
    if (!availableDomains.some(d => d.value === domain)) {
      setDomain(availableDomains[0]?.value || 'general');
    }
  }, [domain, availableDomains]);


  useEffect(() => {
    if (chatConversation && setConversation) {
      setConversation(chatConversation);
    }
  }, [chatConversation, setConversation]);

  console.log(conversation)
  return (
    <FullLayout>
      <div className="relative w-full h-screen bg-white max-w-4xl mx-auto px-4">
        <div className="fixed left-0 right-0 w-full h-full rounded-lg overflow-hidden px-4">
          <div className="sticky max-w-4xl mx-auto z-10 bg-white py-2 flex items-center justify-between gap-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <img className="h-8 w-8 rounded-full" src={user?._id == teacher_user_id ? student_details?.avatar : teacher_details?.avatar} alt={user?._id == teacher_user_id ? student_details?.name : teacher_details?.name} />
              <div>
                <h1 className="text-sm font-semibold capitalize">
                  {user?._id == teacher_user_id ? student_details?.name : teacher_details?.name}
                </h1>
                <p className="text-xs text-gray-400 capitalize">{domain}</p>
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              {user?.role === "student" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDomainDropdown((s) => !s)}
                    disabled={teacherLoading}
                    className={`flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 ${
                      teacherLoading ? "bg-baigeLight cursor-not-allowed" : "bg-baigeLight hover:bg-gray-200"
                    }`}
                    title="Select domain"
                    aria-label="Select domain"
                  >
                    <i className={`fi ${domains.find((d) => d.value === domain)?.icon} flex items-center justify-center text-violet`} />
                  </button>

                  {showDomainDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {availableDomains.map((d) => (
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
              )}

              {user?.role === "teacher" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (conversation) {
                        setShowAnalysis((s) => !s);
                      }
                    }}
                    disabled={teacherLoading}
                    className={`flex items-center gap-2 p-3 rounded-full font-medium transition border border-gray-100 ${
                      teacherLoading ? "bg-baigeLight cursor-not-allowed" : "bg-baigeLight hover:bg-gray-200"
                    }`}
                    title="Select domain"
                    aria-label="Select domain"
                  >
                    <i className={`fi fi-br-analyse flex items-center justify-center text-violet`} />
                  </button>

                  
                </div>
              )}
              
              <i
                className="fi fi-br-exit flex items-center rounded-full bg-baigeLight p-3 text-red-500" 
                onClick={() => {
                  if (conversation) {
                    setConversation(null);
                    setChatId(null)
                    setPreviousConversationId(null)
                    dispatch(clearConversations())
                  } else {
                    navigate(-1)
                  }
                 
                }}
              
              />
            </div>

          </div>
          {teacherLoading && <p>Loading teachers...</p>}
          {teacherError && <p className="text-red-500">Failed to load teachers.</p>}
          {studentLoading && <p>Loading students...</p>}
          {studentError && <p className="text-red-500">Failed to load students.</p>}
          

          <div ref={chatContainerRef} className="pb-80 overflow-y-auto h-screen">
            {/* Chat messages will go here */}
            <div className="max-w-4xl mx-auto">
              
              
              
              {conversation && conversation?.conversations.length > 0 ? conversation?.conversations?.map((conv) => (
                <div key={conv?.id} className="space-y-4 p-2 border-b border-gray-100 mx-2">
                  {/* User message - aligned to right */}
                  {conv.query && (
                    <div className="flex justify-end gap-2">
                      {conv.attached_media && (
                        <div className="bg-baigeLight rounded-xl" onClick={() => window.open(conv.attached_media, '_blank')}>
                          <img src={conv.attached_media} alt="Attached media" className="rounded-xl h-20 w-20" />
                        </div>
                      )}
                      <div className={`bg-${conv?.user_id === user?._id ? "baigeLight" : "greenLight"} p-4 rounded-xl max-w-xl`}>
                        <h4 
                          className={
                            "text-xs font-semibold text-blue-700 capitalize"
                          }
                        >
                          {
                            conv?.user_id === user?._id ? "You" 
                              : user?.role === "student" ? teacher_details?.name
                              : user?.role === "teacher" ? student_details?.name
                              : "Anonymous"
                            }
                        </h4>
                        {/* {conv.query} */}
                        <EnhancedTextDisplay className="text-gray-800 text-sm whitespace-pre-line" content={conv.query} />
                      </div>
                    </div>
                  )}
                  
                  {/* Assistant message - aligned to left */}
                  {conv.answer && (
                    <div className="flex flex-col">
                      <div className="bg-gray-50 p-4 rounded-xl max-w-xl">
                        <div className="flex items-center gap-1 pb-2">
                          <h4 className="text-xs font-semibold text-gray-700 capitalize">{teacher_details?.name}</h4>
                          <i className="fi fi-rr-microchip-ai flex items-center text-xs"></i>
                        </div>
                        <EnhancedTextDisplay className="text-gray-800 text-sm whitespace-pre-line" content={conv.answer} />
                      </div>
                      <div className="p-2">
                        <p className="text-gray-800 text-xs whitespace-pre-line">{conv.sources_used && conv.sources_used?.length} sources referenced</p>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 text-center">
                    {new Date(conversation.created_at).toLocaleString()}
                  </div>
                </div>
              )) : chats && chats.length > 0 && chats.map((chat) => (
                <div key={chat.id} className="space-y-4 p-2 mx-2">
                  <div
                    className="border border-gray-100 bg-baigeLight rounded-xl p-4 hover:shadow cursor-pointer flex items-center justify-between"
                    onClick={() => setConversation(chat)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="">
                        <p className="font-semibold">{chat.title}</p>
                        <p className="text-xs text-gray-400">{new Date(chat.created_at).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{chat.conversations.length} messages</p>

                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatId(chat.id as string);
                        setPreviousConversationId(chat.conversations[chat.conversations.length - 1].conversation_id)
                        dispatch(fetchChatById(chat.id as string));
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 space-y-4">
            {showAnalysis && (
              <StudentAnalyticsModal
                conversation={conversation}
                student_details={student_details}
                onClose={() => setShowAnalysis(false)}
              />
            )}
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-2">
            <div className="max-w-4xl mx-auto bg-white">
              <QueryBoxChat domain={domain} teacher_user_id={teacher_user_id} student_user_id={student_user_id} chatId={chatId} previousConversationId={previousConversationId}/>
            </div>
          </div>
 
        </div>
      </div>
    </FullLayout>
  );
};
