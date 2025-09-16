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
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/transport-report")
      .then((res) => {
        const data = res.data || [];
        setTransportData(data);

        // Extract unique distances
        const uniqueDistances = data.map(d => d.distance).sort();
        setDistances(uniqueDistances);
      })
      .catch((err) => console.log(err));
  }, []);

  // Filter by distance
  const filteredData = filterDistance
    ? transportData.filter((item) => item.distance === filterDistance)
    : transportData;

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

          {/* Filter by Distance */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
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
            </div>

            {filterDistance && (
              <button
                onClick={() => setFilterDistance("")}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-500">
              <thead className="bg-green-100 text-sm">
                <tr>
                  <th className="border border-green-500 px-2 py-1">Distance (KM)</th>
                  <th className="border border-green-500 px-2 py-1">No. of Students</th>
                  <th className="border border-green-500 px-2 py-1">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">{item.distance}</td>
                      <td className="border border-green-500 px-2 py-1">{item.studentCount}</td>
                      <td className="border border-green-500 px-2 py-1">₹{item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500 border border-green-500">
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
