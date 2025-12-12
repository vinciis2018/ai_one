import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearConversations, fetchChatBySpace, fetchTeacherStudentChats, type ChatResponse } from '../../store/slices/conversationsSlice';
import { getAllTeachers, type TeacherModel } from '../../store/slices/teachersSlice';
import { getAllStudents, type StudentModel } from '../../store/slices/studentsSlice';
import { QueryBoxChat } from '../atoms/QueryBoxChat';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { useVoiceAssistant, VoiceAssistantProvider } from '../../hooks/useVoiceAssistant';

// Sub-components
import { TeacherListView } from './ChatSlidePanelComponents/TeacherListView';
import { StudentListView } from './ChatSlidePanelComponents/StudentListView';
import { ChatListView } from './ChatSlidePanelComponents/ChatListView';
import { ConversationView } from './ChatSlidePanelComponents/ConversationView';

interface ChatSlidePanelProps {
  isOpen: boolean;
  chatId: string;
  onClose: () => void;
  setSelectedData: (data: string | null) => void;
  selectedData: string | null;
  setSelectedDocument: (document: string | null) => void;
  selectedDocument: string | null;
}

const ChatSlidePanelContent: React.FC<ChatSlidePanelProps> = ({
  isOpen,
  chatId,
  onClose,
  setSelectedData,
  selectedData,
  setSelectedDocument,
  selectedDocument
}) => {
  const { pathname } = useLocation();
  const { user_id: user_other_id } = useParams<{ user_id: string }>();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { chat, chats } = useAppSelector((state) => state.conversations);
  const { user } = useAppSelector((state) => state.auth);
  const { all_teachers } = useAppSelector((state) => state.teachers);
  const { all_students } = useAppSelector((state) => state.students);
  const [teacherUserId, setTeacherUserId] = useState<string | null>(null);
  const [studentUserId, setStudentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationChat, setConversationChat] = useState<ChatResponse | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [replyContext, setReplyContext] = useState<string | null>(null);

  const [width, setWidth] = useState("w-100");

  const { connect } = useVoiceAssistant();

  // Connect Voice Assistant on mount
  useEffect(() => {
    if (isOpen) {
      connect();
    }
  }, [
    isOpen, connect
  ]);

  // Fetch teacher-student chats when teacherId is set
  useEffect(() => {
    if (isOpen && user && teacherUserId && user.role === "student") {
      dispatch(fetchTeacherStudentChats({
        user_id: user._id,
        student_id: user._id,
        teacher_id: teacherUserId
      }));
    }
  }, [
    isOpen, user, teacherUserId, dispatch
  ]);

  // Fetch teacher-student chats when studentId is set (for teachers)
  useEffect(() => {
    if (isOpen && user && studentUserId && user.role === "teacher") {
      dispatch(fetchTeacherStudentChats({
        user_id: user._id,
        student_id: studentUserId,
        teacher_id: user._id
      }));
    }
  }, [
    isOpen, user, studentUserId, dispatch
  ]);

  // Update conversation when chat changes
  useEffect(() => {
    if (chat && selectedChatId && chat.id === selectedChatId) {
      setConversationChat(chat);
    }
  }, [chat, selectedChatId]);



  // Fetch teachers when no teacher_id is provided (for students)
  useEffect(() => {
    if (isOpen && user && !user_other_id && (pathname.includes('chats') || pathname.includes('teachers')) && user.role === "student") {
      dispatch(getAllTeachers({
        user_id: user._id || '',
        page: 1,
        limit: 1000,
        search: searchQuery
      }));
    }
  }, [
    isOpen, user, user_other_id, searchQuery, pathname, dispatch
  ]);

  // Fetch students when no student_id is provided (for teachers)
  useEffect(() => {
    if (isOpen && user && !user_other_id && user.role === "teacher") {
      dispatch(getAllStudents({
        user_id: user._id || '',
        page: 1,
        limit: 1000,
        search: searchQuery
      }));
    }
  }, [
    isOpen, user, user_other_id, searchQuery, dispatch
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddSelfAsStudentToTeacher = async (teacher: TeacherModel) => {
    if (!user) return;
    setTeacherUserId(teacher.user_id);
  };

  const handleSelectStudent = async (student: StudentModel) => {
    if (!user) return;
    setStudentUserId(student.user_id);
  };

  useEffect(() => {
    if (isOpen && pathname) {
      const document_id = searchParams.get("document");
      console.log(document_id);
      const chat_space = document_id ? `${pathname.split("/").splice(1).join("/")}?document=${document_id}` : pathname.split("/").splice(1).join("/");

      if (!teacherUserId && pathname.split("/").includes("teacher")) {
        setTeacherUserId(user_other_id as string);
      }

      if (!studentUserId && pathname.split("/").includes("student")) {
        setStudentUserId(user_other_id as string);
      }

      // Fetch chat if we have a teacher_id (from URL or selected from list)
      if (user_other_id) {
        dispatch(fetchChatBySpace({ user_id: user?._id as string, chat_space: chat_space }));
      } else if (teacherUserId && user) {
        // Fetch chat when teacher is selected from list (no chatId in URL)
        const teacher_chat_space = `teacher/chats/${teacherUserId}/${user._id}`;
        dispatch(fetchChatBySpace({ user_id: user._id as string, chat_space: teacher_chat_space }));
      }
    }
  }, [
    isOpen, chatId, dispatch, user_other_id, teacherUserId, user, pathname, searchParams, studentUserId
  ]);


  const handleSetWidth = () => {
    if (width === "w-100") {
      setWidth("w-full");
    } else {
      setWidth("w-100");
    }
  }
  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black backdrop-blur-sm transition-opacity duration-300 z-40 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:${width} dark:bg-slate-900 backdrop-blur-2xl shadow-2xl border-l border-white dark:border-slate-800 transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logoBlue to-logoViolet rounded-2xl flex items-center justify-center text-white shadow-lg shadow-logoBlue" onDoubleClick={handleSetWidth}>
              <i className="fi fi-rr-sparkles text-lg flex items-center justify-center"></i>
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Maiind</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Solve your doubts using your maiind...</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (conversationChat) {
                setConversationChat(null);
                setSelectedChatId(null);
                dispatch(clearConversations());
              } else if (teacherUserId) {
                onClose();
                setTeacherUserId(null)
              } else if (studentUserId) {
                onClose();
                setStudentUserId(null)
              } else {
                onClose();
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-white dark:hover:text-white hover:bg-red-400 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label="Close chat"
          >
            <i className="fi fi-rr-cross-small text-xl flex"></i>
          </button>
        </div>

        {/* Conditional Content */}
        <div className="flex-1 overflow-y-auto bg-white">

          {!teacherUserId && !studentUserId && user?.role === "student" ? (
            <TeacherListView
              searchQuery={searchQuery}
              handleSearch={handleSearch}
              all_teachers={all_teachers}
              user={user}
              handleAddSelfAsStudentToTeacher={handleAddSelfAsStudentToTeacher}
            />
          ) : !teacherUserId && !studentUserId && user?.role === "teacher" ? (
            <StudentListView
              searchQuery={searchQuery}
              handleSearch={handleSearch}
              all_students={all_students}
              handleSelectStudent={handleSelectStudent}
            />
          ) : (teacherUserId || studentUserId) && !conversationChat ? (
            <ChatListView
              chats={chats}
              setSelectedChatId={setSelectedChatId}
            />
          ) : (
            <ConversationView
              chat={chat}
              setReplyContext={setReplyContext}
              teacher={all_teachers.find((teacher) => teacher.user_id === teacherUserId)}
            />
          )}
        </div>


        {/* Query Box */}
        {(user?.role === "student" && teacherUserId) || (user?.role === "teacher" && studentUserId) ? (
          <div className="bg-gradient-to-b from-white to-sky-50">
            <QueryBoxChat
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              setReplyContext={setReplyContext}
              replyContext={replyContext}
              chatId={selectedChatId || chatId}
              teacher_user_id={user?.teacher_id ? user?._id : teacherUserId}
              student_user_id={user?.student_id ? user?._id : studentUserId}
              previousConversationId={chat?.conversations?.[chat?.conversations?.length - 1]?.id}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

export const ChatSlidePanel: React.FC<ChatSlidePanelProps> = (props) => {
  return (
    <VoiceAssistantProvider>
      <ChatSlidePanelContent {...props} />
    </VoiceAssistantProvider>
  );
};
