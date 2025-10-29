// pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { FaUserGraduate, FaMoneyBill, FaFileInvoice } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();

  // Dashboard states
  const [totalStudents, setTotalStudents] = useState(0);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const [todaysCollection, setTodaysCollection] = useState(0);
  const [activities, setActivities] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [hasDashboardAccess, setHasDashboardAccess] = useState(false);

  const normalize = (s) =>
    (typeof s === "string" ? s : "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/gi, "")
      .toLowerCase();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("adminData") || "null") || {};
    const role = admin.role || "";

    // Admin role always has access
    if (role.toLowerCase() === "admin") {
      setHasDashboardAccess(true);
      return;
    }

    let perms = [];

    if (Array.isArray(admin.permissions)) {
      perms = admin.permissions.map((p) =>
        typeof p === "string" ? normalize(p) : normalize(p.permission || p.name || "")
      );
    } else if (
      admin.permissions &&
      typeof admin.permissions === "object" &&
      !Array.isArray(admin.permissions)
    ) {
      perms = Object.keys(admin.permissions)
        .filter((k) => admin.permissions[k])
        .map(normalize);
    }

    // ✅ Check if "Dashboard" permission exists
    if (perms.includes("dashboard")) {
      setHasDashboardAccess(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ---- DATA FETCHING ----
  const fetchTotalStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setTotalStudents(res.data.length || 0);
    } catch (err) {
      console.error("Error fetching total students:", err);
    }
  };

  const fetchOutstandingDues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/outstanding-fees");
      const total = res.data.reduce(
        (sum, item) => sum + (Number(item.pendingAmount) || 0),
        0
      );
      setOutstandingAmount(total);
    } catch (err) {
      console.error("Error fetching outstanding dues:", err);
    }
  };

  const fetchTodaysCollection = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await axios.get("http://localhost:5000/api/payments");
      const todayPayments = res.data.filter(
        (p) => new Date(p.date).toISOString().split("T")[0] === today
      );
      const total = todayPayments.reduce(
        (sum, item) => sum + (Number(item.totalPaidAmount) || 0),
        0
      );
      setTodaysCollection(total);
    } catch (err) {
      console.error("Error fetching today's collection:", err);
      setTodaysCollection(0);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/activities");
      setActivities(res.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  useEffect(() => {
    if (hasDashboardAccess) {
      fetchTotalStudents();
      fetchOutstandingDues();
      fetchTodaysCollection();
      fetchActivities();
    }
  }, [hasDashboardAccess]);

  // ---- IF USER HAS NO DASHBOARD PERMISSION ----
  if (!hasDashboardAccess) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 bg-gray-100 flex items-center justify-center">
          <h2 className="text-gray-600 text-xl font-semibold">
            Access Denied: You don’t have permission to view the Dashboard.
          </h2>
        </main>
      </div>
    );
  }

  // ---- MAIN DASHBOARD ----
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 bg-gray-100 min-h-screen p-6">
        <Header onLogout={handleLogout} />

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaMoneyBill size={30} className="text-green-800 mb-2" />
            <h2 className="text-lg font-semibold text-green-800">Today's Collections</h2>
            <p className="text-2xl font-bold text-green-800">
              ₹ {todaysCollection.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaUserGraduate size={30} className="text-green-800 mb-2" />
            <button onClick={() => navigate("/StudentList")}>
              <h2 className="text-lg font-semibold text-green-800">Total Students</h2>
            </button>
            <p className="text-2xl font-bold text-green-800">{totalStudents}</p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-300 hover:bg-green-100 transition">
            <FaFileInvoice size={30} className="text-green-800 mb-2" />
            <button onClick={() => navigate("/OutstandingFees")}>
              <h2 className="text-lg font-semibold text-green-800">Outstanding Dues</h2>
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
        <div className="bg-white p-4 rounded-md shadow border border-gray-300 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Activity Log</h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterDate("")}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                All
              </button>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>

            <button
              onClick={async () => {
                const confirmClear = window.confirm(
                  "Are you sure you want to clear all activities?"
                );
                if (!confirmClear) return;

                try {
                  await fetch("http://localhost:5000/api/activities", {
                    method: "DELETE",
                  });
                  setActivities([]);
                  toast.success("All activities deleted successfully!");
                } catch (err) {
                  console.error("Failed to clear activities:", err);
                  toast.error("Failed to delete activities!");
                }
              }}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Clear Activity
            </button>
          </div>

          <ul className="text-sm text-gray-700">
            {activities.length > 0 ? (
              activities
                .filter((act) => {
                  if (!filterDate) return true;
                  const parts = act.timestamp.split(" ")[0].split("/");
                  if (parts.length !== 3) return false;
                  const actDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
                    2,
                    "0"
                  )}`;
                  return actDate === filterDate;
                })
                .map((act) => (
                  <li key={act._id} className="border-b border-gray-200 py-1">
                    <span className="font-bold mr-2">•</span>
                    {act.text} -{" "}
                    <span className="text-gray-500">{act.timestamp}</span>
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

export default Dashboard;
