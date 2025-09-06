import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";

const DailyCollection = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/daily-collection")
      .then((res) => setData(res.data || []))
      .catch((err) => console.log(err));
  }, []);

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
              <div className="flex gap-4">
                <BackButton />
              </div>
            </div>
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
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 transition"
                  >
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-4 text-gray-500"
                  >
                    No records found.
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
