// pages/AcademicSessionList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";
import toast from "react-hot-toast";
import Pagination from "../component/Pagination";

const AcademicSessionList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");
  
    useEffect(() => {
      const role = localStorage.getItem("userRole");
      if (role) setUserRole(role); // make sure this matches exactly the role in DB, e.g., "Admin"
    }, []);
  
    const token = localStorage.getItem("token");
    const isAdmin = userRole === "Admin";

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
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/sessions/${id}`,
       {
      headers: { Authorization: `Bearer ${token}` }
    });
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success(`Academic Session "${year}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };
const startIndex = (currentPage - 1) * perPage;
const paginatedsessions = sessions.slice(startIndex, startIndex + perPage);

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
                <th className="border border-green-500 px-2 py-1">SL No</th>
                <th className="border border-green-500 px-2 py-1">Session ID</th>
                <th className="border border-green-500 px-2 py-1">Year</th>
                <th className="border border-green-500 px-2 py-1">Start Date</th>
                <th className="border border-green-500 px-2 py-1">End Date</th>
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {sessions.length > 0 ? (
                paginatedsessions.map((s,index) => (
                  <tr key={s._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{startIndex+index+1}</td>
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
                            navigate("/AcademicSessionMaster", { state: { sessionItem: s ,token} })
                          }
                          //  className={`px-2 py-1 rounded ${!isAdmin ? "text-gray-500 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
                          //   disabled={!isAdmin}
                          //   title={!isAdmin ? "Only admin can edit" : ""}
                          className="rounded text-blue-600 hover:text-blue-800"
                          title="Edit session"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteSession(s._id, s.year)}
                          className={`rounded ${!isAdmin ? "text-gray-500 cursor-not-allowed" : "text-red-600 hover:text-red-800"}`}
                          disabled={!isAdmin}
                          title={!isAdmin ? "Only admin can delete" : ""}
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
          <Pagination
              total={sessions.length}
              perPage={perPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
        </div>
      </div>
    </div>
  );
};

export default AcademicSessionList;
