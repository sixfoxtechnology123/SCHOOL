import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OutstandingFees = () => {
  const [outstandingData, setOutstandingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const navigate = useNavigate();

  const allSections = ["A", "B", "C"];
  const predefinedClasses = [
    "Class - I", "Class - II", "Class - III", "Class - IV",
    "Class - V", "Class - VI", "Class - VII", "Class - VIII",
    "Class - IX", "Class - X", "Class - XI", "Class - XII",
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/outstanding-fees")
      .then((res) => setOutstandingData(res.data || []))
      .catch((err) => console.log(err));
  }, []);

  // Apply filters
  const filteredData = outstandingData.filter((item) => {
    const matchName = searchTerm
      ? item.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchClass = filterClass
      ? item.class?.trim() === filterClass.trim()
      : true;
    const matchSection = filterSection
      ? item.section?.trim().toUpperCase() === filterSection.trim().toUpperCase()
      : true;

    return matchName && matchClass && matchSection;
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          {/* Green Title Bar */}
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-green-800">
                Outstanding Fees
              </h2>
              <div className="flex items-center gap-2">
                <BackButton />
                <input
                  type="text"
                  placeholder="Search by student name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border px-2 py-1 rounded text-sm border-gray-500"
                />
                <button
                  onClick={() => navigate("/ReportsDashboard")}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  title="Reports Dashboard"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Class:</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {predefinedClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Section:</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {allSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {(filterClass || filterSection || searchTerm) && (
              <button
                onClick={() => {
                  setFilterClass("");
                  setFilterSection("");
                  setSearchTerm("");
                }}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-500">
              <thead className="bg-green-100 text-sm">
                <tr>
                  <th className="border border-green-500 px-2 py-1">Student Name</th>
                  <th className="border border-green-500 px-2 py-1">Class</th>
                  <th className="border border-green-500 px-2 py-1">Section</th>
                  <th className="border border-green-500 px-2 py-1">Roll Number</th> {/* New column */}
                  <th className="border border-green-500 px-2 py-1">Pending Fee Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">{item.studentName || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{item.class || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{item.section || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{item.rollNo || "-"}</td> {/* Roll value */}
                      <td className="border border-green-500 px-2 py-1">₹{item.pendingAmount}</td>
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
        </div>
      </div>
    </div>
  );
};

export default OutstandingFees;
