// pages/PaymentsMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentsMaster = () => {
  const [paymentData, setPaymentData] = useState({
    paymentId: "",
    receiptNo: "",
    feeHeadId: "",
    amount: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchNextPaymentId = async () => {
    const res = await axios.get("http://localhost:5000/api/payments/latest");
    setPaymentData((prev) => ({ ...prev, paymentId: res.data?.paymentId || "Payment001" }));
  };

  const fetchDropdowns = async () => {
    // TODO: Replace with real APIs
    const receiptRes = await axios.get("http://localhost:5000/api/receipts");
    const feeHeadRes = await axios.get("http://localhost:5000/api/feeheads");
    setReceipts(receiptRes.data || []);
    setFeeHeads(feeHeadRes.data || []);
  };

  useEffect(() => {
    if (location.state?.paymentItem) {
      const p = location.state.paymentItem;
      setPaymentData(p);
      setIsEditMode(true);
    } else {
      fetchNextPaymentId();
      setIsEditMode(false);
    }
    fetchDropdowns();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await axios.put(`http://localhost:5000/api/payments/${paymentData._id}`, paymentData);
      alert("Payment updated successfully!");
    } else {
      await axios.post("http://localhost:5000/api/payments", paymentData);
      alert("Payment saved successfully!");
    }
    navigate("/PaymentsList", { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Payment" : "Payments Master"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* Payment ID */}
          <div>
            <label className="block font-medium">Payment ID</label>
            <input
              type="text"
              name="paymentId"
              value={paymentData.paymentId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* ReceiptNo */}
          <div>
            <label className="block font-medium">Receipt No</label>
            <select
              name="receiptNo"
              value={paymentData.receiptNo}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              {receipts.map((r) => (
                <option key={r._id} value={r.receiptNo}>
                  {r.receiptNo}
                </option>
              ))}
            </select>
          </div>

          {/* FeeHead */}
          <div>
            <label className="block font-medium">Fee Head</label>
            <select
              name="feeHeadId"
              value={paymentData.feeHeadId}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              {feeHeads.map((f) => (
                <option key={f._id} value={f.feeHeadId}>
                  {f.feeHeadName}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block font-medium">Amount</label>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

          <div className="flex justify-between">
            <BackButton />
            <button
              type="submit"
              className={`px-4 py-1 rounded text-white ${
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
