// pages/FeeStructureMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate, useLocation } from "react-router-dom";

const FeeStructureMaster = () => {
  const [feeData, setFeeData] = useState({
    feeStructId: "",
    classId: "",
    feeHeadId: "",
    amount: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch latest FeeStructID
  const fetchNextId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/latest");
      setFeeData((prev) => ({ ...prev, feeStructId: res.data?.feeStructId || "FEES001" }));
    } catch (err) {
      console.error("Error fetching FeeStructID:", err);
    }
  };

  // Fetch dropdown lists
  const fetchDropdownData = async () => {
    try {
      const cls = await axios.get("http://localhost:5000/api/classes");
      const fh = await axios.get("http://localhost:5000/api/feeheads");
      setClasses(cls.data || []);
      setFeeHeads(fh.data || []);
    } catch (err) {
      console.error("Dropdown fetch failed:", err);
    }
  };

  useEffect(() => {
    if (location.state?.feeItem) {
      const f = location.state.feeItem;
      setFeeData(f);
      setIsEditMode(true);
    } else {
      fetchNextId();
      setIsEditMode(false);
    }
    fetchDropdownData();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeeData({ ...feeData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/fees/${feeData._id}`, feeData);
        alert("Fee Structure updated!");
      } else {
        await axios.post("http://localhost:5000/api/fees", feeData);
        alert("Fee Structure saved!");
      }
      navigate("/feestructurelist", { replace: true });
    } catch (err) {
      alert("Error saving Fee Structure");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Fee Structure" : "Fee Structure"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* FeeStructID */}
          <div>
            <label className="block font-medium">Fee Struct ID</label>
            <input
              type="text"
              name="feeStructId"
              value={feeData.feeStructId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* ClassID */}
          <div>
            <label className="block font-medium">Class</label>
            <select
              name="classId"
              value={feeData.classId}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.className} 
                  {/* - {c.section} */}
                </option>
              ))}
            </select>
          </div>

          {/* FeeHeadID */}
          <div>
            <label className="block font-medium">Fee Head</label>
            <select
              name="feeHeadId"
              value={feeData.feeHeadId}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              {feeHeads.map((fh) => (
                <option key={fh.feeHeadId} value={fh.feeHeadId}>
                  {fh.feeHeadName}
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
              value={feeData.amount}
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

export default FeeStructureMaster;
