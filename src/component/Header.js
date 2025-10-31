  import React, { useState, useRef, useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import defaultAvatar from "../assets/avatar.jpg";

  const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("adminData")) || {});
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // Sync admin data on profile update or storage change
  useEffect(() => {
  const updateAdminData = () => {
  const data = localStorage.getItem("adminData");
  if (data) setAdmin(JSON.parse(data));
  };
  updateAdminData();
  window.addEventListener("profileUpdated", updateAdminData);
  window.addEventListener("storage", updateAdminData);

  return () => {
    window.removeEventListener("profileUpdated", updateAdminData);
    window.removeEventListener("storage", updateAdminData);
  };

  }, []);

  // Close dropdown on outside click
  useEffect(() => {
  const handleClickOutside = (e) => {
  if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
  setDropdownOpen(false);
  }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("adminData");
  localStorage.removeItem("token");
  localStorage.removeItem("userPermissions");
  navigate("/");
  };

  // ==== added: check if admin role ====
  const roleStr = String(admin?.role || "").toLowerCase();
  const isAdminRole = ["admin", "mainadmin", "superadmin", "root"].includes(roleStr);

  return ( <div className="bg-gray-100 shadow p-3 flex justify-between items-center mb-2 rounded-lg"> 
  <h1 className="text-xl font-bold text-blue-700">
      CENTRAL PUBLIC SCHOOL FEES MANAGEMENT 
  </h1> 
  <div className="relative flex items-center gap-3" ref={dropdownRef}> 
    <span className="font-medium text-gray-700">{admin?.name ?? "Admin"}</span>
      <img
        onClick={() => setDropdownOpen(!dropdownOpen)}
        src={
          admin?.profileImage
            ? `http://localhost:5000/${admin.profileImage}?t=${Date.now()}`
            : defaultAvatar
        }
        alt="profile"
        className="w-10 h-10 rounded-full object-cover cursor-pointer"
      />

      {dropdownOpen && (
        <div className="absolute right-0 mt-12 w-48 bg-white border rounded font-semibold shadow-lg z-50">
          <ul className="flex flex-col">
            {/* <li>
              <Link
                to="/EditProfile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Edit Profile
              </Link>
            </li> */}
            {isAdminRole && ( // show only if admin role
              <li>
                <Link
                  to="/ChangePassword"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Change Password
                </Link>
              </li>
            )}
            <li>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  </div>

  );
  };

  export default Header;
