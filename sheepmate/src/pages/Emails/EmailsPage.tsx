import { FullLayout } from "../../layouts/AppLayout";
import { useAppSelector, useAppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import { downloadAttachment, convertPdfToExcel } from "../../store/slices/shipmentSlice";

export const EmailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { emails, downloadingAttachment, convertingAttachment } = useAppSelector((state) => state.shipment);

  const handleDownload = (messageId: string, attachmentId: string, filename: string) => {
    dispatch(downloadAttachment({ messageId, attachmentId, filename }));
  };

  return (
    <FullLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shipment Emails</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Found {emails.length} emails</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              <i className="fi fi-rr-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>

          <div className="grid gap-4">
            {emails.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fi fi-rr-envelope-open text-3xl text-slate-400"></i>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No emails found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">Try selecting a different date from the dashboard.</p>
              </div>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{email.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1.5">
                          <i className="fi fi-rr-user"></i>
                          {email.sender}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="fi fi-rr-clock"></i>
                          {new Date(email?.date).toLocaleString()}
                        </span>
                      </div>

                      {email.attachments && email.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {email.attachments.map((att) => (
                            <div key={att.attachmentId} className="flex gap-1">
                              <button
                                onClick={() => handleDownload(email.id, att.attachmentId, att.filename)}
                                disabled={downloadingAttachment === att.attachmentId}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
                              >
                                {downloadingAttachment === att.attachmentId ? (
                                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <i className="fi fi-rr-clip text-logoBlue"></i>
                                )}
                                <span className="truncate max-w-[200px]">{att.filename}</span>
                              </button>

                              {att.filename.toLowerCase().endsWith('.pdf') && (
                                <button
                                  onClick={() => dispatch(convertPdfToExcel({ messageId: email.id, attachmentId: att.attachmentId, filename: att.filename }))}
                                  disabled={convertingAttachment === att.attachmentId}
                                  className="flex items-center justify-center px-3 py-1.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                  title="Convert to Excel"
                                >
                                  {convertingAttachment === att.attachmentId ? (
                                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <i className="fi fi-rr-file-excel"></i>
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Process Button - Optional/Pending Requirement */}
                  {/* <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                       <button 
                          className="text-logoBlue hover:text-logoViolet font-bold text-sm transition-colors flex items-center gap-1"
                          onClick={() => alert(`Processing email: ${email.id}`)}
                       >
                          Process Shipment <i className="fi fi-rr-arrow-right"></i>
                       </button>
                  </div> */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FullLayout>
  );
};
