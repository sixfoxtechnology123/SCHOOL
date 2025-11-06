import React, { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OutstandingFees = () => {
  const [outstandingData, setOutstandingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  const allSections = ["A", "B", "C"];
  const predefinedClasses = [
    "Class - I", "Class - II", "Class - III", "Class - IV",
    "Class - V", "Class - VI", "Class - VII", "Class - VIII",
    "Class - IX", "Class - X", "Class - XI", "Class - XII",
  ];

  useEffect(() => {
    axios.get("http://localhost:5000/api/reports/outstanding-fees")
      .then((res) => {
        setOutstandingData(res.data || []);
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredData = outstandingData.filter((item) => {
    const matchName = searchTerm ? item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchClass = filterClass ? item.class?.trim() === filterClass.trim() : true;
    const matchSection = filterSection ? item.section?.trim().toUpperCase() === filterSection.trim().toUpperCase() : true;
    return matchName && matchClass && matchSection;
  });

  const viewStudentDetails = async (studentId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reports/student-fees/${studentId}`);
      setSelectedStudent(res.data);
      setShowModal(true);
    } catch (err) {
      console.log("Error fetching student fee details:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-green-800">Outstanding Fees</h2>
              <div className="flex items-center gap-2">
                <BackButton />
                <input
                  type="text"
                  placeholder="Search by student name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border px-2 py-1 rounded text-sm border-gray-500"
                />
                <button
                  onClick={() => navigate("/ReportsDashboard")}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  title="Reports Dashboard"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Class:</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {predefinedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Section:</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {allSections.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>

            {(filterClass || filterSection || searchTerm) && (
              <button
                onClick={() => {
                  setFilterClass("");
                  setFilterSection("");
                  setSearchTerm("");
                }}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-500">
              <thead className="bg-green-100 text-sm">
                <tr>
                  <th className="border border-green-500 px-2 py-1">Student ID</th>
                  <th className="border border-green-500 px-2 py-1">Student Name</th>
                  <th className="border border-green-500 px-2 py-1">Class</th>
                  <th className="border border-green-500 px-2 py-1">Section</th>
                  <th className="border border-green-500 px-2 py-1">Roll Number</th>
                  <th className="border border-green-500 px-2 py-1">Pending Fee Amount</th>
                  <th className="border border-green-500 px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{item.studentId || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{item.studentName || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{item.class || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{item.section || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">{item.rollNo || "-"}</td>
                    <td className="border border-green-500 px-2 py-1">₹{item.pendingAmount}</td>
                    <td className="border border-green-500 px-2 py-1">
                      <button onClick={() => viewStudentDetails(item.studentId)} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">View</button>
                      
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

       {/* Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
            <div className="bg-white w-11/12 md:w-2/3 p-4 rounded shadow-lg relative max-h-[80vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-red-500 font-bold"
                onClick={() => setShowModal(false)}
              >
                X
              </button>
              <h3 className="text-lg font-semibold mb-2 text-green-800">{selectedStudent.studentName} - Fee Details</h3>
              <table className="w-full table-auto border border-green-500 mb-2">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="border border-green-500 px-2 py-1">Fee Head</th>
                    <th className="border border-green-500 px-2 py-1">Amount</th>
                    <th className="border border-green-500 px-2 py-1">Amount Paid</th>
                    <th className="border border-green-500 px-2 py-1">Pending Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.feeDetails.map((f, idx) => (
                    <tr key={idx} className="hover:bg-green-50">
                      <td className="border border-green-500 px-2 py-1">{f.feeHead}</td>
                      <td className="border border-green-500 px-2 py-1">₹{f.originalAmount}</td>
                      <td className="border border-green-500 px-2 py-1">₹{f.amountPaid}</td>
                      <td className="border border-green-500 px-2 py-1 font-semibold">₹{f.pendingAmount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-green-100 text-black">
                    <td className="border border-green-500 px-2 py-1 text-right" colSpan={3}>Total Pending (All Fee Heads):</td>
                    <td className="border border-green-500 px-2 py-1">₹{selectedStudent.feeDetails.reduce((sum, f) => sum + f.pendingAmount, 0)}</td>
                  </tr>

                    <tr className="font-semibold bg-green-100 text-black">
                    <td className="border border-green-500 px-2 py-1 text-right" colSpan={3}>Previous Pending Amount:</td>
                    <td className="border border-green-500 px-2 py-1">₹{selectedStudent.overallPendingAmount}</td>
                  </tr>
                </tfoot>
              </table>
              {/* <div className="text-center font-semibold mt-2 text-black">
                Previous Pending Amount: ₹{selectedStudent.overallPendingAmount}
              </div> */}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default OutstandingFees;
