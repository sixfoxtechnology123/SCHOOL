import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaMoneyBill, FaCalendarAlt } from 'react-icons/fa';  // Added Academic Session icon

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-200">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Welcome to SCHOOL</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-wrap justify-center">
        {/* Class Master Button */}
        <div
          onClick={() => navigate("/classesList")}
          className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:bg-teal-100 transition"
        >
          <FaBook className="text-5xl text-teal-600 mb-4" />
          <h2 className="text-xl font-semibold text-black">Class Master</h2>
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
      </div>
    </div>
  );
};

export default HomePage;
