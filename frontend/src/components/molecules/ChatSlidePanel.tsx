import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchChatBySpace, fetchChatById, fetchTeacherStudentChats, clearConversations, type ChatResponse } from '../../store/slices/conversationsSlice';
import { getAllTeachers, type TeacherModel } from '../../store/slices/teachersSlice';
import { getAllStudents, type StudentModel } from '../../store/slices/studentsSlice';
import { QueryBoxChat } from '../atoms/QueryBoxChat';
import { EnhancedTextDisplay } from '../atoms/EnhancedTextDisplay';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { QuickActionDisplay } from './QuickActionDisplay';

interface ChatSlidePanelProps {
  isOpen: boolean;
  chatId: string;
  domain: string;
  onClose: () => void;
}

export const ChatSlidePanel: React.FC<ChatSlidePanelProps> = ({ isOpen, chatId, domain, onClose }) => {
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
  const [conversation, setConversation] = useState<ChatResponse | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // State for active quick actions: Record<conversationId, type>
  const [activeQuickAction, setActiveQuickAction] = useState<'quiz' | 'concept' | 'mcq' | 'tricks' | null>(null);

  const handleQuickAction = (type: 'quiz' | 'concept' | 'mcq' | 'tricks') => {
    setActiveQuickAction(prev => {
      const current = prev;
      if (current === type) {
        // Toggle off if clicking the same type
        return null;
      }
      // Set new type for this conversation
      return type;
    });
  };

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
    if (chat && setConversation) {
      setConversation(chat);
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
              <h2 className="font-bold text-gray-900 dark:text-white">minde</h2>
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

        {/* Conditional Content: Teacher/Student List, Chat List, or Conversation History */}
        {!teacherUserId && !studentUserId && user?.role === "student" ? (
          /* Teacher List View (for students) */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {all_teachers?.length || 0} teachers found
              </p>
            </div>

            <div className="space-y-2">
              {all_teachers && all_teachers.length > 0 ? (
                all_teachers.map((teacher: TeacherModel) => (
                  <div
                    key={teacher.id}
                    className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={teacher.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                          alt={teacher.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                            {teacher.subjects?.join(", ") || "No subjects"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {teacher.students?.length || 0} students
                          </p>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xs transition-colors flex-shrink-0"
                        onClick={() => handleAddSelfAsStudentToTeacher(teacher)}
                      >
                        {teacher.students?.includes(user?.student_id as string) ? "Chat" : "Join"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <i className="fi fi-rr-users text-4xl mb-2"></i>
                  <p className="text-sm">No teachers found</p>
                  <p className="text-xs">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        ) : !teacherUserId && !studentUserId && user?.role === "teacher" ? (
          /* Student List View (for teachers) */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {all_students?.length || 0} students found
              </p>
            </div>

            <div className="space-y-2">
              {all_students && all_students.length > 0 ? (
                all_students.map((student: StudentModel) => (
                  <div
                    key={student.id}
                    className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={student.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                          alt={student.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                            {student.subjects?.join(", ") || "No subjects"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors flex-shrink-0"
                        onClick={() => handleSelectStudent(student)}
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <i className="fi fi-rr-users text-4xl mb-2"></i>
                  <p className="text-sm">No students found</p>
                  <p className="text-xs">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        ) : (teacherUserId || studentUserId) && !conversation ? (
          /* Chat List View (for both teachers and students) */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Conversations</h3>
              <button
                onClick={() => {
                  if (teacherUserId) setTeacherUserId(null);
                  if (studentUserId) setStudentUserId(null);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-2">
              {chats && chats.length > 0 ? (
                chats.map((chatItem) => (
                  <div
                    key={chatItem.id}
                    className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedChatId(chatItem.id as string);
                      dispatch(fetchChatById(chatItem.id as string));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {chatItem.title || "Untitled Chat"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(chatItem.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {chatItem.conversations.length} messages
                        </p>
                      </div>
                      <button
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChatId(chatItem.id as string);
                          dispatch(fetchChatById(chatItem.id as string));
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <i className="fi fi-rr-comment-alt text-4xl mb-2"></i>
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new conversation below</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Conversation History */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Back button when viewing a conversation */}
            {conversation && (teacherUserId || studentUserId) && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setConversation(null);
                    setSelectedChatId(null);
                    dispatch(clearConversations());
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                >
                  <i className="fi fi-rr-arrow-left flex items-center"></i>
                  Back
                </button>
              </div>
            )}

            {chat && chat?.conversations.length > 0 ? (
              chat?.conversations.map((conversation) => (
                <div key={conversation?.id} className="space-y-3">
                  {/* User Query */}
                  {conversation.query && (
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                        <p className="text-sm whitespace-pre-line">{conversation.query}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(conversation.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Answer */}
                  {conversation.answer && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm max-w-[90%]">
                        <EnhancedTextDisplay
                          className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line"
                          content={conversation.answer}
                        />

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">

                          <button
                            onClick={() => handleQuickAction('mcq')}
                            className={`p-1.5 rounded-lg transition-colors ${activeQuickAction === 'mcq' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30' : 'hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-500 hover:text-teal-600'}`}
                            title="Multiple Choice Quiz"
                          >
                            <i className="fi fi-rr-list-check text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleQuickAction('quiz')}
                            className={`p-1.5 rounded-lg transition-colors ${activeQuickAction === 'quiz' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-500 hover:text-indigo-600'}`}
                            title="Short Answer Question"
                          >
                            <i className="fi fi-rr-text text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleQuickAction('concept')}
                            className={`p-1.5 rounded-lg transition-colors ${activeQuickAction === 'concept' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30' : 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-gray-500 hover:text-cyan-600'}`}
                            title="Follow On Concept"
                          >
                            <i className="fi fi-rr-bulb text-xs"></i>
                          </button>
                        </div>

                        {/* Quick Action Display Area */}
                        {activeQuickAction && (
                          <QuickActionDisplay
                            type={activeQuickAction}
                            data={conversation.quick_action}
                            conversationId={conversation.id}
                          />
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(conversation.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <i className="fi fi-rr-comment-alt text-4xl mb-2"></i>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation below</p>
              </div>
            )}
          </div>
        )}

        {/* Query Box */}
        {(user?.role === "student" && teacherUserId) || (user?.role === "teacher" && studentUserId) ? (
          <div className="">
            <QueryBoxChat
              chatId={selectedChatId || chatId}
              domain={domain}
              teacher_user_id={user?.teacher_id ? user?._id : teacherUserId}
              student_user_id={user?.student_id ? user?._id : studentUserId}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
