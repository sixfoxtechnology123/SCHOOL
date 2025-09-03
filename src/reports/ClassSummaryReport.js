// pages/ClassSummaryReport.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const ClassSummaryReport = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/class-summary", {
        params: { startDate, endDate },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching class summary:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Class/Section-wise Summary</h2>

      <div className="mb-4 flex gap-4">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
        <button onClick={fetchData} className="bg-green-700 text-white p-2 rounded">Filter</button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Class</th>
            <th className="border p-2">Section</th>
            <th className="border p-2">Total Collection</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={3} className="text-center p-2">No data found</td></tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.class}</td>
                <td className="border p-2">{item.section}</td>
                <td className="border p-2">{formatCurrency(item.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClassSummaryReport;
