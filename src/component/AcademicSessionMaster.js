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

  // -------------------- Auto-generate next Session ID --------------------
  const fetchNextSessionId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions/latest");
      const nextId = res.data?.sessionId || "ACDSESS001";
      setSessionData((prev) => ({ ...prev, sessionId: nextId }));
    } catch (err) {
      console.error("Error getting session ID:", err);
      toast.error("Failed to generate next session ID");
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

  // -------------------- Handle Input Change --------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSessionData({ ...sessionData, [name]: value });
  };

  // utils/formatDate.js (or inside the component)
 const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-indexed
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};


const handleYearChange = (e) => {
  const value = e.target.value.trim();
  setSessionData({ ...sessionData, year: value });

  // Only run validation if input matches full pattern YYYY-YYYY
  const regex = /^\d{4}-\d{4}$/;
  if (!regex.test(value)) {
    setSessionData((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    return; // don't show error yet
  }

  const [startYear, endYear] = value.split("-").map(Number);

  if (endYear !== startYear + 1) {
    toast.error("Invalid session! End year must be start year + 1");
    setSessionData((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    return;
  }

  // Auto-set dates
  const startDate = `${startYear}-04-01`;
  const endDate = `${endYear}-03-31`;
  setSessionData((prev) => ({
    ...prev,
    startDate,
    endDate,
  }));
  toast.success(`Session ${value} set! (${startDate} to ${endDate})`);
};


  // -------------------- Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { year, startDate, endDate } = sessionData;
    if (!year || !startDate || !endDate) {
      toast.error("Please fill all fields correctly before saving");
      return;
    }

    try {
      if (isEditMode) {
        const token = localStorage.getItem("token"); 
        await axios.put(
          `http://localhost:5000/api/sessions/${sessionData._id}`,
          sessionData,
         {
            headers: { Authorization: `Bearer ${token}` }, // add headers
          }
        );

        toast.success("Session updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/sessions", sessionData);
        toast.success("Session saved successfully!");
      }

      navigate("/AcademicSessionList", { replace: true });
    } catch (err) {
      console.error("Save failed:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error saving session";
      toast.error(message);
    }
  };

  // -------------------- JSX --------------------
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

          {/* Academic Year */}
          <div>
            <label className="block font-medium">Academic Year</label>
            <input
              type="text"
              name="year"
              placeholder="e.g. 2023-2024"
              value={sessionData.year}
              onChange={handleYearChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

         {/* Start Date */}
            <div>
              <label className="block font-medium">Start Date</label>
              <input
                type="text"               // use text instead of date
                name="startDate"
                value={formatDate(sessionData.startDate)}
                readOnly
                className="w-full border border-gray-300 p-1 rounded bg-gray-100"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block font-medium">End Date</label>
              <input
                type="text"
                name="endDate"
                value={formatDate(sessionData.endDate)}
                readOnly
                className="w-full border border-gray-300 p-1 rounded bg-gray-100"
              />
            </div>


          {/* Buttons */}
          <div className="flex justify-between mt-2">
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
