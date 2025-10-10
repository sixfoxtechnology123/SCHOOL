// pages/AcademicSessionList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";
import toast from "react-hot-toast";

const AcademicSessionList = () => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions");
      setSessions(res.data || []);
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [location.key]);

  
  // --------------------------------------------------------

  const deleteSession = async (id, year) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success(`Academic Session "${year}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
      <div className="flex-1 overflow-y-auto p-3">
        <Header/>
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">Academic Sessions</h2>
              <div className="flex gap-4">
                <BackButton />
                <button
                  onClick={() => navigate("/AcademicSessionMaster")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
                >
                  Add Session
                </button>
              </div>
            </div>
          </div>

          <table className="w-full table-auto border border-green-500">
            <thead className="bg-green-100 text-sm">
              <tr>
                <th className="border border-green-500 px-2 py-1">Session ID</th>
                <th className="border border-green-500 px-2 py-1">Year</th>
                <th className="border border-green-500 px-2 py-1">Start Date</th>
                <th className="border border-green-500 px-2 py-1">End Date</th>
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{s.sessionId}</td>
                    <td className="border border-green-500 px-2 py-1">{s.year}</td>
                    <td className="border border-green-500 px-2 py-1">
                      {new Date(s.startDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="border border-green-500 px-2 py-1">
                      {new Date(s.endDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="border border-green-500 px-2 py-1 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          onClick={() =>
                            navigate("/AcademicSessionMaster", { state: { sessionItem: s } })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteSession(s._id, s.year)}
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
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No sessions found.
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

export default AcademicSessionList;
