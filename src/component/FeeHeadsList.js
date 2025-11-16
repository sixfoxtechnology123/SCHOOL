// pages/FeeHeadsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";
import toast from "react-hot-toast";
import Pagination from "../component/Pagination";

const FeeHeadsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [feeHeads, setFeeHeads] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchFeeHeads = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feeheads");
      setFeeHeads(res.data || []);
    } catch (e) {
      console.error("Failed to fetch fee heads:", e);
    }
  };

  useEffect(() => {
    fetchFeeHeads();
  }, [location.key]);

  const deleteFeeHead = async (id, feeHeadName) => {
    if (!window.confirm("Are you sure you want to delete this Fee Head?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/feeheads/${id}`);
      setFeeHeads((prev) => prev.filter((f) => f._id !== id));
      toast.success(`Fee Head "${feeHeadName}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete Fee Head:", err);
    }
  };

const startIndex = (currentPage - 1) * perPage;
const paginatedfeeHeads = feeHeads.slice(startIndex, startIndex + perPage);
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
      <div className="flex-1 overflow-y-auto p-3">
        <Header/>
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">Fee Heads</h2>
              <div className="flex gap-4">
                <BackButton />
                <button
                  onClick={() => navigate("/FeeHeadsMaster")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
                >
                  Add Fee Head
                </button>
              </div>
            </div>
          </div>

          <table className="w-full table-auto border border-green-500">
            <thead className="bg-green-100 text-sm">
              <tr>
                <th className="border border-green-500  py-1">SL No</th>
                <th className="border border-green-500 px-2 py-1">FeeHead ID</th>
                <th className="border border-green-500 px-2 py-1">FeeHead Name</th>
                {/* <th className="border border-green-500 px-2 py-1">Description</th> */}
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-center">
              {feeHeads.length > 0 ? (
                paginatedfeeHeads.map((fh,index) => (
                  <tr key={fh._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 py-1">{startIndex+index+1}</td>
                    <td className="border border-green-500 px-2 py-1">{fh.feeHeadId}</td>
                    <td className="border border-green-500 px-2 py-1">{fh.feeHeadName}</td>
                    {/* <td className="border border-green-500 px-2 py-1">{fh.description}</td> */}
                    <td className="border border-green-500 px-2 py-1 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          onClick={() =>
                            navigate("/FeeHeadsMaster", { state: { feeHeadItem: fh } })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteFeeHead(fh._id, fh.feeHeadName)}
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
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No Fee Heads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
              total={feeHeads.length}
              perPage={perPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
        </div>
      </div>
    </div>
  );
};

export default FeeHeadsList;
