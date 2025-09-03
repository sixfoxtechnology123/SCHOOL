// components/Header.js
import React from "react";

const Header = ({ onLogout }) => {
  return (
    <div className="bg-gray-100 shadow p-3 flex justify-between items-center mb-2 rounded-lg">
      <h1 className="text-xl font-bold  text-green-700">
        CENTRAL PUBLIC SCHOOL FEES MANAGEMENT
      </h1>
      <button
        onClick={onLogout}
        className="bg-green-700 text-white px-4 py-1 rounded-lg shadow hover:bg-green-800 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
