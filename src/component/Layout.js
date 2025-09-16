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
} from "react-icons/fa";

const Layout = () => {
  const navigate = useNavigate();

  // Dashboard states
  const [totalStudents, setTotalStudents] = useState(0);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const [todaysCollection, setTodaysCollection] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Fetch total students
  const fetchTotalStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setTotalStudents(res.data.length || 0);
    } catch (err) {
      console.error("Error fetching total students:", err);
    }
  };

  // Fetch outstanding dues
  const fetchOutstandingDues = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/reports/outstanding-fees"
      );
      const data = res.data || [];
      const total = data.reduce(
        (sum, item) => sum + (Number(item.pendingAmount) || 0),
        0
      );
      setOutstandingAmount(total);
    } catch (err) {
      console.error("Error fetching outstanding dues:", err);
    }
  };

  // Fetch today's collection
  const fetchTodaysCollection = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const res = await axios.get("http://localhost:5000/api/payments");
      const allPayments = res.data || [];

      // Filter only today's payments
      const todayPayments = allPayments.filter((p) => {
        const paymentDate = new Date(p.date).toISOString().split("T")[0];
        return paymentDate === today;
      });

      // Sum all amounts for today
      const total = todayPayments.reduce(
        (sum, item) => sum + (Number(item.amountPaid) || 0),
        0
      );
      setTodaysCollection(total);
    } catch (err) {
      console.error("Error fetching today's collection:", err);
      setTodaysCollection(0);
    }
  };

  useEffect(() => {
    fetchTotalStudents();
    fetchOutstandingDues();
    fetchTodaysCollection();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Today's Collection */}
          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaMoneyBill size={30} className="text-green-800 mb-2" />
            <h2 className="text-lg font-semibold text-green-800">
              Today's Collection
            </h2>
            <p className="text-2xl font-bold text-green-800">
              ₹ {todaysCollection.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Total Students */}
          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaUserGraduate size={30} className="text-green-800 mb-2" />
            <button onClick={() => navigate("/StudentList")}>
              <h2 className="text-lg font-semibold text-green-800">
                Total Students
              </h2>
            </button>
            <p className="text-2xl font-bold text-green-800">
              {totalStudents}
            </p>
          </div>

          {/* Outstanding Dues */}
          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaFileInvoice size={30} className="text-green-800 mb-2" />
            <button onClick={() => navigate("/OutstandingFees")}>
              <h2 className="text-lg font-semibold text-green-800">
                Outstanding Dues
              </h2>
            </button>
            <p className="text-2xl font-bold text-green-800">
              ₹ {outstandingAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <button
            onClick={() => navigate("/PaymentsList")}
            className="bg-green-50 font-semibold text-green-800 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition"
          >
            ➕ Collect Fees & 🧾 View Receipts
          </button>

          <button
            onClick={() => navigate("/OutstandingFees")}
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
