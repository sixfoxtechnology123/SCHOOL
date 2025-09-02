// pages/ReceiptMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

const ReceiptMaster = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNo: "",
    studentId: "",
    date: "",
    totalAmount: "",
    paymentMode: "",
    userId: "",
  });

  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await axios.get(
          "http://localhost:5000/api/receipts/students"
        );
        setStudents(studentRes.data || []);

        const userRes = await axios.get("http://localhost:5000/api/users");
        setUsers(userRes.data || []);
      } catch (err) {
        console.error("Dropdown fetch failed:", err);
      }
    };
    fetchData();
  }, []);

  // Auto-generate next ReceiptNo
  const fetchNextReceiptNo = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/receipts/latest");
      setReceiptData((prev) => ({
        ...prev,
        receiptNo: res.data?.receiptNo || "RECIEPT001",
      }));
    } catch (err) {
      console.error("Error getting receipt no:", err);
    }
  };

  useEffect(() => {
    if (location.state?.receiptItem) {
      const r = location.state.receiptItem;
      setIsEditMode(true);
      setReceiptData({
        _id: r._id,
        receiptNo: r.receiptNo,
        studentId: r.student?.studentId || "",
        date: r.date,
        totalAmount: r.totalAmount,
        paymentMode: r.paymentMode,
        userId: r.user?.userId || "",
      });
    } else {
      fetchNextReceiptNo();
      setIsEditMode(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceiptData({ ...receiptData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/receipts/${receiptData._id}`,
          receiptData
        );
        alert("Receipt updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/receipts", receiptData);
        alert("Receipt saved successfully!");
      }
      navigate("/ReceiptsList", { replace: true });
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving receipt. Please check all fields.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Receipt" : "Receipt Master"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* Receipt No */}
          <div>
            <label className="block font-medium">Receipt No</label>
            <input
              type="text"
              name="receiptNo"
              value={receiptData.receiptNo}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* Student */}
          <div>
            <label className="block font-medium">Student</label>
            <Select
              options={students.map((s) => ({
                value: s.studentId, // use custom ID like ST001
                label: s.name,
              }))}
              value={
                receiptData.studentId
                  ? {
                      value: receiptData.studentId,
                      label:
                        students.find((s) => s.studentId === receiptData.studentId)
                          ?.name || "",
                    }
                  : null
              }
              onChange={(option) =>
                setReceiptData({ ...receiptData, studentId: option.value })
              }
              placeholder="Search student..."
              isSearchable
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={receiptData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block font-medium">Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={receiptData.totalAmount}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block font-medium">Payment Mode</label>
            <select
              name="paymentMode"
              value={receiptData.paymentMode}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          {/* Collected By */}
          <div>
            <label className="block font-medium">Collected By</label>
            <Select
              options={users.map((u) => ({
                value: u.userId, // use custom ID like USER001
                label: u.username,
              }))}
              value={
                receiptData.userId
                  ? {
                      value: receiptData.userId,
                      label:
                        users.find((u) => u.userId === receiptData.userId)
                          ?.username || "",
                    }
                  : null
              }
              onChange={(option) =>
                setReceiptData({ ...receiptData, userId: option.value })
              }
              placeholder="Select user..."
              isSearchable
            />
          </div>

          <div className="flex justify-between mt-3">
            <BackButton />
            <button
              type="submit"
              className={`px-4 py-1 rounded text-white ${
                isEditMode
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-600 hover:bg-green-700"
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

export default ReceiptMaster;
