// pages/ReceiptsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';

const formatDDMMYYYY = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const ReceiptsList = () => {
  const [receipts, setReceipts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchReceipts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/receipts");
      setReceipts(res.data || []);
    } catch (e) {
      console.error("Failed to fetch receipts:", e);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [location.key]);

  const deleteReceipt = async (id) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/receipts/${id}`);
      setReceipts((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete receipt:", err);
    }
  };

  return (
  <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
    <div className="flex-1 overflow-y-auto">
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">Receipts</h2>
          <div className="flex gap-4">
            <BackButton />
            <button
              onClick={() => navigate("/ReceiptMaster")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
            >
              Add Receipt
            </button>
          </div>
        </div>
      </div>

      <table className="w-full table-auto border border-green-500">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="border border-green-500 px-2 py-1">Receipt No</th>
            <th className="border border-green-500 px-2 py-1">Student</th>
            <th className="border border-green-500 px-2 py-1">Date</th>
            <th className="border border-green-500 px-2 py-1">Total Amount</th>
            <th className="border border-green-500 px-2 py-1">Payment Mode</th>
            <th className="border border-green-500 px-2 py-1">Collected By</th>
            <th className="border border-green-500 px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-center">
          {receipts.length > 0 ? (
            receipts.map((r) => (
              <tr key={r._id} className="hover:bg-gray-100 transition">
                <td className="border border-green-500 px-2 py-1">{r.receiptNo}</td>
                <td className="border border-green-500 px-2 py-1">
                  {r.student?.studentName || "-"}
                </td>
                <td className="border border-green-500 px-2 py-1">
                  {formatDDMMYYYY(r.date)}
                </td>
                <td className="border border-green-500 px-2 py-1">
                  {Number(r.totalAmount).toFixed(2)}
                </td>
                <td className="border border-green-500 px-2 py-1">{r.paymentMode}</td>
                <td className="border border-green-500 px-2 py-1">
                  {r.user?.username || "-"}
                </td>
                <td className="border border-green-500 px-2 py-1 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() =>
                        navigate("/ReceiptMaster", { state: { receiptItem: r } })
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteReceipt(r._id)}
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
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No receipts found.
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

export default ReceiptsList;
