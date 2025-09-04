// pages/PaymentsMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

const PaymentsMaster = () => {
  const [paymentData, setPaymentData] = useState({
    paymentId: "",
    date: new Date().toISOString().split("T")[0], 
    student: "",
    className: "",
    section: "",
    rollNo: "", //  added roll number
    feeDetails: [], 
    totalAmount: 0,
    paymentMode: "",
    transactionId: "",
    remarks: "",
    user: localStorage.getItem("userId") || "admin",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [students, setStudents] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch Students & FeeHeads
  const fetchDropdownData = async () => {
    try {
      const stuRes = await axios.get("http://localhost:5000/api/students");
      setStudents(stuRes.data || []);

      const fhRes = await axios.get("http://localhost:5000/api/feeheads");
      setFeeHeads(fhRes.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  // Fetch Next PaymentId
  const fetchNextPaymentId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments/latest");
      const nextId = res.data?.paymentId || "PAY001";
      setPaymentData((prev) => ({ ...prev, paymentId: nextId }));
    } catch (err) {
      console.error("Error getting paymentId:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    if (location.state?.paymentItem) {
      const p = location.state.paymentItem;
      setIsEditMode(true);
      setPaymentData({
        ...p,
        date: p.date?.slice(0, 10),
        user: p.user || localStorage.getItem("userId") || "admin",
      });
    } else {
      fetchNextPaymentId();
      setIsEditMode(false);
    }
  }, [location.state]);

  // Handle Student Select → Save as "Name - ID" + fetch class, section, roll
  const handleStudentChange = (selected) => {
    if (!selected) {
      setPaymentData((prev) => ({
        ...prev,
        student: "",
        className: "",
        section: "",
        rollNo: "",
      }));
      return;
    }
    const stu = students.find((s) => s._id === selected.value);
    const studentDisplay = `${stu?.studentName || stu?.name || ""} - ${stu?.studentId || ""}`;
    setPaymentData((prev) => ({
      ...prev,
      student: studentDisplay,
      className: stu?.className || "",
      section: stu?.section || "",
      rollNo: stu?.rollNo || "", //  auto fetch roll number
    }));
  };

  // Handle FeeHead Multi-Select
  const handleFeeHeadChange = (selected) => {
    const newHeads = selected || [];
    const newFeeDetails = newHeads.map((fh) => {
      const existing = paymentData.feeDetails.find((f) => f.feeHead === fh.value);
      return {
        feeHead: fh.value,
        amount: existing ? existing.amount : fh.defaultAmount || " ",
      };
    });

    const total = newFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);

    setPaymentData((prev) => ({
      ...prev,
      feeDetails: newFeeDetails,
      totalAmount: total,
    }));
  };

  // Handle Amount Change (per head)
  const handleAmountChange = (feeHead, value) => {
    const updatedFeeDetails = paymentData.feeDetails.map((f) =>
      f.feeHead === feeHead ? { ...f, amount: Number(value) } : f
    );
    const total = updatedFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    setPaymentData((prev) => ({
      ...prev,
      feeDetails: updatedFeeDetails,
      totalAmount: total,
    }));
  };

  // General Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      ["UPI", "Card", "NetBanking"].includes(paymentData.paymentMode) &&
      !paymentData.transactionId
    ) {
      alert("Transaction ID required for this payment mode!");
      return;
    }

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/payments/${paymentData._id}`, paymentData);
        alert("Receipt updated successfully!");
        navigate("/PaymentsList", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/payments", paymentData);
        alert("Receipt saved successfully!");
        fetchNextPaymentId();
        setPaymentData({
          paymentId: "",
          date: new Date().toISOString().split("T")[0],
          student: "",
          className: "",
          section: "",
          rollNo: "",
          feeDetails: [],
          totalAmount: 0,
          paymentMode: "",
          transactionId: "",
          remarks: "",
          user: localStorage.getItem("userId") || "admin",
        });
        navigate("/PaymentsList", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Error saving receipt");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Receipt" : "New Receipt"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Payment Id */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Payment Id
            <input
              type="text"
              name="paymentId"
              value={paymentData.paymentId}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Date */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Date
            <input
              type="date"
              name="date"
              value={paymentData.date}
              onChange={handleChange}
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          {/* Student Dropdown */}
          <label className="flex flex-col text-sm font-semibold text-black col-span-2">
            Student
            <Select
              options={students.map((s) => ({
                value: s._id,
                label: `${s.studentName || s.name || ""} - ${s.studentId || ""}`,
              }))}
              onChange={handleStudentChange}
              value={
                paymentData.student
                  ? { value: paymentData.student, label: paymentData.student }
                  : null
              }
              placeholder="Search Student..."
              isSearchable
              isClearable
            />
          </label>

          {/* Class */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Class
            <input
              type="text"
              name="className"
              value={paymentData.className}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Section */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Section
            <input
              type="text"
              name="section"
              value={paymentData.section}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Roll Number */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Roll No
            <input
              type="text"
              name="rollNo"
              value={paymentData.rollNo}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Fee Heads Multi-select */}
          <label className="flex flex-col text-sm font-semibold text-black col-span-2">
            Fee Heads
            <Select
              isMulti
              options={feeHeads.map((fh) => ({
                value: fh.feeHeadName,
                label: fh.feeHeadName,
                defaultAmount: fh.defaultAmount || 0,
              }))}
              onChange={handleFeeHeadChange}
              value={paymentData.feeDetails.map((f) => ({
                value: f.feeHead,
                label: f.feeHead,
              }))}
              placeholder="Select Fee Heads..."
              isSearchable
            />
          </label>

          {/* Amount per head */}
          {paymentData.feeDetails.map((f) => (
            <label key={f.feeHead} className="flex flex-col text-sm font-semibold text-black">
              {f.feeHead} Amount
              <input
                type="number"
                value={f.amount}
                onChange={(e) => handleAmountChange(f.feeHead, e.target.value)}
                className="border border-gray-400 p-1 rounded"
              />
            </label>
          ))}

          {/* Payment Mode */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Payment Mode
            <select
              name="paymentMode"
              value={paymentData.paymentMode}
              onChange={handleChange}
              className="border border-gray-400 p-1 rounded"
              required
            >
              <option value="">-- Select Mode --</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </label>

          {/* Transaction ID */}
          <label className="flex flex-col text-sm col-span-2 font-semibold text-black">
            Transaction ID
            <input
              type="text"
              name="transactionId"
              value={paymentData.transactionId}
              onChange={handleChange}
              placeholder="Txn ID / Ref No"
              className="border border-gray-400 p-1 rounded"
            />
          </label>

          {/* Total Amount */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Total Amount
            <input
              type="number"
              name="totalAmount"
              value={paymentData.totalAmount}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Remarks */}
          <label className="flex flex-col text-sm font-semibold text-black col-span-2 lg:col-span-2">
            Remarks
            <input
              type="text"
              name="remarks"
              value={paymentData.remarks}
              onChange={handleChange}
              placeholder="Remarks"
              className="border border-gray-400 p-1 rounded"
            />
          </label>

          {/* Collected By */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Collected By
            <input
              type="text"
              name="user"
              value={paymentData.user}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Buttons */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-between mt-4">
            <BackButton />
            <button
              type="submit"
              className={`px-6 py-1 rounded text-white ${
                isEditMode ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentsMaster;
