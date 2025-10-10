// pages/AcademicSessionMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AcademicSessionMaster = () => {
  const [sessionData, setSessionData] = useState({
    sessionId: "",
    year: "",
    startDate: "",
    endDate: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-generate next ID
  const fetchNextSessionId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions/latest");
      const nextId = res.data?.sessionId || "ACDSESS001";
      setSessionData((prev) => ({ ...prev, sessionId: nextId }));
    } catch (err) {
      console.error("Error getting session ID:", err);
    }
  };

  useEffect(() => {
    if (location.state?.sessionItem) {
      const s = location.state.sessionItem;
      setIsEditMode(true);
      setSessionData({
        _id: s._id,
        sessionId: s.sessionId || "",
        year: s.year || "",
        startDate: s.startDate?.slice(0, 10) || "",
        endDate: s.endDate?.slice(0, 10) || "",
      });
    } else {
      fetchNextSessionId();
      setIsEditMode(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSessionData({ ...sessionData, [name]: value });
  };

 
  // --------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/sessions/${sessionData._id}`,
          sessionData
        );

        toast.success("Session updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/sessions", sessionData);

        toast.success("Session saved successfully!");
      }
      navigate("/AcademicSessionList", { replace: true });
    } catch (err) {
      console.error("Save failed:", err);
      const message = err.response?.data?.error || "Error saving session";
      toast.success(message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Academic Session" : "Academic Session"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* Session ID */}
          <div>
            <label className="block font-medium">Session ID</label>
            <input
              type="text"
              name="sessionId"
              value={sessionData.sessionId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block font-medium">Academic Year</label>
            <input
              type="text"
              name="year"
              placeholder="e.g. 2025-26"
              value={sessionData.year}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={sessionData.startDate}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={sessionData.endDate}
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

export default AcademicSessionMaster;