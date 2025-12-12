import React from 'react';

interface PersonalTricksViewProps {
  pageNumber: number;
  noteForPage: any;
  onBack: () => void;
}

export const PersonalTricksView: React.FC<PersonalTricksViewProps> = ({ pageNumber, noteForPage, onBack }) => {
  const tricks = noteForPage?.personal_tricks;

  return (
    <div className="h-full w-full bg-white overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logoPink to-logoPurple rounded-xl flex items-center justify-center shadow-lg">
              <i className="fi fi-sr-bulb flex items-center justify-center text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-bold text-slate-900">Tips</h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium">Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-2"
          >
            <i className="fi fi-rr-arrow-left flex items-center justify-center text-xs"></i>
            <span className="hidden lg:block">Back to PDF</span>
          </button>
        </div>
        {tricks && tricks.length > 0 ? (
          <div className="space-y-3">
            {tricks.map((trick: string, i: number) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-logoBlue/20 to-logoViolet/20 rounded-full flex items-center justify-center mt-0.5">
                  <i className="fi fi-rr-lightbulb text-logoBlue text-sm"></i>
                </div>
                <p className="flex-1 text-sm font-medium text-slate-700 leading-relaxed">{trick}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-bulb text-3xl text-slate-300"></i>
            </div>
            <p className="text-slate-500 font-medium">No personal tips available</p>
          </div>
        )}
      </div>
    </div>
  );
};
