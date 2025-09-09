import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";

const DailyCollection = () => {
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/daily-collection")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setData(res.data);
        } else {
          // fallback demo data
          setData([
            {
              date: new Date().toISOString(),
              totalStudents: 0,
              totalAmount: 0,
            },
          ]);
        }
      })
      .catch((err) => {
        console.log(err);
        // fallback demo data if API fails
        setData([
          {
            date: new Date().toISOString(),
            totalStudents: 0,
            totalAmount: 0,
          },
        ]);
      });
  }, []);

  // ✅ Filtered data by date
  const filteredData = filterDate
    ? data.filter(
        (row) =>
          new Date(row.date).toLocaleDateString("en-CA") === filterDate // en-CA gives YYYY-MM-DD
      )
    : data;

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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">
                Daily Collection Summary
              </h2>
              {/* Buttons: Back + Dashboard */}
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

          {/* ✅ Date Filter */}
          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Filter by Date:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <table className="w-full table-auto border border-green-500">
            <thead className="bg-green-100 text-sm">
              <tr>
                <th className="border border-green-500 px-2 py-1">Date</th>
                <th className="border border-green-500 px-2 py-1">
                  Total Students Paid
                </th>
                <th className="border border-green-500 px-2 py-1">
                  Total Amount Collected
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-100 transition">
                  <td className="border border-green-500 px-2 py-1">
                    {new Date(row.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border border-green-500 px-2 py-1">
                    {row.totalStudents}
                  </td>
                  <td className="border border-green-500 px-2 py-1">
                    ₹{row.totalAmount}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center text-gray-500 py-2 border border-green-500"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyCollection;
