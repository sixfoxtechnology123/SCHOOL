import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TransportReport = () => {
  const [transportData, setTransportData] = useState([]);
    const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/transport")
      .then((res) => setTransportData(res.data || []))
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
                Transport Fee Report
              </h2>
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-500">
              <thead className="bg-green-100 text-sm">
                <tr>
                  <th className="border border-green-500 px-2 py-1">Student Name</th>
                  <th className="border border-green-500 px-2 py-1">Route</th>
                  <th className="border border-green-500 px-2 py-1">Amount Paid</th>
                  <th className="border border-green-500 px-2 py-1">Pending Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {transportData.length > 0 ? (
                  transportData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">
                        {item.studentName || "-"}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        {item.route || "-"}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        ₹{item.amountPaid}
                      </td>
                      <td className="border border-green-500 px-2 py-1">
                        ₹{item.pendingAmount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
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
