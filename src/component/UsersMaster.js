// pages/UsersMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UsersMaster = () => {
  const [userData, setUserData] = useState({
    userId: "",
    username: "",
    role: "",
    password: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [incomingUser, setIncomingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Auto-generate next User ID
  const fetchNextUserId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/latest");
      const nextId = res.data?.userId || "USER01";
      setUserData((prev) => ({ ...prev, userId: nextId }));
    } catch (err) {
      console.error("Error getting user ID:", err);
    }
  };

  useEffect(() => {
    if (location.state?.userItem) {
      const u = location.state.userItem;
      setIncomingUser(u);
      setIsEditMode(true);
      setUserData({
        _id: u._id,
        userId: u.userId || "",
        username: u.username || "",
        role: u.role || "",
        password: "", // don’t show hash
      });
    } else {
      fetchNextUserId();
      setIsEditMode(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/users/${userData._id}`,
          userData
        );
        alert("User updated successfully!");
        navigate("/UserList", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/users", userData);
        alert("User saved successfully!");
        const res = await axios.get("http://localhost:5000/api/users/latest");
        setUserData({
          userId: res.data?.userId || "USER01",
          username: "",
          role: "",
          password: "",
        });
        navigate("/UserList", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving user");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update User" : "User Master"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* User ID */}
          <div>
            <label className="block font-medium">User ID</label>
            <input
              type="text"
              name="userId"
              value={userData.userId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-medium">Role</label>
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1 rounded pr-10"
                placeholder={isEditMode ? "Enter new password (optional)" : ""}
                required={!isEditMode}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <BackButton />
            <button
              type="submit"
              className={`px-4 py-1 rounded text-white ${
                isEditMode
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersMaster;
