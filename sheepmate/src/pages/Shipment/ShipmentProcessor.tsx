import React, { useState } from 'react';
import { FullLayout } from "../../layouts/AppLayout";
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export const ShipmentProcessor = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processed Shipment");
    XLSX.writeFile(wb, "processed_shipment.xlsx");
  };

  return (
    <FullLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-black/95 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white pb-2 flex items-center gap-1"
              >
                <i className="fi fi-rr-arrow-left"></i> Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Shipment <span className="bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">Processor</span>
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Upload your email attachments to generate standardized Excel reports.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Upload */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fi fi-rr-file-add text-logoBlue"></i> Upload File
                </h2>

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-logoBlue/10 mx-auto flex items-center justify-center">
                      <i className="fi fi-rr-cloud-upload text-logoBlue text-xl"></i>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      XLSX, XLS, CSV (Max 10MB)
                    </p>
                  </div>
                </div>

                {fileName && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-800">
                    <i className="fi fi-rr-check-circle text-green-600 dark:text-green-400"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Ready to process</p>
                    </div>
                  </div>
                )}
              </div>

              {data.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Actions</h2>
                  <button
                    onClick={handleExport}
                    className="w-full py-3 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold shadow-lg hover:shadow-logoBlue/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fi fi-rr-download"></i> Download Excel Report
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px]">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fi fi-rr-table text-logoViolet"></i> Data Preview
                </h2>

                {data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                          {Object.keys(data[0]).map((key) => (
                            <th key={key} className="px-6 py-3">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.slice(0, 10).map((row, i) => (
                          <tr key={i} className="bg-white border-b dark:bg-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-6 py-4">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.length > 10 && (
                      <p className="text-center text-xs text-slate-500 mt-4">Showing first 10 rows of {data.length} records</p>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <i className="fi fi-rr-box-open text-4xl mb-2"></i>
                    <p>No data loaded yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </FullLayout>
  );
};
