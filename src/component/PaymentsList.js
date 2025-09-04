import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit, FaPrint } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";

const formatDDMMYYYY = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      setPayments(res.data || []);
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [location.key]);

  const deletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/payments/${id}`);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete payment:", err);
    }
  };

  const handlePrint = (id) => {
    const payment = payments.find((p) => p._id === id);
    if (!payment) return;

    const feeLines =
      payment.feeDetails && payment.feeDetails.length > 0
        ? payment.feeDetails
            .map((f) => `${f.feeHead}: ₹${Number(f.amount).toFixed(2)}`)
            .join("<br/>")
        : "-";

    const printContent = `
      <h2>Payment Receipt</h2>
      <p><b>Payment ID:</b> ${payment.paymentId}</p>
      <p><b>Date:</b> ${formatDDMMYYYY(payment.date)}</p>
      <p><b>Student:</b> ${payment.student || "-"}</p>
      <p><b>Class:</b> ${payment.className} - ${payment.section}</p>
      <p><b>Fee Details:</b><br/>${feeLines}</p>
      <p><b>Total Amount:</b> ₹${Number(payment.totalAmount).toFixed(2)}</p>
      <p><b>Payment Mode:</b> ${payment.paymentMode}</p>
      <p><b>Transaction ID:</b> ${payment.transactionId || "-"}</p>
      <p><b>Remarks:</b> ${payment.remarks || "-"}</p>
      <p><b>Collected By:</b> ${payment.user || "-"}</p>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
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
                <th className="border px-2 py-1">Payment ID</th>
                <th className="border px-2 py-1">Student</th>
                <th className="border px-2 py-1">Class & section </th>
                <th className="border px-2 py-1">Fee Details</th>
                <th className="border px-2 py-1">Total Amount</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Payment Mode</th>
                <th className="border px-2 py-1">Txn ID</th>
                <th className="border px-2 py-1">Remarks</th>
                <th className="border px-2 py-1">Collected By</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-100 transition">
                    <td className="border px-2 py-1">{p.paymentId}</td>
                    <td className="border px-2 py-1">{p.student || "-"}</td>
                    <td className="border px-2 py-1">
                      {p.className} - {p.section}
                    </td>
                    <td className="border px-2 py-1">
                      {p.feeDetails && p.feeDetails.length > 0
                        ? p.feeDetails
                            .map(
                              (f) =>
                                `${f.feeHead}: ₹${Number(f.amount).toFixed(2)}`
                            )
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="border px-2 py-1">
                      ₹{Number(p.totalAmount).toFixed(2)}
                    </td>
                    <td className="border px-2 py-1">{formatDDMMYYYY(p.date)}</td>
                    <td className="border px-2 py-1">{p.paymentMode}</td>
                    <td className="border px-2 py-1">
                      {p.transactionId || "-"}
                    </td>
                    <td className="border px-2 py-1">{p.remarks || "-"}</td>
                    <td className="border px-2 py-1">{p.user || "-"}</td>
                    <td className="border px-2 py-1">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => handlePrint(p._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaPrint />
                        </button>
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
                  <td colSpan="11" className="text-center py-4 text-gray-500">
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
