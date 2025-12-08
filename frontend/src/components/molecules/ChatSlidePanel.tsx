import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchChatBySpace, fetchTeacherStudentChats, type ChatResponse } from '../../store/slices/conversationsSlice';
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

  const { connect } = useVoiceAssistant();

  // Connect Voice Assistant on mount
  useEffect(() => {
    if (isOpen) {
      connect();
    }
  }, [isOpen, connect]);

  // Fetch teacher-student chats when teacherId is set
  useEffect(() => {
    if (isOpen && user && teacherUserId && user.role === "student") {
      dispatch(fetchTeacherStudentChats({
        user_id: user._id,
        student_id: user._id,
        teacher_id: teacherUserId
      }));
    }
  }, [isOpen, user, teacherUserId, dispatch]);

  // Fetch teacher-student chats when studentId is set (for teachers)
  useEffect(() => {
    if (isOpen && user && studentUserId && user.role === "teacher") {
      dispatch(fetchTeacherStudentChats({
        user_id: user._id,
        student_id: studentUserId,
        teacher_id: user._id
      }));
    }
  }, [isOpen, user, studentUserId, dispatch]);

  // Update conversation when chat changes
  useEffect(() => {
    if (chat && setConversationChat) {
      setConversationChat(chat);
    }
  }, [chat]);

  // Fetch teachers when no teacher_id is provided (for students)
  useEffect(() => {
    if (isOpen && user && !user_other_id && pathname.includes('/teacher/chats') && user.role === "student") {
      dispatch(getAllTeachers({
        user_id: user._id || '',
        page: 1,
        limit: 1000,
        search: searchQuery
      }));
    }
  }, [isOpen, user, user_other_id, searchQuery, pathname, dispatch]);

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
  }, [isOpen, user, user_other_id, searchQuery, dispatch]);

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
  }, [isOpen, chatId, dispatch, user_other_id, teacherUserId, user, pathname, searchParams, studentUserId]);

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
              <i className="fi fi-rr-sparkles text-sm"></i>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">maiind</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ask & rewind </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <i className="fi fi-rr-cross text-gray-600 dark:text-gray-300 flex"></i>
          </button>
        </div>

        {/* Conditional Content */}
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
            teacherUserId={teacherUserId}
            setTeacherUserId={setTeacherUserId}
            studentUserId={studentUserId}
            setStudentUserId={setStudentUserId}
          />
        ) : (
          <ConversationView
            chat={chat}
            conversationChat={conversationChat}
            setConversationChat={setConversationChat}
            setSelectedChatId={setSelectedChatId}
            teacherUserId={teacherUserId}
            studentUserId={studentUserId}
            setReplyContext={setReplyContext}
          />
        )}

        {/* Query Box */}
        {(user?.role === "student" && teacherUserId) || (user?.role === "teacher" && studentUserId) ? (
          <div className="">
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
