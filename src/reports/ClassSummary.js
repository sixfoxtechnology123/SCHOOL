import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import { FaThLarge } from "react-icons/fa";

const ClassSummary = () => {
  const [data, setData] = useState([]);
  const [filterClass, setFilterClass] = useState(""); // class filter
  const [filterSection, setFilterSection] = useState(""); // section filter
  const navigate = useNavigate();

  const allSections = ["A", "B", "C"];
  const predefinedClasses = [
    "Class - I", "Class - II", "Class - III", "Class - IV",
    "Class - V", "Class - VI", "Class - VII", "Class - VIII",
    "Class - IX", "Class - X", "Class - XI", "Class - XII"
  ];

  const romanToNumber = (roman) => {
    const map = {
      I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6,
      VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12
    };
    return map[roman] || 0;
  };

  const sortClasses = (classArray) => {
    return classArray.sort((a, b) => {
      const classA = String(a || "").trim();
      const classB = String(b || "").trim();
      const romanA = classA.split("-")[1]?.trim();
      const romanB = classB.split("-")[1]?.trim();
      return romanToNumber(romanA) - romanToNumber(romanB);
    });
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/class-summary")
      .then((res) => {
        const normalized = res.data.map((row) => ({
          className: row.className?.trim() || "",
          section: row.section?.trim().toUpperCase() || "",
          students: row.students || 0,
          totalAmount: row.totalAmount || 0,
          pendingAmount: row.pendingAmount || 0,
        }));
        setData(normalized);
      })
      .catch((err) => {
        console.log(err);
        setData([]);
      });
  }, []);

  const classes = sortClasses(predefinedClasses);
  const sections = allSections;

  const tableData = [];
  classes.forEach((cls) => {
    sections.forEach((sec) => {
      const row = data.find(
        (r) =>
          r.className?.trim() === cls.trim() &&
          r.section?.trim().toUpperCase() === sec.trim().toUpperCase()
      );
      tableData.push(
        row || {
          className: cls,
          section: sec,
          students: 0,
          totalAmount: 0,
          pendingAmount: 0,
        }
      );
    });
  });

  const filteredData = tableData.filter((row) => {
    const matchClass = filterClass ? row.className?.trim() === filterClass.trim() : true;
    const matchSection = filterSection ? row.section?.trim().toUpperCase() === filterSection.trim().toUpperCase() : true;
    return matchClass && matchSection;
  });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />

        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-800">
                Class/Section-wise Summary
              </h2>
              <div className="flex gap-2">
                <BackButton />
                <button
                  onClick={() => navigate("/ReportsDashboard")}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  title="Reports Dashboard"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Class:</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Section:</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {(filterClass || filterSection) && (
              <button
                onClick={() => { setFilterClass(""); setFilterSection(""); }}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear Class/Section
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-500">
              <thead className="bg-green-100 text-sm">
                <tr>
                  <th className="border border-green-500 px-2 py-1">Class</th>
                  <th className="border border-green-500 px-2 py-1">Section</th>
                  <th className="border border-green-500 px-2 py-1">Students Paid</th>
                  <th className="border border-green-500 px-2 py-1">Amount Collected</th>
                  <th className="border border-green-500 px-2 py-1">Pending Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-center">
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-green-500 px-2 py-1">{row.className || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{row.section || "-"}</td>
                      <td className="border border-green-500 px-2 py-1">{row.students}</td>
                      <td className="border border-green-500 px-2 py-1">₹{row.totalAmount}</td>
                      <td className="border border-green-500 px-2 py-1">₹{row.pendingAmount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500 border border-green-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClassSummary;
