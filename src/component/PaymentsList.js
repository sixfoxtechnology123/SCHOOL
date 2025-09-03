// pages/PaymentsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [feeHeads, setFeeHeads] = useState({}); // mapping of feeHeadId -> name
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      setPayments(res.data || []);
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    }
  };

  // Fetch fee heads to map id -> name
  const fetchFeeHeads = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feeheads");
      const map = {};
      res.data.forEach((f) => {
        map[f.feeHeadId] = f.feeHeadName; // 🔑 use feeHeadId ("FEE001") as key
      });
      setFeeHeads(map);
    } catch (e) {
      console.error("Failed to fetch fee heads:", e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchFeeHeads();
  }, [location.key]); // refresh both when coming back

  const deletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/payments/${id}`);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete payment:", err);
    }
  };

  return (
  <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
    <div className="flex-1 overflow-y-auto">
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">Payments</h2>
          <div className="flex gap-4">
            <BackButton />
            <button
              onClick={() => navigate("/PaymentsMaster")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
            >
              Add Payment
            </button>
          </div>
        </div>
      </div>

      <table className="w-full table-auto border border-green-500">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="border border-green-500 px-2 py-1">Payment ID</th>
            <th className="border border-green-500 px-2 py-1">Receipt No</th>
            <th className="border border-green-500 px-2 py-1">Fee Head</th>
            <th className="border border-green-500 px-2 py-1">Amount</th>
            <th className="border border-green-500 px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-center">
          {payments.length > 0 ? (
            payments.map((p) => (
              <tr key={p._id} className="hover:bg-gray-100 transition">
                <td className="border border-green-500 px-2 py-1">{p.paymentId}</td>
                <td className="border border-green-500 px-2 py-1">{p.receiptNo}</td>

                {/* ✅ show Fee Head Name using map, fallback to ID */}
                <td className="border border-green-500 px-2 py-1">
                  {feeHeads[p.feeHeadId] || p.feeHeadId}
                </td>

                <td className="border border-green-500 px-2 py-1">{p.amount}</td>
                <td className="border border-green-500 px-2 py-1 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() =>
                        navigate("/PaymentsMaster", { state: { paymentItem: p } })
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deletePayment(p._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No payments found.
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

export default PaymentsList;
