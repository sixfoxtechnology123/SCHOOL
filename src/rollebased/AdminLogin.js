import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminLogin = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/adminManagement/login",
        {
          userId: userId.trim(),
          password: password.trim(),
        }
      );

      if (res.data.token) {
        const user = res.data.admin || res.data.user;
        if (!user) {
          setError("Login failed. Invalid response from server.");
          return;
        }

        const adminData = {
          ...user,
          permissions: user.permissions || [],
          role: user.role || "user", // mainAdmin or user
        };

        // Store in localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("adminData", JSON.stringify(adminData));
        localStorage.setItem("userPermissions", JSON.stringify(adminData.permissions));

        // DEBUG LOGS
        console.log("Logged in Admin Data:", adminData);
        console.log("Permissions:", adminData.permissions);

        // Navigate to Dashboard
        navigate("/Dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <div className="relative z-10 bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Admin Login</h1>
        {error && <p className="text-red-400 text-center mb-3 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-white block mb-1">User ID</label>
            <input
              type="text"
              placeholder="Enter admin userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="relative">
      <label className="text-white block mb-1">Password</label>
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/25 text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
        required
      />

    
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-10 text-white"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transform transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
