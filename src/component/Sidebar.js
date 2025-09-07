// components/Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaBook,
  FaMoneyBill,
  FaFileInvoice,
  FaChartBar,
  FaUserCog,
  FaBus,
  FaHistory,
  FaExclamationTriangle,
  FaListAlt,
  FaHome,
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
  const location = useLocation();
  const navigate = useNavigate();

  // Dashboard (top-level)
  const dashboardMenu = { name: "Dashboard", path: "/Layout", icon: FaHome };

  // Sections
  const sections = [
    {
      title: "Masters",
      menus: [
        { name: "Students", path: "/StudentList", icon: FaUserGraduate },
        { name: "Classes & Sections", path: "/ClassesList", icon: FaBook },
        { name: "Academic Session", path: "/AcademicSessionList", icon: FaBook },
        { name: "Fees Heads", path: "/FeeHeadsList", icon: FaMoneyBill },
        { name: "Fees Structure", path: "/FeeStructureList", icon: FaFileInvoice },
        { name: "Transport", path: "/TransportRoutesList", icon: FaBus },
        { name: "Users", path: "/UserList", icon: FaUserCog },
      ],
    },
    {
      title: "Transactions",
      menus: [
        { name: "Collect Fees", path: "/PaymentsList", icon: FaMoneyBill },
      ],
    },
    {
      title: "Reports",
      menus: [
        { name: "Daily Collection", path: "/DailyCollection", icon: FaChartBar },
        { name: "Daily Collection (User-wise)", path: "/DailyCollectionUser", icon: FaUserCog },
        { name: "Class-wise Summary", path: "/ClassSummary", icon: FaBook },
        { name: "Student Payment History", path: "/StudentHistory", icon: FaHistory },
        { name: "Outstanding Fees", path: "/OutstandingFees", icon: FaExclamationTriangle },
        { name: "Fee Head Summary", path: "/FeeHeadSummary", icon: FaListAlt },
        { name: "Transport Fees", path: "/TransportReport", icon: FaBus },
      ],
    },
  ];

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

  // Auto-open the parent section of the active route
  useEffect(() => {
    sections.forEach((section) => {
      section.menus.forEach((menu) => {
        if (location.pathname.startsWith(menu.path)) {
          setOpenSections((prev) => ({ ...prev, [section.title]: true }));
        }
      });
    });
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-green-700 text-white p-2">
        <h2 className="text-lg font-bold">Management</h2>
        <button onClick={() => setMobileOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-green-700 text-white transform transition-transform duration-300 ease-in-out z-50
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:static md:translate-x-0 md:flex md:flex-col
        ${isOpen ? "md:w-56" : "md:w-16"} 
        md:min-h-screen`}
      >
        <div className="flex flex-col h-full">
          {/* Header + Toggle */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-green-800">
            {isOpen && (
              <h3 className="text-2xl font-bold text-white">Man</h3>
            )}
            <button
              className="hidden md:block text-white ml-auto"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <ArrowBigLeftDash size={22} /> : <ArrowBigRightDash size={22} />}
            </button>
            <button
              className="md:hidden text-white ml-2"
              onClick={() => setMobileOpen(false)}
            >
              <X size={28} />
            </button>
          </div>

          {/* Dashboard Link */}
          <div className="px-2 mt-2">
            <NavLink
              to={dashboardMenu.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-green-800"
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <dashboardMenu.icon size={20} />
              {isOpen && <span>{dashboardMenu.name}</span>}
            </NavLink>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto px-2 space-y-2 mt-3">
            {sections.map((section, idx) => (
              <div key={idx}>
                {/* Section Header (Collapsible) */}
                {isOpen && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-2 py-2 text-base font-semibold uppercase text-white hover:bg-green-800 rounded"
                  >
                    {section.title}
                    {openSections[section.title] ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                )}

                {/* Collapsible Menus */}
                {openSections[section.title] && (
                  <ul className="space-y-1 pl-4 mt-1">
                    {section.menus.map((menu, i) => {
                      const Icon = menu.icon;
                      return (
                        <li key={i}>
                          <NavLink
                            to={menu.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 p-1 rounded transition-colors ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-green-800"
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
            ))}
          </div>

          {/* Logout */}
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

      {/* Mobile Backdrop */}
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
