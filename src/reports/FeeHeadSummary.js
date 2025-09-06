import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";

const FeeHeadSummary = () => {
  const [feeData, setFeeData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/fee-head-summary")
      .then((res) => setFeeData(res.data || []))
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
                Fee Head Summary
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
                  <th className="border border-green-500 px-2 py-1">Fee Head</th>
                  <th className="border border-green-500 px-2 py-1">Students Paid</th>
                  <th className="border border-green-500 px-2 py-1">Amount Collected</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {feeData.length > 0 ? (
                  feeData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">
                        {item.feeHead || "-"}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        {item.studentsPaid}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        ₹{item.amountCollected}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
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

export default FeeHeadSummary;
