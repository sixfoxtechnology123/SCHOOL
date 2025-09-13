// pages/StudentsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data || []);
    } catch (e) {
      console.error("Failed to fetch students:", e);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]); // Refresh when coming back from StudentMaster

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Helper: robust name getter
  const getName = (stu) => {
    if (!stu) return "";
    const first = stu.firstName || stu.first_name || "";
    const last = stu.lastName || stu.last_name || "";
    if (first || last) return `${first} ${last}`.trim();
    if (stu.name) return stu.name;
    if (stu.fullName) return stu.fullName;
    return "";
  };

  // Helper: robust class getter
  const getClass = (stu) => {
    return stu.admitClass || stu.className || stu.class || stu.classLabel || "";
  };

  // Helper: robust phone getter (choose fatherPhone or fallback)
  const getPhone = (stu) => {
    return stu.fatherPhone || stu.phoneNo || stu.contact || stu.father_phone || "";
  };

  // Format DOB to DDMMYYYY (no separators)
  const formatDOB = (dob) => {
    if (!dob) return "";
    // If dob is "YYYY-MM-DD" or "YYYY-MM-DDT..."
    if (typeof dob === "string" && dob.includes("-")) {
      const datePart = dob.split("T")[0]; // remove time if any
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      }
    }
    // Fallback: try Date parse
    const dt = new Date(dob);
    if (!isNaN(dt)) {
      const d = String(dt.getDate()).padStart(2, "0");
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const y = String(dt.getFullYear());
      return `${d}${m}${y}`;
    }
    return "";
  };

  const searchTermLower = searchTerm.trim().toLowerCase();
  const filteredStudents = students.filter((s) => {
    if (!searchTermLower) return true;
    const id = (s.studentId || "").toString().toLowerCase();
    const name = getName(s).toLowerCase();
    return id.includes(searchTermLower) || name.includes(searchTermLower);
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              {/* Left: Title */}
              <h2 className="text-xl font-bold text-green-800">Students</h2>

              {/* Right: Back, Search, New Register */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:flex-row md:items-center md:gap-2 w-full md:w-auto">
                <BackButton />

                <input
                  type="text"
                  placeholder="Search by Student ID or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[300px] border border-green-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                <button
                  onClick={() => navigate("/StudentMaster")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
                >
                  New Register
                </button>
              </div>
            </div>
          </div>

          <table className="w-full table-auto border border-green-500 text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="border border-green-500 px-2 py-1">Student ID</th>
                <th className="border border-green-500 px-2 py-1">Name</th>
                <th className="border border-green-500 px-2 py-1">Class</th>
                <th className="border border-green-500 px-2 py-1">Section</th>
                <th className="border border-green-500 px-2 py-1">Roll No</th>
                <th className="border border-green-500 px-2 py-1">DOB</th>
                <th className="border border-green-500 px-2 py-1">Father</th>
                <th className="border border-green-500 px-2 py-1">Mother</th>
                <th className="border border-green-500 px-2 py-1">Phone No</th>
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{stu.studentId}</td>
                    <td className="border border-green-500 px-2 py-1">{getName(stu)}</td>
                    <td className="border border-green-500 px-2 py-1">{getClass(stu)}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.section || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.rollNo || ""}</td>
                    <td className="border border-green-500 px-2 py-1">
                      {formatDOB(stu.dob)}
                    </td>
                    <td className="border border-green-500 px-2 py-1">{stu.fatherName || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.motherName || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{getPhone(stu)}</td>
                    <td className="border border-green-500 px-2 py-1">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          onClick={() =>
                            navigate("/StudentMaster", { state: { studentItem: stu } })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteStudent(stu._id)}
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
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No students found.
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

export default StudentsList;
