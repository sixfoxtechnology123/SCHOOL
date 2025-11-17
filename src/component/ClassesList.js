// pages/ClassesList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";
import toast from "react-hot-toast";
import Pagination from "../component/Pagination";

const ClassesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role); // make sure this matches exactly the role in DB, e.g., "Admin"
  }, []);

  // <-- Add this line here
  const isAdmin = userRole === "Admin";


  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClasses(res.data || []);
    } catch (e) {
      console.error("Failed to fetch classes:", e);
    }
  };

  useEffect(() => {
    fetchClasses();

    const handleActivity = (e) => {
      console.log("Activity Event Fired:", e.detail?.action);
    };

    window.addEventListener("newActivity", handleActivity);
    return () => window.removeEventListener("newActivity", handleActivity);
  }, [location.key]); // Refresh when coming back from ClassesMaster

  // --- Delete class with activity logging ---
  const deleteClass = async (id, className, section) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c._id !== id));
       toast.success(`Class: "${className} and section:  ${section}"  deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete class:", err);
    }
  };
  const startIndex = (currentPage - 1) * perPage;
const paginatedclasses = classes.slice(startIndex, startIndex + perPage);

  // -----------------------------------------

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
      <div className="flex-1 overflow-y-auto p-3">
        <Header/>
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">Classes</h2>
              <div className="flex gap-4">
                <BackButton />
                <button
                  onClick={() => navigate("/classesMaster")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
                >
                  Add Class
                </button>
              </div>
            </div>
          </div>

          <table className="w-full table-auto border border-green-500">
            <thead className="bg-green-100 text-sm">
              <tr>
                <th className="border border-green-500 py-1">SL No</th>
                <th className="border border-green-500 px-2 py-1">Class ID</th>
                <th className="border border-green-500 px-2 py-1">Class Name</th>
                <th className="border border-green-500 px-2 py-1">Section</th>
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {classes.length > 0 ? (
                paginatedclasses.map((cls,index) => (
                  <tr key={cls._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 py-1">{startIndex+index+1}</td>
                    <td className="border border-green-500 px-2 py-1">{cls.classId}</td>
                    <td className="border border-green-500 px-2 py-1">{cls.className}</td>
                    <td className="border border-green-500 px-2 py-1">{cls.section}</td>
                   <td className="border border-green-500 px-2 py-1 text-center">
                      <div className="flex justify-center items-center gap-4">
                       <button
                            onClick={() => navigate("/classesMaster", { state: { classItem: cls } })}
                            className={`text-blue-600 hover:text-blue-800 ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!isAdmin}
                            title={!isAdmin ? "Only admin can edit" : ""}
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => deleteClass(cls._id, cls.className, cls.section)}
                            className={`text-red-600 hover:text-red-800 ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
           <Pagination
              total={classes.length}
              perPage={perPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
        </div>
      </div>
    </div>
  );
};

export default ClassesList;
