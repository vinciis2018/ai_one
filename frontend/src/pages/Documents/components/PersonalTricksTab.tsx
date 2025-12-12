import React, { useState } from 'react';

export const PersonalTricksTab: React.FC<{
  pageNumber: number,
  notesDescription: any[],
  onUpdateTricks?: (pageNumber: number, tricks: string[]) => void,
}> = ({
  pageNumber,
  notesDescription,
  onUpdateTricks
}) => {
    // Find any personal tricks for the current page if stored in notesDescription
    const currentNote = notesDescription?.find((n) => n.page === pageNumber);
    const initialTricks = currentNote?.personalTricks || [];

    const [tricks, setTricks] = useState<string[]>(initialTricks);
    const [newTrick, setNewTrick] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    // Sync tricks when notesDescription changes
    React.useEffect(() => {
      const currentNote = notesDescription?.find((n) => n.page === pageNumber);
      const updatedTricks = currentNote?.personalTricks || [];
      setTricks(updatedTricks);
    }, [notesDescription, pageNumber]);

    const handleAddTrick = () => {
      if (newTrick.trim()) {
        const updatedTricks = [...tricks, newTrick.trim()];
        setTricks(updatedTricks);
        setNewTrick('');

        // Notify parent component to update the state
        if (onUpdateTricks) {
          onUpdateTricks(pageNumber, updatedTricks);
        }
      }
    };

    const handleDeleteTrick = (index: number) => {
      const updatedTricks = tricks.filter((_, i) => i !== index);
      setTricks(updatedTricks);

      // Notify parent component to update the state
      if (onUpdateTricks) {
        onUpdateTricks(pageNumber, updatedTricks);
      }
    };

    const handleStartEdit = (index: number) => {
      setEditingIndex(index);
      setEditText(tricks[index]);
    };

    const handleSaveEdit = () => {
      if (editingIndex !== null && editText.trim()) {
        const updatedTricks = [...tricks];
        updatedTricks[editingIndex] = editText.trim();
        setTricks(updatedTricks);
        setEditingIndex(null);
        setEditText('');

        // Notify parent component to update the state
        if (onUpdateTricks) {
          onUpdateTricks(pageNumber, updatedTricks);
        }
      }
    };

    const handleCancelEdit = () => {
      setEditingIndex(null);
      setEditText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (action === 'add') {
          handleAddTrick();
        } else {
          handleSaveEdit();
        }
      }
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 shrink-0">
          <h3 className="text-sm font-semibold text-gray-700">Personal Tricks</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Page {pageNumber}
          </span>
        </div>

        <div className="px-4 space-y-4">

          {/* Add New Trick */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a new trick or note
            </label>
            <div className="flex gap-2">
              <textarea
                value={newTrick}
                onChange={(e) => setNewTrick(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'add')}
                placeholder="Enter your personal trick, mnemonic, or quick note..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-logoBlue focus:border-transparent resize-none text-sm"
                rows={2}
              />
              <button
                onClick={handleAddTrick}
                disabled={!newTrick.trim()}
                className="px-4 py-2 bg-gradient-to-br from-indigo-200 to-blue-200 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
              >
                <i className="fi fi-rr-plus flex items-center justify-center text-xs"></i>
                <span className="text-sm font-medium">Add</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Press Enter to quickly add your trick
            </p>
          </div>

          {/* Tricks List */}
          <div className="space-y-3">
            {tricks && tricks.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Your Tricks ({tricks.length})</h4>
                </div>
                <div className="space-y-2">
                  {tricks.map((trick: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                    >
                      {editingIndex === index ? (
                        // Edit Mode
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'edit')}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-s no-scrollbar"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={!editText.trim()}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <i className="fi fi-rr-lightbulb text-blue-600 text-xs"></i>
                          </div>
                          <p className="flex-1 text-sm text-gray-700 leading-relaxed">{trick}</p>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleStartEdit(index)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit trick"
                            >
                              <i className="fi fi-rr-edit text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTrick(index)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete trick"
                            >
                              <i className="fi fi-rr-trash text-xs"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fi fi-rr-guide-alt flex items-center justify-center text-blue-300 text-xl"></i>
                </div>
                <p className="text-sm mb-1">No personal tricks yet</p>
                <p className="text-xs text-gray-400">Add your first trick above to get started!</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 rounded-lg p-3">
            <div className="flex gap-2">
              <i className="fi fi-rr-info text-indigo-600 text-sm mt-0.5"></i>
              <div className="flex-1">
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <strong>Personal Tricks</strong> are your own mnemonics, shortcuts, or notes to help you remember this page better.
                  They're saved automatically when you click the Save button in the header.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
