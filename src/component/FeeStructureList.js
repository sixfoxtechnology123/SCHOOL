// pages/FeeStructureList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";
import toast from "react-hot-toast";
import Pagination from "../component/Pagination";

const FeeStructureList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [fees, setFees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessions, setSessions] = useState([]);
  const [filterSession, setFilterSession] = useState("");
  const [filterClass, setFilterClass] = useState(""); // selected class in filter
  const [allClasses, setAllClasses] = useState([]); // all classes from backend


  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all fee structures
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees");
      setFees(res.data || []);
    } catch (err) {
      console.error("Error fetching fee structures:", err);
    }
  };

  // Fetch academic sessions
  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions");
      if (Array.isArray(res.data)) {
        const sorted = res.data
          .map(s => ({ id: s._id, name: s.name || s.year }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setSessions(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSessions();

  }, [location.key]);


useEffect(() => {
  const fetchAllClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      const uniqueClasses = Array.from(
        new Map(res.data.map((c) => [c.className, c])).values()
      );
      setAllClasses(uniqueClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };
  fetchAllClasses();
}, []);


// --- Delete fee with activity logging and custom toast ---
const deleteFee = async (id, className, feeHeadName) => {
  if (!window.confirm(`Are you sure you want to delete the fee: ${feeHeadName} for class: ${className}?`)) return;

  try {
    // Delete on server
    await axios.delete(`http://localhost:5000/api/fees/${id}`);

    // Update frontend state
    setFees(prev => prev.filter(f => f._id !== id));

    // Show success toast with class and fee head
    toast.success(`Fee "${feeHeadName}" for "${className}" deleted successfully!`);
  } catch (err) {
    console.error("Failed to delete Fee Structure:", err);
    toast.error(`Failed to delete fee "${feeHeadName}" for class "${className}"`);
  }
};

// -----------------------------------------

// Filter fees based on search term, class, and session filters
const filteredFees = fees.filter(fee =>
  (
    fee.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.feeHeadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.academicSession?.toLowerCase().includes(searchTerm.toLowerCase())
  ) &&
  (filterSession ? fee.academicSession === filterSession : true) &&
  (filterClass ? fee.classId === filterClass : true)
);

const startIndex = (currentPage - 1) * perPage;
const paginatedFees = filteredFees.slice(startIndex, startIndex + perPage);


  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-green-800">Fee Structures</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:flex-row md:items-center md:gap-2 w-full md:w-auto">
                <BackButton />
                {/* Search Input */}
               <input
                  type="text"
                  placeholder="Search by Class, Fee Head, or Session"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[270px] border border-green-500 rounded px-2 py-0 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {/* Class Filter */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Classes</option>
                  {allClasses.map((c) => (
                    <option key={c.classId} value={c.classId}>{c.className}</option>
                  ))}
                </select>

                {/* Session Filter */}
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Sessions</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>

                {/* Clear Button — clears both filters */}
                {(filterSession || filterClass) && (
                  <button
                    onClick={() => {
                      setFilterSession("");
                      setFilterClass("");
                    }}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Clear
                  </button>
                )}

                <button
                  onClick={() => navigate("/FeeStructureMaster")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
                >
                  Add Fee Structure
                </button>


              </div>
            </div>
          </div>

          <table className="w-full table-auto border border-green-500">
            <thead className="bg-green-100 text-sm">
              <tr>
                <th className="border border-green-500 px-2 py-1">SL No</th>
                <th className="border border-green-500 px-2 py-1">FeeStruct ID</th>
                <th className="border border-green-500 px-2 py-1">Session</th>
                <th className="border border-green-500 px-2 py-1">Class</th>
                <th className="border border-green-500 px-2 py-1">Fee Head</th>
                {/* <th className="border border-green-500 px-2 py-1">Month</th> */}
                <th className="border border-green-500 px-2 py-1">Amount</th>
                <th className="border border-green-500 px-2 py-1">Distance (KM)</th>
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {filteredFees.length > 0 ? (
                paginatedFees.map((fee,index) => (
                  <tr key={fee._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{startIndex+index+1}</td>
                    <td className="border border-green-500 px-2 py-1">{fee.feeStructId}</td>
                    <td className="border border-green-500 px-2 py-1">{fee.academicSession}</td>
                    <td className="border border-green-500 px-2 py-1">{fee.className}</td>
                    <td className="border border-green-500 px-2 py-1">{fee.feeHeadName}</td>
                    {/* <td className="border border-green-500 px-2 py-1">{fee.month || "-"}</td> */}
                    <td className="border border-green-500 px-2 py-1">{fee.amount}</td>
                    <td className="border border-green-500 px-2 py-1">{fee.distance || "-"}</td>
                    <td className="border border-green-500 px-2 py-1 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          onClick={() => navigate("/FeeStructureMaster", { state: { feeItem: fee } })}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteFee(fee._id, fee.className, fee.feeHeadName)}
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
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No Fee Structures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            <Pagination
              total={filteredFees.length}
              perPage={perPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
        </div>
      </div>
    </div>
  );
};

export default FeeStructureList;
