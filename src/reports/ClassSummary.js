import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";

const ClassSummary = () => {
  const [data, setData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filterSession, setFilterSession] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();

  // Fetch data on mount
  useEffect(() => {
    // Class summary data
    axios.get("http://localhost:5000/api/reports/class-summary")
      .then(res => setData(res.data || []))
      .catch(err => console.log(err));

    // Unique classes for filter
    axios.get("http://localhost:5000/api/classes/unique/classes")
      .then(res => setClasses(res.data || []))
      .catch(err => console.log(err));

    // Sessions for filter
    axios.get("http://localhost:5000/api/sessions")
      .then(res => setSessions(res.data || []))
      .catch(err => console.log(err));
  }, []);

  // Fetch sections when class filter changes
  useEffect(() => {
    if (filterClass) {
      axios.get(`http://localhost:5000/api/classes/sections/${filterClass}`)
        .then(res => setSections(res.data || []))
        .catch(err => console.log(err));
    } else {
      setSections([]);
      setFilterSection("");
    }
  }, [filterClass]);

  // Filter data based on selected session, class, and section
  const filteredData = data.filter(row => {
    const matchSession = filterSession ? row.session === filterSession : true;
    const matchClass = filterClass ? row.className?.trim() === filterClass.trim() : true;
    const matchSection = filterSection ? row.section?.trim().toUpperCase() === filterSection.trim().toUpperCase() : true;
    return matchSession && matchClass && matchSection;
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
              <label className="text-sm font-medium text-gray-700">Session:</label>
             <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">All</option>
                  {sessions.map(s => (
                    <option key={s._id} value={s.year}>{s.year}</option>
                  ))}
                </select>

            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Class:</label>
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Section:</label>
              <select
                value={filterSection}
                onChange={e => setFilterSection(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                disabled={!filterClass}
              >
                <option value="">All</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {(filterClass || filterSection || filterSession) && (
              <button
                onClick={() => { setFilterClass(""); setFilterSection(""); setFilterSession(""); }}
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
                  <th className="border border-green-500 px-2 py-1">Session</th>
                  <th className="border border-green-500 px-2 py-1">Students Paid</th>
                  <th className="border border-green-500 px-2 py-1">Amount Collected</th>
                  <th className="border border-green-500 px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{row.className || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{row.section || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{row.session || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{row.studentsPaid}</td>
                    <td className="border border-green-500 px-2 py-1">₹{row.totalAmount}</td>
                    <td className="border border-green-500 px-2 py-1">
                      <button
                        onClick={() => setSelectedReport(row)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500 border border-green-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {selectedReport && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-5 w-3/4 max-w-2xl">
                <h3 className="text-lg font-bold mb-3 text-green-700">
                  Report Details ({selectedReport.className}-{selectedReport.section}, {selectedReport.session})
                </h3>
                <table className="w-full table-auto border border-green-500 mb-4">
                  <thead className="bg-green-100 text-sm">
                    <tr>
                      <th className="border border-green-500 px-2 py-1">Session</th>
                      <th className="border border-green-500 px-2 py-1">ID</th>
                      <th className="border border-green-500 px-2 py-1">Name</th>
                      <th className="border border-green-500 px-2 py-1">Class</th>
                      <th className="border border-green-500 px-2 py-1">Section</th>
                      <th className="border border-green-500 px-2 py-1">Roll</th>
                      <th className="border border-green-500 px-2 py-1">Amount Paid</th>
                      
                    </tr>
                  </thead>
                  <tbody className="text-sm text-center">
                    {selectedReport.students?.length > 0 ? selectedReport.students.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                         <td className="border border-green-500 px-2 py-1">{s.session}</td>
                        <td className="border border-green-500 px-2 py-1">{s.studentId || "-"}</td>
                        <td className="border border-green-500 px-2 py-1">{s.name}</td>
                        <td className="border border-green-500 px-2 py-1">{s.class}</td>
                        <td className="border border-green-500 px-2 py-1">{s.section}</td>
                        <td className="border border-green-500 px-2 py-1">{s.rollNo || "-"}</td>
                        <td className="border border-green-500 px-2 py-1">₹{s.amountPaid || 0}</td>
                       
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="text-gray-500 py-2 border border-green-500">
                          No student records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClassSummary;
