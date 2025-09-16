// pages/FeeHeadsReport.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FeeHeadsReport = () => {
  const [feeData, setFeeData] = useState([]);
  const [filteredFeeData, setFilteredFeeData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await axios.get(
          "http://localhost:5000/api/reports/fee-head-summary"
        );
        const data = Array.isArray(res.data) ? res.data : [];
        setFeeData(data);
        setFilteredFeeData(data);
      } catch (err) {
        console.error("Error fetching fee head summary:", err);
        setErrorMsg(
          err?.response?.data?.message ||
            err.message ||
            "Error fetching data from server"
        );
        setFeeData([]);
        setFilteredFeeData([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // Handle fee head search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) {
      setFilteredFeeData(feeData);
    } else {
      const filtered = feeData.filter((f) =>
        f.feeHead?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFeeData(filtered);
    }
  };

  const handleView = (students) => {
    const allStudents = students || [];
    setSelectedStudents(allStudents);

    // Extract unique classes
    const classes = Array.from(
      new Set(allStudents.map((s) => s?.class || s?.admitClass).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    setAvailableClasses(classes);
    setSelectedClass("All");
    setFilteredStudents(allStudents);
    setShowModal(true);
  };

  const handleClassFilter = (cls) => {
    setSelectedClass(cls);
    if (cls === "All") {
      setFilteredStudents(selectedStudents);
    } else {
      setFilteredStudents(
        selectedStudents.filter((s) => (s?.class || s?.admitClass) === cls)
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          {/* Title Bar with Search */}
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              {/* Left: Title */}
              <h2 className="text-xl font-bold text-green-800">Fee Head-Wise Summary</h2>

              {/* Right / Middle: Back + Search + Dashboard */}
              <div className="flex items-center w-full md:w-auto gap-2">
                <BackButton />
                <input
                  type="text"
                  placeholder="Search by Fee Head"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-1 border px-2 py-1 rounded text-sm border-gray-500"
                />
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
            <div className="text-center py-4 text-red-600">
              {errorMsg}
              <div className="mt-2 text-sm text-gray-500">
                Open <code>/api/reports/fee-head-summary</code> in browser to debug.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-green-500">
                <thead className="bg-green-100 text-sm">
                  <tr>
                    <th className="border border-green-500 px-2 py-1">Fee Head</th>
                    <th className="border border-green-500 px-2 py-1">Students Paid</th>
                    <th className="border border-green-500 px-2 py-1">Amount Collected</th>
                    <th className="border border-green-500 px-2 py-1">Action</th>
                  </tr>
                </thead>

                <tbody className="text-sm text-center">
                  {filteredFeeData.length > 0 ? (
                    filteredFeeData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100 transition">
                        <td className="border border-green-500 px-2 py-1">{item.feeHead || "-"}</td>
                        <td className="border border-green-500 px-2 py-1">{item.studentsPaid ?? 0}</td>
                        <td className="border border-green-500 px-2 py-1">₹{item.amountCollected ?? 0}</td>
                        <td className="border border-green-500 px-2 py-1">
                          <button
                            onClick={() => handleView(item.students)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No records found.
                        <div className="mt-2 text-xs text-gray-400">
                          Try checking the API endpoint in browser or server console.
                        </div>
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
              <h3 className="text-lg font-semibold text-green-700">Students Paid</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>

            {/* Class filter dropdown */}
            {availableClasses.length > 0 && (
              <div className="mb-3">
                <label className="mr-2 font-medium text-sm text-gray-700">Filter by Class:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassFilter(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value="All">All</option>
                  {availableClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}

            {filteredStudents && filteredStudents.length > 0 ? (
              <div className="overflow-auto max-h-72">
                <table className="w-full table-auto border border-green-500 text-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="border border-green-500 px-2 py-1">Sl No.</th>
                      <th className="border border-green-500 px-2 py-1">Name</th>
                      <th className="border border-green-500 px-2 py-1">Class</th>
                      <th className="border border-green-500 px-2 py-1">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <tr key={i} className="text-center hover:bg-gray-50">
                        <td className="border border-green-500 px-2 py-1">{i + 1}</td>
                        <td className="border border-green-500 px-2 py-1">{s?.name || "-"}</td>
                        <td className="border border-green-500 px-2 py-1">{s?.class || "-"}</td>
                        <td className="border border-green-500 px-2 py-1">{s?.section || "-"}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No students found for this fee head.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeHeadsReport;
