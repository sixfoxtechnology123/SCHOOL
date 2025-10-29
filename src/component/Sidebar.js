import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaBook,
  FaMoneyBill,
  FaFileInvoice,
  FaChartBar,
  FaBus,
  FaHistory,
  FaExclamationTriangle,
  FaListAlt,
  FaHome,
  FaUserShield,
} from "react-icons/fa";
import {
  Menu,
  X,
  ArrowBigRightDash,
  ArrowBigLeftDash,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const normalize = (s) =>
    (typeof s === "string" ? s : "")
      .toString()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/gi, "")
      .toLowerCase();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("adminData") || "null") || {};
    let perms = [];

    if (Array.isArray(admin.permissions)) {
      perms = admin.permissions.map((p) => {
        if (!p) return "";
        if (typeof p === "string") return normalize(p);
        const keys = [p.permission, p.name, p.menu, p.code, p.key, p.action]
          .filter(Boolean)
          .map(normalize);
        return keys.length ? keys[0] : normalize(JSON.stringify(p));
      });
    } else if (
      admin.permissions &&
      typeof admin.permissions === "object" &&
      !Array.isArray(admin.permissions)
    ) {
      perms = Object.keys(admin.permissions)
        .filter((k) => admin.permissions[k])
        .map(normalize);
    }

    const uniq = Array.from(new Set(perms.filter(Boolean)));
    setPermissions(uniq);
    setRole(admin.role || "");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    sections.forEach((section) => {
      section.menus.forEach((menu) => {
        if (location.pathname.startsWith(menu.path)) {
          setOpenSections((prev) => ({ ...prev, [section.title]: true }));
        }
      });
    });
  }, [location.pathname]);

  const canAccess = (permission) => {
    if (role && role.toLowerCase() === "admin") return true;
    if (!permission) return true;
    const norm = normalize(permission);
    return permissions.includes(norm);
  };

  // ✅ fixed: use Dashboard permission and path
  const dashboardMenu = {
    name: "Dashboard",
    path: "/Dashboard",
    icon: FaHome,
    permission: "Dashboard",
  };

  const sections = [
    {
      title: "Masters",
      menus: [
        {
          name: "New Registration",
          path: "/StudentList",
          icon: FaUserGraduate,
          permission: "New_Registration",
        },
        {
          name: "Classes & Sections",
          path: "/ClassesList",
          icon: FaBook,
          permission: "Classes_Sections",
        },
        {
          name: "Academic Session",
          path: "/AcademicSessionList",
          icon: FaBook,
          permission: "Academic_Session",
        },
        {
          name: "Fees Heads",
          path: "/FeeHeadsList",
          icon: FaMoneyBill,
          permission: "Fees_Heads",
        },
        {
          name: "Transport",
          path: "/TransportRoutesList",
          icon: FaBus,
          permission: "Transport",
        },
        {
          name: "Fees Structure",
          path: "/FeeStructureList",
          icon: FaFileInvoice,
          permission: "Fees_Structure",
        },
      ],
    },
    {
      title: "Transactions",
      menus: [
        {
          name: "Collect Fees",
          path: "/PaymentsList",
          icon: FaMoneyBill,
          permission: "Collect_Fees",
        },
      ],
    },
    {
      title: "Reports",
      menus: [
        {
          name: "Daily Collection",
          path: "/DailyCollection",
          icon: FaChartBar,
          permission: "Daily_Collection_Report",
        },
        {
          name: "Class-wise Summary",
          path: "/ClassSummary",
          icon: FaBook,
          permission: "Class_Wise_Summary_Report",
        },
        {
          name: "Student Payment History",
          path: "/StudentPaymentHistory",
          icon: FaHistory,
          permission: "Student_Payment_History_Report",
        },
        {
          name: "Outstanding Fees",
          path: "/OutstandingFees",
          icon: FaExclamationTriangle,
          permission: "Outstanding_Fees_Report",
        },
        {
          name: "Fee Head Summary",
          path: "/FeeHeadsReport",
          icon: FaListAlt,
          permission: "FeeHead_Summary_Report",
        },
        {
          name: "Transport Fees",
          path: "/TransportReport",
          icon: FaBus,
          permission: "Transport_Fees_Report",
        },
      ],
    },
    {
      title: "Admin panel",
      menus: [
        {
          name: "Roles & Permissions",
          path: "/AdminManagement",
          icon: FaUserShield,
          permission: "Admin_Panel",
        },
      ],
    },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-gray-800 text-white p-2">
        <h2 className="text-base font-semibold">School Fees</h2>
        <button onClick={() => setMobileOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-50
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:static md:translate-x-0 md:flex md:flex-col
        ${isOpen ? "md:w-48" : "md:w-16"} 
        md:min-h-screen`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
            {isOpen && (
              <h3 className="text-base font-semibold text-white">
                Management
              </h3>
            )}
            <button
              className="hidden md:block text-white ml-auto"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ArrowBigLeftDash size={22} />
              ) : (
                <ArrowBigRightDash size={22} />
              )}
            </button>
            <button
              className="md:hidden text-white ml-2"
              onClick={() => setMobileOpen(false)}
            >
              <X size={28} />
            </button>
          </div>

          {/* ✅ Dashboard permission check */}
          <div className="px-2 mt-2">
            {canAccess(dashboardMenu.permission) && (
              <NavLink
                to={dashboardMenu.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-white"
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                <dashboardMenu.icon size={20} />
                {isOpen && <span>{dashboardMenu.name}</span>}
              </NavLink>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-2 mt-3">
            {sections.map((section, idx) => {
              const visibleMenus = section.menus.filter((menu) =>
                canAccess(menu.permission)
              );
              if (visibleMenus.length === 0) return null;

              return (
                <div key={idx}>
                  {isOpen && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex items-center justify-between w-full px-2 py-2 text-base font-semibold uppercase text-white hover:bg-gray-700 rounded"
                    >
                      {section.title}
                      {openSections[section.title] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                  )}

                  {openSections[section.title] && (
                    <ul className="space-y-1 pl-4 mt-1">
                      {visibleMenus.map((menu, i) => {
                        const Icon = menu.icon;
                        return (
                          <li key={i}>
                            <NavLink
                              to={menu.path}
                              className={({ isActive }) =>
                                `flex items-center gap-3 p-1 rounded transition-colors ${
                                  isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-700 text-white"
                                }`
                              }
                              onClick={() => setMobileOpen(false)}
                            >
                              <Icon size={20} />
                              {isOpen && <span>{menu.name}</span>}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-2 mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full bg-red-600 text-white p-2 rounded transition"
            >
              <LogOut size={20} />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
