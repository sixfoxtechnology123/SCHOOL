// pages/Layout.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaUserGraduate, FaMoneyBill, FaFileInvoice } from "react-icons/fa";

const Layout = () => {
  const navigate = useNavigate();

  // Dashboard states
  const [totalStudents, setTotalStudents] = useState(0);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const [todaysCollection, setTodaysCollection] = useState(0);
  const [activities, setActivities] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Fetch total students
  const fetchTotalStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students");
      const data = await res.json();
      setTotalStudents(data.length || 0);
    } catch (err) {
      console.error("Error fetching total students:", err);
    }
  };

  // Fetch outstanding dues
  const fetchOutstandingDues = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reports/outstanding-fees");
      const data = await res.json();
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
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("http://localhost:5000/api/payments");
      const allPayments = await res.json();

      const todayPayments = allPayments.filter((p) => {
        const paymentDate = new Date(p.date).toISOString().split("T")[0];
        return paymentDate === today;
      });

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

  //  Listen to all activity events and reload from localStorage
  useEffect(() => {
    const handleActivityEvent = () => {
      const stored = JSON.parse(localStorage.getItem("activities") || "[]");
      setActivities(stored);
    };

    window.addEventListener("newActivity", handleActivityEvent);

    // Load saved activities on first mount
    handleActivityEvent();

    return () => window.removeEventListener("newActivity", handleActivityEvent);
  }, []);

  useEffect(() => {
    fetchTotalStudents();
    fetchOutstandingDues();
    fetchTodaysCollection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 bg-gray-100 min-h-screen p-6">
        <Header onLogout={handleLogout} />

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaMoneyBill size={30} className="text-green-800 mb-2" />
            <h2 className="text-lg font-semibold text-green-800">
              Today's Collection
            </h2>
            <p className="text-2xl font-bold text-green-800">
              ₹ {todaysCollection.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaUserGraduate size={30} className="text-green-800 mb-2" />
            <button onClick={() => navigate("/StudentList")}>
              <h2 className="text-lg font-semibold text-green-800">
                Total Students
              </h2>
            </button>
            <p className="text-2xl font-bold text-green-800">{totalStudents}</p>
          </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-6">
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

        {/* Activity Log */}
{/* Activity Log */}
<div className="bg-white p-4 rounded-md shadow border border-gray-300 max-h-96 overflow-y-auto">
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-lg font-semibold text-gray-800">Activity Log</h2>
    <button
      onClick={() => {
        localStorage.removeItem("activities"); // clear from localStorage
        setActivities([]); // clear from state
      }}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
    >
      Clear
    </button>
  </div>

  <ul className="text-sm text-gray-700">
    {activities.length > 0 ? (
      activities.map((act) => (
        <li key={act.id} className="border-b border-gray-200 py-1">
          <span className="font-bold mr-2">•</span> {/* bold dot */}
          {act.text} -{" "}
          <span className="text-gray-500">
            {new Date(act.timestamp).toLocaleString()}
          </span>
        </li>
      ))
    ) : (
      <li className="text-gray-500">No recent activity found.</li>
    )}
  </ul>
</div>


      </main>
    </div>
  );
};

export default Layout;
