// pages/OutstandingReport.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const OutstandingReport = () => {
  const [data, setData] = useState([]);
  const [classFilter, setClassFilter] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/outstanding", {
        params: { class: classFilter },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching outstanding fees:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Outstanding Fees Report</h2>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by Class"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchData} className="bg-green-700 text-white p-2 rounded">Filter</button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Class</th>
            <th className="border p-2">Total Fees</th>
            <th className="border p-2">Paid</th>
            <th className="border p-2">Due</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={5} className="text-center p-2">No data found</td></tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.studentName}</td>
                <td className="border p-2">{item.class}</td>
                <td className="border p-2">{formatCurrency(item.total)}</td>
                <td className="border p-2">{formatCurrency(item.paid)}</td>
                <td className="border p-2">{formatCurrency(item.due)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OutstandingReport;
