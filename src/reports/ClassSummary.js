import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";

const ClassSummary = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/class-summary")
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
                Class/Section-wise Summary
              </h2>
              <div className="flex gap-4">
                <BackButton />
              </div>
            </div>
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
                  <th className="border border-green-500 px-2 py-1">Pending Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {data.length > 0 ? (
                  data.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">
                        {d._id?.class || "-"}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        {d._id?.section || "-"}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        {d.students}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        ₹{d.totalAmount}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        ₹{d.pendingAmount || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
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

export default ClassSummary;
