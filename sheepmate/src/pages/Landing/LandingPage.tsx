// ============================================
// LandingPage.tsx
// Landing page for Shipment Processing
// ============================================

import { FullLayout } from "../../layouts/AppLayout";
import { useAppSelector, useAppDispatch } from "../../store";
import { fetchEmailsByDate } from "../../store/slices/shipmentSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
// import { FeaturesSection } from "./FeaturesSection";

export const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading, error } = useAppSelector((state) => state.shipment);
  const [selectedDate, setSelectedDate] = useState("");

  if (!isAuthenticated && !user) {
    return (
      <FullLayout>
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5">
          <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center z-10 relative">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Streamline Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-logoBlue to-logoViolet">Sheepmate Data</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
              Automate your logistics workflow. Read email attachments and generate organized Excel sheets instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-logoBlue/25 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* <FeaturesSection /> */}
        </div>
      </FullLayout>
    )
  }

  // Quick Actions for Shipment
  const shipmentActions = [
    { icon: "fi-rr-file-download", label: "Process Shipment", action: () => navigate('/shipment-processor'), color: "from-logoBlue to-logoSky" },
    { icon: "fi-rr-time-past", label: "History", action: () => { alert("Coming soon...\nStay tuned!!!") }, color: "from-logoSky to-logoPink" },
    { icon: "fi-rr-chart-histogram", label: "Reports", action: () => { alert("Coming soon...\nStay tuned!!!") }, color: "from-logoPink to-logoPurple" },
  ];

  return (
    <FullLayout>
      {({ }) => (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5">
          <div className="relative z-10 space-y-8 pb-12">
            {/* LOGGED IN VIEW */}
            <div className="w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-black backdrop-blur-xl border border-white shadow-xl rounded-3xl p-8 md:p-12 transform transition-all hover:scale-[1.002] duration-500">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                        Welcome, <span className="bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">{user?.firstName || 'User'}</span>! 📦
                      </h1>
                      <p className="text-sm md:text-lg text-slate-600 dark:text-slate-300">
                        Ready to process some shipments?
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
                      <input
                        type="date"
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-logoBlue/20 focus:border-logoBlue transition-all text-slate-900 dark:text-white"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (selectedDate) {
                          dispatch(fetchEmailsByDate(selectedDate)).then((result) => {
                            if (fetchEmailsByDate.fulfilled.match(result)) {
                              navigate('/emails');
                            }
                          });
                        } else {
                          alert("Please select a date first");
                        }
                      }}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-logoBlue to-logoViolet text-white font-bold rounded-xl shadow-lg hover:shadow-logoBlue/25 hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="fi fi-rr-rocket-lunch flex items-center justify-center text-logoViolet"></i> Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {shipmentActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="group bg-white dark:bg-black backdrop-blur-md rounded-3xl p-6 border border-white hover:border-logoBlue shadow-lg hover:shadow-xl hover:shadow-logoBlue transition-all duration-300 text-left hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:rotate-3`}>
                      <i className={`fi ${action.icon} flex items-center justify-center text-white text-2xl`}></i>
                    </div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-logoBlue transition-colors relative z-10">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </FullLayout>
  );
};

