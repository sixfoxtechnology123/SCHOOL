// components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 shadow p-3 flex justify-between items-center mb-2 rounded-lg">
      <h1 className="text-xl font-bold text-blue-700">
        cccCENTRAL PUBLIC SCHOOL FEES MANAGEMENT
      </h1>
      
      <div className="flex gap-2">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-600 transition"
        >
          Home
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-blue-700 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-800 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
