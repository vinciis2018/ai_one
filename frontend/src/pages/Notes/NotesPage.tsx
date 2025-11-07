import { useAppDispatch, useAppSelector } from "../../store";
import { FullLayout } from "../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDocuments } from "../../store/slices/documentsSlice";
import { NoteDetailsModal } from "../../components/popups/NoteDetailsModal";

export const NotesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {user} = useAppSelector((state) => state.auth);
  const { documents, status, error } = useAppSelector((state) => state.documents);
  
  const [selectedId, setSelectedId] = useState<string | null | undefined>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState("all");
console.log(selectedId)
  useEffect(() => {
    if (user) {
      dispatch(fetchDocuments({
        user_ids: [user?._id || ''],
      }));
      
    }
  }, [dispatch, user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
  };

  return (
    <FullLayout>
      <div className="bg-white max-w-4xl mx-auto py-2 px-4">
        <div className="rounded-lg overflow-hidden">
          <div className="py-2 flex items-center gap-2 border-b border-gray-100" onClick={() => navigate(-1)}>
            <i className="fi fi-sr-arrow-small-left flex items-center rounded-full bg-baigeLight p-1" />
            <h1 className="text-sm font-semibold">
              Notes
            </h1>
          </div>
          {status == "loading" && <p>Loading notes...</p>}
          {error && <p className="text-red-500">Failed to load notes.</p>}
          <div className="grid grid-cols-3 gap-2 py-2">
            <input
              type="text"
              placeholder="Search Notes..."
              value={searchQuery}
              onChange={handleSearch}
              className="col-span-2 text-sm px-4 py-2 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            />
            <select
              title="select domain"
              value={selectedDomain}
              onChange={handleDomainChange}
              className="col-span-1 px-4 py-2 mx-2 text-sm rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-baigeLight"
            >
              <option value="all">All</option>
              <option value="physics">Physics</option>
              <option value="maths">Maths</option>
              <option value="chemistry">Chemistry</option>
            </select>
          </div>

          <div className="py-2">
            <h2 className="text-xs">found {documents.length} notes</h2>
            <div className="py-4 space-y-2">
              {Array.isArray(documents) ? documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-100 bg-baigeLight rounded-xl p-4 hover:shadow cursor-pointer flex items-center justify-between"
                  onClick={() => setSelectedId(doc?.id)}
                >
                  <div className="flex items-center gap-2">
                    {/* <img src={doc.avatar} alt={doc.name} className="h-12 w-12 rounded-full" /> */}
                    <div>
                      <p className="font-semibold">{doc.filename}</p>
                      {/* <p className="text-xs text-gray-400">({doc.subjects?.[0]})</p> */}
                      {/* <p className="text-xs text-gray-400">{doc.documents?.length} students</p> */}
                      {/* <p className="text-xs text-gray-400">{teacher.documents?.length} study materials</p> */}
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-white border border-green text-green font-semibold rounded-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle assign action here
                      setSelectedId(doc.id);
                    }}
                  >
                    view
                  </button>
                </div>
              )) : null}
            </div>
          </div>
         <NoteDetailsModal documentId={selectedId as string} onClose={() => setSelectedId(null)} />
 
        </div>
      </div>
    </FullLayout>
  );
};
