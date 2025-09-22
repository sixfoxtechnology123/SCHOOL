import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";

const ClassSummary = () => {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch class summary report
    axios.get("http://localhost:5000/api/reports/class-summary")
      .then((res) => setData(res.data || []))
      .catch((err) => console.log(err));

    // Fetch unique classes for dropdown
    axios.get("http://localhost:5000/api/classes/unique/classes")
      .then((res) => setClasses(res.data || []))
      .catch((err) => console.log(err));
  }, []);

  // Fetch sections when a class is selected
  useEffect(() => {
    if (filterClass) {
      axios.get(`http://localhost:5000/api/classes/sections/${filterClass}`)
        .then((res) => setSections(res.data || []))
        .catch((err) => console.log(err));
    } else {
      setSections([]);
      setFilterSection("");
    }
  }, [filterClass]);

  // Build table data based on fetched report and selected filters
  const filteredData = data.filter((row) => {
    const matchClass = filterClass ? row.className?.trim() === filterClass.trim() : true;
    const matchSection = filterSection ? row.section?.trim().toUpperCase() === filterSection.trim().toUpperCase() : true;
    return matchClass && matchSection;
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">Class/Section-wise Summary</h2>
              <div className="flex gap-2">
                <BackButton />
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
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Section:</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                disabled={!filterClass}
              >
                <option value="">All</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {(filterClass || filterSection) && (
              <button
                onClick={() => { setFilterClass(""); setFilterSection(""); }}
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
                  <th className="border border-green-500 px-2 py-1">Class</th>
                  <th className="border border-green-500 px-2 py-1">Section</th>
                  <th className="border border-green-500 px-2 py-1">Students Paid</th>
                  <th className="border border-green-500 px-2 py-1">Amount Collected</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">{row.className || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{row.section || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{row.studentsPaid}</td>
                      <td className="border border-green-500 px-2 py-1">₹{row.totalAmount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500 border border-green-500">
                      No records found
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

export default ClassSummary;
