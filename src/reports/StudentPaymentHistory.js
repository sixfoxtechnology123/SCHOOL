// pages/StudentPaymentHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StudentPaymentHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await axios.get(
          "http://localhost:5000/api/reports/student-history"
        );
        const data = Array.isArray(res.data) ? res.data : [];
        setHistoryData(data);
        setFilteredHistory(data);

        // Extract unique students
        const students = Array.from(
          new Set(data.map((p) => p.studentName).filter(Boolean))
        ).sort();
        setAvailableStudents(students);
      } catch (err) {
        console.error("Error fetching student history:", err);
        setErrorMsg(
          err?.response?.data?.message ||
            err.message ||
            "Error fetching data from server"
        );
        setHistoryData([]);
        setFilteredHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleView = (studentName) => {
    const payments = historyData.filter((p) => p.studentName === studentName);
    setSelectedStudent(studentName);
    setFilteredPayments(payments);
    setSelectedStudentFilter(studentName);
    setShowModal(true);
  };

  const handleStudentFilter = (studentName) => {
    setSelectedStudentFilter(studentName);
    if (studentName === "All") {
      setFilteredPayments(historyData);
    } else {
      setFilteredPayments(historyData.filter((p) => p.studentName === studentName));
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) {
      setFilteredHistory(historyData);
    } else {
      setFilteredHistory(
        historyData.filter((p) =>
          p.studentName.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
        {/* Green Title Bar */}
        <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            {/* Left: Title */}
            <h2 className="text-xl font-bold text-green-800">Student Fee History</h2>

            {/* Middle / Right: Back + Search + Dashboard */}
            <div className="flex items-center w-full md:w-auto gap-2">
              {/* Back button on left */}
              <BackButton />

              {/* Search bar fills remaining space on mobile */}
              <input
                type="text"
                placeholder="Search by student name"
                value={searchTerm}
                onChange={handleSearch}
                className="flex-1 border px-2 py-1 rounded text-sm border-gray-500"
              />

              {/* Dashboard button on right */}
              <button
                onClick={() => navigate("/ReportsDashboard")}
                className="flex-shrink-0 flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                title="Reports Dashboard"
              >
                <FaThLarge />
              </button>
            </div>
          </div>
        </div>

          {/* Error / Loading */}
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : errorMsg ? (
            <div className="text-center py-4 text-red-600">{errorMsg}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-green-500">
                <thead className="bg-green-100 text-sm">
                  <tr>
                    <th className="border border-green-500 px-2 py-1">Student Name</th>
                    <th className="border border-green-500 px-2 py-1">Date</th>
                    <th className="border border-green-500 px-2 py-1">Fee Type</th>
                    <th className="border border-green-500 px-2 py-1">Amount Paid</th>
                    <th className="border border-green-500 px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-center">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100 transition">
                        <td className="border border-green-500 px-2 py-1">
                          {item.studentName || "-"}
                        </td>
                        <td className="border border-green-500 px-2 py-1">
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="border border-green-500 px-2 py-1">
                          {item.feeType || "-"}
                        </td>
                        <td className="border border-green-500 px-2 py-1">
                          ₹{item.amountPaid}
                        </td>
                        <td className="border border-green-500 px-2 py-1">
                          <button
                            onClick={() => handleView(item.studentName)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-green-700">
                Payment History - {selectedStudent}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>

            {/* Student filter */}
            {availableStudents.length > 0 && (
              <div className="mb-3">
                <label className="mr-2 font-medium text-sm text-gray-700">
                  Filter by Student:
                </label>
                <select
                  value={selectedStudentFilter}
                  onChange={(e) => handleStudentFilter(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value="All">All</option>
                  {availableStudents.map((s, idx) => (
                    <option key={idx} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filteredPayments.length > 0 ? (
              <div className="overflow-auto max-h-72">
                <table className="w-full table-auto border border-green-500 text-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="border border-green-500 px-2 py-1">Sl No.</th>
                      <th className="border border-green-500 px-2 py-1">Date</th>
                      <th className="border border-green-500 px-2 py-1">Fee Type</th>
                      <th className="border border-green-500 px-2 py-1">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((p, i) => (
                      <tr key={i} className="text-center hover:bg-gray-50">
                        <td className="border border-green-500 px-2 py-1">{i + 1}</td>
                        <td className="border border-green-500 px-2 py-1">
                          {new Date(p.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="border border-green-500 px-2 py-1">{p.feeType}</td>
                        <td className="border border-green-500 px-2 py-1">₹{p.amountPaid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No payment history found for this student.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentHistory;
