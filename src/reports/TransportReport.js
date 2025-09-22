import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TransportReport = () => {
  const [transportData, setTransportData] = useState([]);
  const [filterDistance, setFilterDistance] = useState("");
  const [distances, setDistances] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch transport report data
    axios
      .get("http://localhost:5000/api/transport-report")
      .then((res) => {
        const data = res.data || [];
        setTransportData(data);

        // Extract unique distances
        const uniqueDistances = Array.from(new Set(data.map(d => d.distance))).sort();
        setDistances(uniqueDistances);
      })
      .catch((err) => console.log(err));

    // Fetch academic sessions from master
    axios
      .get("http://localhost:5000/api/reports/sessions")
      .then((res) => {
        const sess = Array.isArray(res.data) ? res.data.map(s => s.year) : [];
        setSessions(sess.sort());
      })
      .catch((err) => console.log(err));
  }, []);

  // Filter by distance and session
  const filteredData = transportData.filter((item) => {
    const matchDistance = filterDistance ? item.distance === filterDistance : true;
    const matchSession = selectedSession !== "All" ? item.academicSession === selectedSession : true;
    return matchDistance && matchSession;
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          {/* Title Bar */}
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">Transport Fee Report</h2>
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
            {/* Session Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Academic Session:</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="All">All</option>
                {sessions.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
              {selectedSession !== "All" && (
                <button
                  onClick={() => setSelectedSession("All")}
                  className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Clear Session Filter
                </button>
              )}
            </div>

            {/* Distance Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Distance:</label>
              <select
                value={filterDistance}
                onChange={(e) => setFilterDistance(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {distances.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {filterDistance && (
                <button
                  onClick={() => setFilterDistance("")}
                  className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Clear Distance Filter
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-500">
              <thead className="bg-green-100 text-sm">
                <tr>
                  <th className="border border-green-500 px-2 py-1">Academic Session</th>
                  <th className="border border-green-500 px-2 py-1">Distance (KM)</th>
                  <th className="border border-green-500 px-2 py-1">No. of Students</th>
                  <th className="border border-green-500 px-2 py-1">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">{item.academicSession}</td>
                      <td className="border border-green-500 px-2 py-1">{item.distance}</td>
                      <td className="border border-green-500 px-2 py-1">{item.studentCount}</td>
                      <td className="border border-green-500 px-2 py-1">₹{item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500 border border-green-500">
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

export default TransportReport;
