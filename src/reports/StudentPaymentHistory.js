// pages/StudentPaymentHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentPaymentHistory = () => {
  const [data, setData] = useState([]);
  const [studentId, setStudentId] = useState("");

  const fetchData = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/reports/student-history/${studentId}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching student history:", err);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Payment History</h2>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={fetchData}
          className="bg-green-700 text-white p-2 rounded"
        >
          Search
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">Fee Head</th>
            <th className="border p-2">Amount Paid</th>
            <th className="border p-2">Collected By</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={4} className="text-center p-2">No data found</td></tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.date}</td>
                <td className="border p-2">{item.feeHead}</td>
                <td className="border p-2">{formatCurrency(item.amount)}</td>
                <td className="border p-2">{item.staffName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentPaymentHistory;
