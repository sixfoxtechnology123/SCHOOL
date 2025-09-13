// pages/StudentsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit, FaEye, FaPrint } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data || []);
    } catch (e) {
      console.error("Failed to fetch students:", e);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  const getName = (stu) => {
    if (!stu) return "";
    const first = stu.firstName || stu.first_name || "";
    const last = stu.lastName || stu.last_name || "";
    if (first || last) return `${first} ${last}`.trim();
    if (stu.name) return stu.name;
    if (stu.fullName) return stu.fullName;
    return "";
  };

  const getClass = (stu) => stu.admitClass || stu.className || stu.class || stu.classLabel || "";
  const getPhone = (stu) => stu.fatherPhone || stu.phoneNo || stu.contact || stu.father_phone || "";

  const formatDOB = (dob) => {
    if (!dob) return "";
    if (typeof dob === "string" && dob.includes("-")) {
      const datePart = dob.split("T")[0];
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      }
    }
    const dt = new Date(dob);
    if (!isNaN(dt)) {
      const d = String(dt.getDate()).padStart(2, "0");
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const y = String(dt.getFullYear());
      return `${d}/${m}/${y}`;
    }
    return "";
  };

  const searchTermLower = searchTerm.trim().toLowerCase();
  const filteredStudents = students.filter((s) => {
    if (!searchTermLower) return true;
    const id = (s.studentId || "").toString().toLowerCase();
    const name = getName(s).toLowerCase();
    return id.includes(searchTermLower) || name.includes(searchTermLower);
  });

const generatePDF = async (student) => {
  const doc = new jsPDF("p", "pt", "a4");
  const container = document.createElement("div");
  container.style.width = "800px";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "12px";
  container.style.color = "#000";
  container.style.position = "relative";
  container.style.background = "#fff";

  const getImageSrc = (photoObj) => {
    if (!photoObj || !photoObj.data || !photoObj.contentType) return "";
    let base64String = "";
    if (photoObj.data && photoObj.data.buffer) {
      const binary = new Uint8Array(photoObj.data.buffer);
      base64String = btoa(String.fromCharCode(...binary));
    } else if (photoObj.data && typeof photoObj.data === "string") {
      base64String = photoObj.data.replace(/^data:.*;base64,/, "");
    }
    return `data:${photoObj.contentType};base64,${base64String}`;
  };

  const imagesHTML = `
<div style="display:flex; justify-content:center; gap:40px; margin:5px 0; text-align:center;">
  ${student.fatherPhoto ? `
    <div>
      <img src="${getImageSrc(student.fatherPhoto)}" style="height:100px; border:1px solid #000;"/>
      <strong>Father Photo</strong>
    </div>` : ""}
  ${student.motherPhoto ? `
    <div>
      <img src="${getImageSrc(student.motherPhoto)}" style="height:100px; border:1px solid #000;"/>
      <strong>Mother Photo</strong>
    </div>` : ""}
  ${student.childPhoto ? `
    <div>
      <img src="${getImageSrc(student.childPhoto)}" style="height:100px; border:1px solid #000;"/>
      <strong>Child Photo</strong>
    </div>` : ""}
</div>
  `;

  const twoColRow = (label1, value1, label2, value2) => `
    <div style="display:flex; padding:2px 0;">
      <div style="flex:1; display:flex;">
        <div style="min-width:120px;"><strong>${label1}</strong></div>
        <div>: ${value1 || ""}</div>
      </div>
      ${label2 ? `
      <div style="flex:1; display:flex;">
        <div style="min-width:120px;"><strong>${label2}</strong></div>
        <div>: ${value2 || ""}</div>
      </div>` : ""}
    </div>
  `;

  const formatAddressBlock = (title, addr) => {
    if (!addr) return "";
    return `
      <div class="pdf-section-header"
        style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">
        ${title}
      </div>
      <div style="padding:0 10px 5px 10px; border:1px solid #000;">
        ${twoColRow("Vill", addr.vill, "PO", addr.po)}
        ${twoColRow("Block", addr.block, "PS", addr.ps)}
        ${twoColRow("Dist", addr.dist, "PIN", addr.pin)}
      </div>
    `;
  };

  container.innerHTML = `
<div style="border:1px solid #000; padding:0 15px 15px 15px; position:relative; z-index:1;">
  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin:0 0 12px 0;">
    <img src="/logo1.jpg" style="height:60px;" />
    <div style="text-align:center; flex:1; margin:0 20px;">
      <h2 style="margin:2px 0 0 0; font-size:18pt; color:#004080;">CENTRAL PUBLIC SCHOOL</h2>
      <p style="margin:2px 0; color:#004080;">Affiliated to CISCE Board, New Delhi (ICSE & ISC)</p>
      <h3 style="margin:2px 0 0 0; font-size:14pt; color:#1e40af;">APPLICATION FOR ADMISSION</h3>
    </div>
    <img src="/logo1.jpg" style="height:60px;" />
  </div>
  <hr style="border:1px solid #004080;"/>

  <!-- Photos -->
  <div class="pdf-section-header"
    style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">
    Photos
  </div>
  ${imagesHTML}

  <!-- Child Information -->
  <div class="pdf-section-header"
    style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">
    Child Information
  </div>
  <div style="padding:0 10px 5px 10px; border:1px solid #000;">
    ${twoColRow("Student ID", student.studentId, "Name", getName(student))}
    ${twoColRow("Class", getClass(student), "Section", student.section)}
    ${twoColRow("Roll No", student.rollNo, "Gender", student.gender)}
    ${twoColRow("Social Cast", student.socialCaste, "DOB", formatDOB(student.dob))}
    ${twoColRow("Height", student.height, "Weight", student.weight)}
    ${twoColRow("Blood Group", student.bloodGroup, "Nationality", student.nationality)}
    ${twoColRow("Languages", (student.languages || []).join(", "), "Transport Required", student.transportRequired)}
    ${twoColRow("Distance from School(KM)", student.distanceFromSchool, "Emergency Person", student.emergencyPerson)}
    ${twoColRow("Emergency Contact", student.emergencyContact, "", "")}
  </div>

  <!-- Permanent Address -->
  ${formatAddressBlock("Permanent Address", student.permanentAddress)}

  <!-- Current Address -->
  ${formatAddressBlock("Current Address", student.currentAddress)}

  <!-- Family Information -->
  <div class="pdf-section-header"
    style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">
    Family Information
  </div>
  <div style="padding:0 10px 5px 10px; border:1px solid #000;">
    ${twoColRow("Father", student.fatherName, "Occupation", student.fatherOccupation)}
    ${twoColRow("Father Phone", student.fatherPhone, "Father Email", student.fatherEmail)}
    ${twoColRow("Father Nationality", student.fatherNationality, "Father Qualification", student.fatherQualification)}

    ${twoColRow("Mother", student.motherName, "Occupation", student.motherOccupation)}
    ${twoColRow("Mother Phone", student.motherPhone, "Mother Email", student.motherEmail)}
    ${twoColRow("Mother Nationality", student.motherNationality, "Mother Qualification", student.motherQualification)}

    ${twoColRow("BPL", student.bpl, "BPL No", student.bplNo)}
    ${twoColRow("Family Income", student.familyIncome, "", "")}
  </div>
</div>
  `;

  document.body.appendChild(container);
  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  doc.save(`${student.studentId || "student"}.pdf`);
  document.body.removeChild(container);
};



  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-green-800">Students</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:flex-row md:items-center md:gap-2 w-full md:w-auto">
                <BackButton />
                <input
                  type="text"
                  placeholder="Search by Student ID or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  className="flex-1 min-w-[300px] border border-green-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={() => navigate("/StudentMaster")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
                >
                  New Register
                </button>
              </div>
            </div>
          </div>
          <table className="w-full table-auto border border-green-500 text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="border border-green-500 px-2 py-1">Student ID</th>
                <th className="border border-green-500 px-2 py-1">Name</th>
                <th className="border border-green-500 px-2 py-1">Class</th>
                <th className="border border-green-500 px-2 py-1">Section</th>
                <th className="border border-green-500 px-2 py-1">Roll No</th>
                <th className="border border-green-500 px-2 py-1">DOB</th>
                <th className="border border-green-500 px-2 py-1">Father</th>
                <th className="border border-green-500 px-2 py-1">Mother</th>
                <th className="border border-green-500 px-2 py-1">Phone No</th>
                <th className="border border-green-500 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-gray-100 transition">
                    <td className="border border-green-500 px-2 py-1">{stu.studentId}</td>
                    <td className="border border-green-500 px-2 py-1">{getName(stu)}</td>
                    <td className="border border-green-500 px-2 py-1">{getClass(stu)}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.section || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.rollNo || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{formatDOB(stu.dob)}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.fatherName || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{stu.motherName || ""}</td>
                    <td className="border border-green-500 px-2 py-1">{getPhone(stu)}</td>
                    <td className="border border-green-500 px-2 py-1">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() =>
                            navigate("/StudentMaster", { state: { studentItem: stu } })
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteStudent(stu._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onClick={() => generatePDF(stu)}
                          className="text-green-600 hover:text-green-800"
                          title="Print / View PDF"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => generatePDF(stu)}
                          className="text-purple-600 hover:text-purple-800"
                          title="View PDF"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
