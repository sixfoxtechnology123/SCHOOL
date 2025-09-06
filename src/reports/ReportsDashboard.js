import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";


// Updated report icons
const reports = [
      { name: "Daily Collection (All Students)", route: "/DailyCollection", icon: "🗓️" },
  { name: "Daily Collection (User-wise)", route: "/DailyCollectionUser", icon: "👤🗓️" },
  { name: "Class Summary", route: "/ClassSummary", icon: "📊" },
  { name: "Student History", route: "/StudentHistory", icon: "📚" },
  { name: "Outstanding Fees", route: "/OutstandingFees", icon: "💰" },
  { name: "Fee Head Summary", route: "/FeeHeadSummary", icon: "🧾" },
  { name: "Transport Report", route: "/TransportReport", icon: "🚌" },
];

const ReportsDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-green-800 mb-4">
            Reports Dashboard
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report, index) => (
              <div
                key={index}
                onClick={() => navigate(report.route)}
                className="cursor-pointer flex flex-col items-center justify-center p-6 bg-green-50 border border-green-300 rounded-lg shadow hover:bg-green-100 transition text-center"
              >
                <div className="text-4xl mb-2">{report.icon}</div>
                <div className="font-semibold text-green-800">{report.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
