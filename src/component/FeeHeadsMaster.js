// pages/FeeHeadsMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";

const FeeHeadsMaster = () => {
  const [feeHeadData, setFeeHeadData] = useState({
    feeHeadId: "",
    feeHeadName: "",
    description: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Auto-generate next FeeHead ID
  const fetchNextFeeHeadId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feeheads/latest");
      const nextId = res.data?.feeHeadId || "F01";
      setFeeHeadData((prev) => ({ ...prev, feeHeadId: nextId }));
    } catch (err) {
      console.error("Error getting FeeHead ID:", err);
    }
  };

  useEffect(() => {
    if (location.state?.feeHeadItem) {
      const f = location.state.feeHeadItem;
      setIsEditMode(true);
      setFeeHeadData({
        _id: f._id,
        feeHeadId: f.feeHeadId || "",
        feeHeadName: f.feeHeadName || "",
        description: f.description || "",
      });
    } else {
      fetchNextFeeHeadId();
      setIsEditMode(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeeHeadData({ ...feeHeadData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/feeheads/${feeHeadData._id}`,
          feeHeadData
        );
        alert("Fee Head updated successfully!");
        navigate("/feeheadslist", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/feeheads", feeHeadData);
        alert("Fee Head saved successfully!");
        navigate("/feeheadslist", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving Fee Head");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Fee Head" : "Fee Head Master"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* FeeHead ID */}
          <div>
            <label className="block font-medium">Fee Head ID</label>
            <input
              type="text"
              name="feeHeadId"
              value={feeHeadData.feeHeadId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* Fee Head Name */}
          <div>
            <label className="block font-medium">Fee Head Name</label>
            <select
              name="feeHeadName"
              value={feeHeadData.feeHeadName}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              {["Tuition", "Admission", "Exam", "Library", "Transport"].map(
                (fh) => (
                  <option key={fh} value={fh}>
                    {fh}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">Description</label>
            <textarea
              name="description"
              value={feeHeadData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              placeholder="Enter details"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
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

export default FeeHeadsMaster;
