// pages/PaymentsList.js
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
  const [students, setStudents] = useState([]);   //  added for student names
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  //  Fetch payments
  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      setPayments(res.data || []);
      console.log("Payments data:", res.data);
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    }
  };

  //  Fetch students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data || []);
    } catch (e) {
      console.error("Failed to fetch students:", e);
    }
  };

  //  Run both fetches
  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [location.key]);

 // Helper to map studentId -> Full Name
const getStudentName = (studentId) => {
  const stu = students.find((s) => s.studentId === studentId);
  return stu ? `${stu.firstName || ""} ${stu.lastName || ""}`.trim() : studentId;
};


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
            .map(
              (f) =>
                `<tr>
                  <td style="border:1px solid #333;padding:6px;">${f.feeHead}</td>
                  <td style="border:1px solid #333;padding:6px;text-align:right;">₹${Number(f.amount).toFixed(2)}</td>
                </tr>`
            )
            .join("")
        : `<tr><td colspan="2" style="border:1px solid #333;padding:6px;text-align:center;">No Fee Details</td></tr>`;

    const printContent = `
      <div style="font-family: Arial; padding:10px; max-width:750px; margin:auto; border:1px solid #333;">
        
      <!-- ===== School Header Section ===== -->
          <div style="display:flex; align-items:center; margin-bottom:3px; border:none; padding:0;">
            <!-- Logo -->
           <div style="flex-shrink:0; margin-right:15px; border:none; padding:0;">
          <img src="logo.jpg" alt="School Logo" 
              style="height:80px; width:80px; display:block; border-radius:50%; border:none;" />
        </div>

            <!-- School Info -->
            <div style="text-align:center; flex-grow:1; border:none; padding:0;">
              <h1 style="margin:0; font-size:26px; font-weight:bold;">Central Public School</h1>
              <h3 style="margin:2px 0; font-size:16px; font-weight:normal;">(English Medium Co-education School)</h3>
              <p style="margin:2px 0; font-size:13px;">
                Affiliated to Council for the Indian School Certificate Examination (CISCE), New Delhi, Code-WB 412
              </p>
              <p style="margin:2px 0; font-size:13px;">
                Nilgange, Matarangi, Barrackpore-Barasat Road, Kol-121
              </p>
              <hr style="margin:5px 0; border-top:2px solid #333;" />
            </div>
          </div>

        <div style="background:#C4C4C4; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
              padding:8px; 
              margin-bottom:10px; 
              text-align:center; 
              border:1px solid #333;">
        <h2 style="margin:0; font-size:18px;">Payment Receipt</h2>
      </div>

   <!-- ===== Payment Info ===== -->
    <table style="width:100%; margin-bottom:10px; border-collapse:collapse;">
      <tr>
        <!-- Left side -->
        <td style="vertical-align: top; padding-right: 30px;">
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding-right: 10px;"><b>Receipt No</b></td>
              <td><b>:</b> ${payment.paymentId}</td>
            </tr>
            <tr>
              <td><b>Student</b></td>
              <td><b>:</b> ${getStudentName(payment.student)}-${payment.student}</td>
            </tr>
            <tr>
              <td><b>Date</b></td>
              <td><b>:</b> ${formatDDMMYYYY(payment.date)}</td>
            </tr>
          </table>
        </td>

        <!-- Right side -->
        <td style="vertical-align: top;">
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding-right: 10px;"><b>Class</b></td>
              <td><b>:</b> ${payment.admitClass || "-"}</td>
            </tr>
            <tr>
              <td><b>Section</b></td>
              <td><b>:</b> ${payment.section || "-"}</td>
            </tr>
            <tr>
              <td><b>Roll No</b></td>
              <td><b>:</b> ${payment.rollNo || "-"}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>



       <!-- ===== Fee Table ===== -->
    <table style="width:100%; border-collapse:collapse; margin:10px 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
      <thead>
        <tr style="background:#C4C4C4;">
          <th style="border:1px solid #333; padding:6px; text-align:left;">Fee Heads</th>
          <th style="border:1px solid #333; padding:6px; text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${feeLines.replace(/<td style="border:1px solid #333;padding:6px;">/g, '<td style="border:1px solid #333;padding:6px;text-align:left;">')}
        <tr style="background:#C4C4C4;">
          <td style="border:1px solid #333; padding:6px; text-align:left; font-weight:bold;">Total</td>
          <td style="border:1px solid #333; padding:6px; text-align:right; font-weight:bold;">₹${Number(payment.totalAmount).toFixed(2)}</td>
        </tr>
         <tr>
        <td style="border:1px solid #333; padding:6px; text-align:left; font-weight:bold;">Paid Amount</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">₹${Number(payment.amountPaid).toFixed(2)}</td>
      </tr>
      </tbody>
    </table>

      <!-- ===== Additional Info ===== -->
    <table style="width:100%; margin:10px 0 5px 0; font-size:14px; border-collapse:collapse;">
      <tr>
        <!-- Left side -->
        <td style="vertical-align: top; padding-right: 30px;">
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding-right: 10px;"><b>Payment Mode</b></td>
              <td><b>:</b> ${payment.paymentMode || "-"}</td>
            </tr>
            <tr>
              <td><b>Remarks</b></td>
              <td><b>:</b> ${payment.remarks || "-"}</td>
            </tr>
          </table>
        </td>

        <!-- Right side -->
        <td style="vertical-align: top;">
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding-right: 10px;"><b>Transaction ID</b></td>
              <td><b>:</b> ${payment.transactionId || "-"}</td>
            </tr>
            <tr>
              <td><b>Collected By</b></td>
              <td><b>:</b> ${payment.user || "-"}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>


        <!-- ===== Signature Section 
        <div style="display:flex; justify-content:space-between; font-size:13px; margin-top:40px;">
          <div style="display:flex; flex-direction: column; align-items:center; line-height:1;">
            <span style="border-top:1px solid black; width:150px; margin:0 0 5px 0;"></span>
            <b style="margin:0; padding:0;">Parent/Guardian Signature</b>
          </div>
          <div style="display:flex; flex-direction: column; align-items:center; line-height:1;">
            <span style="border-top:1px solid black; width:150px; margin:0 0 5px 0;"></span>
            <b style="margin:0; padding:0;">Authorized Signatory</b>
          </div>
        </div>===== -->

      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; padding: 0; }
            }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  

  // Filter payments based on search term
  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.student && p.student.toLowerCase().includes(term)) ||
      (p.paymentId && p.paymentId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Left: Payments Title */}
          <h2 className="text-xl font-bold text-green-800">Payments</h2>

          {/* Right: Back, Search, Add Payment */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:flex-row md:items-center md:gap-2 w-full md:w-auto">
            <BackButton />

            <input
              type="text"
              placeholder="Search by Student Name or Receipt ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[300px] border border-green-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <button
              onClick={() => navigate("/PaymentsMaster")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
            >
              Add Payment
            </button>
          </div>
        </div>
      </div>


          {/* Table with green borders */}
          <table className="w-full table-auto border border-green-600">
            <thead className="bg-green-100 text-sm">
              <tr>
                <th className="border border-green-600 px-1 py-1">Payment ID</th>
                <th className="border border-green-600 px-1 py-1">Session</th>
                <th className="border border-green-600 px-1 py-1">Student</th>
                <th className="border border-green-600 px-1 py-1">Class</th>
                <th className="border border-green-600 px-1 py-1">Sec</th>
                <th className="border border-green-600 px-1 py-1">Roll</th>
                <th className="border border-green-600 px-1 py-1">Fee Heads</th>
                <th className="border border-green-600 px-1 py-1">Total Amount</th>
                <th className="border border-green-600 px-1 py-1">Paid Amount</th>
                <th className="border border-green-600 px-1 py-1">Pending Amount</th>
                <th className="border border-green-600 px-1 py-1">Date</th>
                <th className="border border-green-600 px-1 py-1">Pay Mode</th>
                {/* <th className="border border-green-600 px-1 py-1">Txn ID</th>
                <th className="border border-green-600 px-1 py-1">Card Number</th> */}
                <th className="border border-green-600 px-1 py-1">Remarks</th>
                <th className="border border-green-600 px-1 py-1">Collected By</th>
                <th className="border border-green-600 px-1 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-600 px-1 py-1">{p.paymentId}</td>
                    <td className="border border-green-600 px-1 py-1">{p.academicSession}</td>
                    <td className="border border-green-600 px-1 py-1">{getStudentName(p.student)}</td>
                    <td className="border border-green-600 px-1 py-1">{p.admitClass}</td>
                    <td className="border border-green-600 px-1 py-1">{p.section}</td>
                    <td className="border border-green-600 px-1 py-1">{p.rollNo}</td>
                   <td className="border border-green-600 px-1 py-1 text-left">
                      {p.feeDetails && p.feeDetails.length > 0
                        ? p.feeDetails.map(f => `${f.feeHead}: ₹${f.amount}`).join(", ")
                        : "-"}
                    </td>
                    <td className="border border-green-600 px-1 py-1">
                      ₹{Number(p.totalAmount).toFixed(2)}
                    </td>
                    <td className="border border-green-600 px-1 py-1">
                      ₹{Number(p.amountPaid).toFixed(2)}
                    </td>
                     <td className="border border-green-600 px-1 py-1">
                      ₹{Number(p.pendingAmount).toFixed(2)}
                    </td>
                    <td className="border border-green-600 px-1 py-1">{formatDDMMYYYY(p.date)}</td>
                    <td className="border border-green-600 px-1 py-1">{p.paymentMode}</td>
                    {/* <td className="border border-green-600 px-1 py-1">
                      {p.transactionId || "-"}
                    </td>
                    <td className="border border-green-600 px-1 py-1">
                      {p.cardNumber || "-"}
                    </td> */}
                    <td className="border border-green-600 px-1 py-1">{p.remarks || "-"}</td>
                    <td className="border border-green-600 px-1 py-1">{p.user || "-"}</td>
                    <td className="border border-green-600 px-1 py-1">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => handlePrint(p._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaPrint />
                        </button>
                       {/*<button
                          onClick={() =>
                            navigate("/PaymentsMaster", { state: { paymentItem: p } })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>*/}
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
                  <td colSpan="13" className="text-center py-4 text-gray-500">
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
