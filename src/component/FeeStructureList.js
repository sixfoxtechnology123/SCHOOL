// pages/FeeStructureList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";

const FeeStructureList = () => {
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Fee Structures
  const fetchFeeStructures = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees");
      setFees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch fee structures:", err);
    }
  };

  // Fetch Class and FeeHead dropdown data for display
  const fetchDropdowns = async () => {
    try {
      const cls = await axios.get("http://localhost:5000/api/classes");
      const fh = await axios.get("http://localhost:5000/api/feeheads");
      setClasses(cls.data || []);
      setFeeHeads(fh.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };

  useEffect(() => {
    fetchFeeStructures();
    fetchDropdowns();
  }, [location.key]);

  // Delete Fee Structure
  const deleteFee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Fee Structure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fees/${id}`);
      setFees((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Failed to delete Fee Structure:", err);
    }
  };

  // Helpers for display
  const getClassName = (classId) => {
    const cls = classes.find((c) => c.classId === classId);
    return cls ? `${cls.className} - ${cls.section}` : classId;
  };

  const getFeeHeadName = (feeHeadId) => {
    const fh = feeHeads.find((f) => f.feeHeadId === feeHeadId);
    return fh ? fh.feeHeadName : feeHeadId;
  };

  return (
   <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
     <div className="flex-1 overflow-y-auto p-3">
        {/*  Added Header */}
      <Header/>
    <div className="p-2 bg-white shadow-md rounded-md">
      <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">Fee Structures</h2>
          <div className="flex gap-4">
            <BackButton />
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
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="border border-green-500 px-2 py-1">FeeStruct ID</th>
            <th className="border border-green-500 px-2 py-1">Class</th>
            <th className="border border-green-500 px-2 py-1">Fee Head</th>
            <th className="border border-green-500 px-2 py-1">Amount</th>
            <th className="border border-green-500 px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-center">
          {fees.length > 0 ? (
            fees.map((fee) => (
              <tr key={fee._id} className="hover:bg-gray-100 transition">
                <td className="border border-green-500 px-2 py-1">{fee.feeStructId}</td>
                <td className="border border-green-500 px-2 py-1">{getClassName(fee.classId)}</td>
                <td className="border border-green-500 px-2 py-1">{getFeeHeadName(fee.feeHeadId)}</td>
                <td className="border border-green-500 px-2 py-1">{fee.amount}</td>
                <td className="border border-green-500 px-2 py-1 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() =>
                        navigate("/FeeStructureMaster", { state: { feeItem: fee } })
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteFee(fee._id)}
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
                No Fee Structures found.
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

export default FeeStructureList;
