// pages/Layout.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  // State for dashboard
  const [totalStudents, setTotalStudents] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Fetch total students from backend
  const fetchTotalStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students"); // Replace with your backend endpoint
      setTotalStudents(res.data.length || 0);
    } catch (err) {
      console.error("Error fetching total students:", err);
    }
  };

  useEffect(() => {
    fetchTotalStudents();
  }, []);

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
          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaMoneyBill size={30} className="text-green-800 mb-2" />
            <h2 className="text-lg font-semibold text-green-800">
              Today's Collection
            </h2>
            <p className="text-2xl font-bold text-green-800">₹ 0.00</p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaChartBar size={30} className="text-green-800 mb-2" />
            <h2 className="text-lg font-semibold text-green-800">
              This Month
            </h2>
            <p className="text-2xl font-bold text-green-800">₹ 0.00</p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaUserGraduate size={30} className="text-green-800 mb-2" />
            <button onClick={() => navigate("/StudentList")}>
            <h2 className="text-lg font-semibold text-green-800">
              Total Students
            </h2></button>
            <p className="text-2xl font-bold text-green-800">
              {totalStudents}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaFileInvoice size={30} className="text-green-800 mb-2" />
            <h2 className="text-lg font-semibold text-green-800">
              Outstanding Dues
            </h2>
            <p className="text-2xl font-bold text-green-800">₹ 0.00</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate("/PaymentsList")}
            className="bg-green-50 font-semibold text-green-800 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition"
          >
            ➕ Collect Fees & 🧾 View Receipts
          </button>

          <button
            onClick={() => navigate("/reports/outstanding")}
            className="bg-green-50 font-semibold text-green-800 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition"
          >
            ⚠️ Outstanding Dues
          </button>

          <button
            onClick={() => navigate("/ReportsDashboard")}
            className="bg-green-50 font-semibold text-green-800 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition"
          >
            📊 Reports
          </button>
        </div>
      </main>
    </div>
  );
};

export default Layout;
