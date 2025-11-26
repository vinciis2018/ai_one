import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../store';
import { getTeacherDetails, addCalendarEvent } from '../../store/slices/teachersSlice';
import { getStudentDetails } from '../../store/slices/studentsSlice';
import { fetchSelectedDocuments, type DocumentItem } from '../../store/slices/documentsSlice';
import Header from './components/Header';
import DocumentCard from './components/DocumentCard';
import StatsGrid from './components/StatsGrid';
import DocumentModal from './components/DocumentModal';

import { TeacherCalendar, type CalendarEvent } from '../../components/organisms/TeacherCalendar';

interface Tab {
  key: number;
  label: string;
  value: string;
  icon?: string;
}


export function UserProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentTab, setCurrentTab] = useState<string>('details');
  const { user } = useAppSelector((state) => state.auth);
  const { teacher_details } = useAppSelector((state) => state.teachers);
  const { student_details } = useAppSelector((state) => state.students);
  const { documents, status: documentStatus } = useAppSelector((state) => state.documents);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  console.log(documents)
  const [formData, setFormData] = useState<{ name: string, email: string }>({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user's profile here
  };

  useEffect(() => {
    if (user?.role == "teacher") {
      dispatch(getTeacherDetails(user?._id || ""));
    }
    if (user?.role == "student") {
      dispatch(getStudentDetails(user?._id || ""));
    }
  }, [dispatch, user]);

  // Fetch documents when teacher/student details are loaded
  useEffect(() => {
    const docIds = teacher_details?.documents || student_details?.documents;
    if (docIds && docIds.length > 0) {
      dispatch(fetchSelectedDocuments({ doc_ids: docIds }));
    }
  }, [dispatch, teacher_details, student_details]);


  const tabs: Tab[] = [
    {
      key: 1,
      label: 'Details',
      value: 'details',
    },
    {
      key: 2,
      label: 'Documents',
      value: 'documents',
    },
  ];

  if (user?.role === 'teacher') {
    tabs.splice(2, 0, {
      key: 3,
      label: 'Calendar',
      value: 'calendar',
    });
  }

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    if (user?._id) {
      dispatch(addCalendarEvent({ teacherId: user._id, event }));
    }
  };

  return (
    <SimpleLayout>
      {selectedDoc && <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
      <div className="bg-white max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <div className="py-4">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt={user?.full_name}
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl text-black dark:text-white font-bold capitalize flex items-center gap-2 justify-center sm:justify-start">
                {user?.full_name}
                {user?.role === 'teacher' && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                    Educator
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.role === 'teacher' && (
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded border border-orange-100">IIT JEE</span>
                  <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded border border-green-100">NEET</span>
                  <span className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded border border-purple-100">CBSE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-2 max-w-screen grid grid-cols-3 gap-4 border-b border-gray-100 mb-4">
          {tabs?.map((tab: Tab) => (
            <div className="col-span-1" key={tab.key}>
              <button
                type="button"
                onClick={() => setCurrentTab(tab.value)}
                className={`p-2 w-full focus:outline-none transition-colors ${currentTab === tab.value
                  ? 'border-b-2 border-green2 text-green2 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-md'
                  }`}
              >
                {tab.label}
              </button>
            </div>
          ))}
        </div>

        {currentTab === "edit" ? (
          <div className="p-2">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2 border"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : currentTab === "documents" ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Uploaded Documents</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {documents?.length || 0} Files
              </span>
            </div>

            {documentStatus === 'loading' ? (
              <div className="flex justify-center py-10">
                <i className="fi fi-br-circle animate-spin text-2xl text-gray-400"></i>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} onClick={() => setSelectedDoc(doc)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <i className="fi fi-rr-folder-open text-3xl text-gray-300 mb-2 block"></i>
                <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        ) : currentTab === "calendar" && user?.role === "teacher" ? (
          <div className="p-4">
            <TeacherCalendar events={teacher_details?.calendar?.events} onAddEvent={handleAddEvent} />
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">

                {/* Stats Grid */}
                <StatsGrid teacherDetails={teacher_details} studentDetails={student_details} />

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fi fi-rr-user text-gray-400"></i>
                    About
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 leading-relaxed">
                    <p>
                      Passionate {user?.role} dedicated to excellence in education.
                      Specializing in {teacher_details?.subjects?.join(", ") || student_details?.subjects?.join(", ") || "General Studies"}.
                      {user?.role === 'teacher' && " Helping students achieve their dreams in IIT JEE, NEET, and CBSE board exams."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fi fi-rr-briefcase text-gray-400"></i>
                    Professional Details
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <i className="fi fi-sr-graduation-cap text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Organization</p>
                          <p className="text-sm font-medium text-gray-900">{teacher_details?.organization?.name || student_details?.organization?.name || "Independent"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                          <i className="fi fi-sr-book-alt text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Subjects</p>
                          <p className="text-sm font-medium text-gray-900">{teacher_details?.subjects?.join(", ") || student_details?.subjects?.join(", ") || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                    {user?.role === 'teacher' && (
                      <div className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <i className="fi fi-sr-chalkboard-user text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Target Exams</p>
                            <p className="text-sm font-medium text-gray-900">IIT JEE, NEET, CBSE</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Sidebar (optional, maybe for actions or quick stats) */}
              <div className="lg:col-span-1">
                <div className="text-violet bg-gradient-to-br from-white to-greenLight rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Pro Teacher</h3>
                  <p className="text-sm mb-4">Unlock advanced analytics and unlimited document storage.</p>
                  <button className="w-full py-2 bg-green2 text-white rounded-lg font-semibold text-sm hover:bg-gray-500 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </SimpleLayout >
  );
}

export default UserProfilePage;
