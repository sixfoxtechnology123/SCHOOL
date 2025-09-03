// pages/Layout.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import {
  FaUserGraduate,
  FaMoneyBill,
  FaFileInvoice,
  FaChartBar,
} from "react-icons/fa";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Dashboard Area */}
      <main className="flex-1 bg-gray-100 min-h-screen p-6">
        {/* Header Component */}
        <Header onLogout={handleLogout} />

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <FaMoneyBill size={30} className="text-green-700 mb-2" />
            <h2 className="text-lg font-semibold">Today's Collection</h2>
            <p className="text-2xl font-bold">₹ 0.00</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <FaChartBar size={30} className="text-green-700 mb-2" />
            <h2 className="text-lg font-semibold">This Month</h2>
            <p className="text-2xl font-bold">₹ 0.00</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <FaUserGraduate size={30} className="text-green-700 mb-2" />
            <h2 className="text-lg font-semibold">Total Students</h2>
            <p className="text-2xl font-bold">0</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <FaFileInvoice size={30} className="text-green-700 mb-2" />
            <h2 className="text-lg font-semibold">Outstanding Dues</h2>
            <p className="text-2xl font-bold">₹ 0.00</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate("/collectfees")}
            className="bg-green-700 text-white p-6 rounded-2xl shadow hover:bg-green-800 transition"
          >
            ➕ Collect Fee
          </button>
          <button
            onClick={() => navigate("/receipts")}
            className="bg-green-700 text-white p-6 rounded-2xl shadow hover:bg-green-800 transition"
          >
            🧾 View Receipts
          </button>
          <button
            onClick={() => navigate("/reports/outstanding")}
            className="bg-green-700 text-white p-6 rounded-2xl shadow hover:bg-green-800 transition"
          >
            ⚠️ Outstanding Dues
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="bg-green-700 text-white p-6 rounded-2xl shadow hover:bg-green-800 transition"
          >
            📊 Reports
          </button>
        </div>
      </main>
    </div>
  );
};

export default Layout;
