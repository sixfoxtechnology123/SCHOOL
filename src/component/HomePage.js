import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBook, 
  FaMoneyBill, 
  FaCalendarAlt, 
  FaFileInvoiceDollar,
  FaBus,
  FaUser ,
  FaUserGraduate,
} from 'react-icons/fa';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-200">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Welcome to SCHOOL</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 flex-wrap justify-center">
        {/* Student Master Button */}
        <div
          onClick={() => navigate("/StudentList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaUserGraduate className="text-5xl text-pink-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Students</h2>
        </div>

        {/* Class Master Button */}
        <div
          onClick={() => navigate("/classesList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaBook className="text-5xl text-teal-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Class</h2>
        </div>

        {/* Fee Heads Button */}
        <div
          onClick={() => navigate("/FeeHeadsList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaMoneyBill className="text-5xl text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Fee Heads</h2>
        </div>

        {/* Academic Session Button */}
        <div
          onClick={() => navigate("/AcademicSessionList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaCalendarAlt className="text-5xl text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Academic Session</h2>
        </div>

        {/* Fee Structure Button */}
        <div
          onClick={() => navigate("/FeeStructureList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaFileInvoiceDollar className="text-5xl text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Fee Structure</h2>
        </div>

        {/* Transport Routes Button */}
        <div
          onClick={() => navigate("/TransportRoutesList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaBus className="text-5xl text-orange-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Transport</h2>
        </div>

        {/* User Master Button */}
        <div
          onClick={() => navigate("/UserList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaUser className="text-5xl text-pink-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">User Master</h2>
        </div>

          {/* Receipts Button */}
        <div
          onClick={() => navigate("/ReceiptsList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaFileInvoiceDollar className="text-5xl text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Receipts</h2>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
