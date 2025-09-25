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
  const [sessions, setSessions] = useState([]);
  const [filterSession, setFilterSession] = useState("");

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
  const fetchSessions = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/sessions"); // your sessions API
    if (Array.isArray(res.data)) {
      const sorted = res.data
        .map(s => ({ id: s._id, name: s.name || s.year })) // adjust according to your DB
        .sort((a, b) => a.name.localeCompare(b.name));
      setSessions(sorted);
    }
  } catch (err) {
    console.error("Failed to fetch sessions:", err);
  }
};

  // Initial fetch
  useEffect(() => {
    fetchStudents();
    fetchSessions();
  }, []);

  // Refresh if navigated back from StudentMaster with state.refresh
  useEffect(() => {
    if (location.state?.refresh) {
      fetchStudents();
      // Reset the state so it doesn't refresh again accidentally
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

// --- Save activity to localStorage and dispatch event ---
const saveActivity = (message) => {
  const newActivity = {
    id: Date.now(),
    text: message,
    timestamp: new Date(),
  };
  const stored = JSON.parse(localStorage.getItem("activities") || "[]");
  const updated = [newActivity, ...stored];
  localStorage.setItem("activities", JSON.stringify(updated));

  window.dispatchEvent(
    new CustomEvent("newActivity", { detail: { action: message } })
  );
};
// --------------------------------------------------------

const deleteStudent = async (id, name) => {
  if (!window.confirm("Are you sure you want to delete this student?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/students/${id}`);
    setStudents((prev) => prev.filter((s) => s._id !== id));

    const message = `Deleted Student ${name}`;
    saveActivity(message);
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
  const id = (s.studentId || "").toString().toLowerCase();
  const firstName = getName(s).split(" ")[0].toLowerCase(); // only first name
  const sessionMatch = filterSession ? s.academicSession === filterSession : true;
  const searchMatch =
    !searchTermLower ||
    id.includes(searchTermLower) ||      // match Student ID
    firstName.startsWith(searchTermLower); // match first name only
  return sessionMatch && searchMatch;
});




// --- PDF Function ---
const generatePDF = async (student) => {
  if (!student) return;

  const doc = new jsPDF("p", "pt", "a4");

  const res = await axios.get(`http://localhost:5000/api/students/${student._id}/full`);
  const { childInfo, idCardInfo, udiseInfo } = res.data;

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

  const twoColRow = (label1, value1, label2, value2) => `
    <div style="display:flex; padding:2px 0;">
      <div style="flex:1; display:flex;">
        <div style="min-width:160px;"><strong>${label1}</strong></div>
        <div>: ${value1 || ""}</div>
      </div>
      ${label2 ? `<div style="flex:1; display:flex;">
        <div style="min-width:150px;"><strong>${label2}</strong></div>
        <div>: ${value2 || ""}</div>
      </div>` : ""}
    </div>
  `;

  const formatAddressBlock = (title, addr) => {
    if (!addr) return "";
    return `
      <div style="font-weight:bold; color:#0ea5e9; text-align:left; margin:0 0 6px 0; font-size:9pt; padding:4px;">
        ${title}
      </div>
      <div style="padding:0 10px 5px 10px; border:0.5px solid #555;">
        ${twoColRow("Vill", addr.vill, "PO", addr.po)}
        ${twoColRow("Block", addr.block, "PS", addr.ps)}
        ${twoColRow("Dist", addr.dist, "PIN", addr.pin)}
      </div>
    `;
  };

  const getName = (s) => `${s.firstName || ""} ${s.lastName || ""}`;
  const getClass = (s) => s.admitClass || "";
  const formatDOB = (dob) => (dob ? new Date(dob).toLocaleDateString() : "");

  const imagesHTML = `
    <div style="display:flex; justify-content:center; gap:40px; margin:5px 0; text-align:center;">
      ${student.fatherPhoto ? `<div>
        <img src="${getImageSrc(student.fatherPhoto)}" style="height:100px; border:0.5px solid #555;"/>
        <strong>Father Photo</strong>
      </div>` : ""}
      ${student.motherPhoto ? `<div>
        <img src="${getImageSrc(student.motherPhoto)}" style="height:100px; border:0.5px solid #555;"/>
        <strong>Mother Photo</strong>
      </div>` : ""}
      ${student.childPhoto ? `<div>
        <img src="${getImageSrc(student.childPhoto)}" style="height:100px; border:0.5px solid #555;"/>
        <strong>Child Photo</strong>
      </div>` : ""}
    </div>
  `;

  // --- Admission Page (Page 1) ---
  const admissionContainer = document.createElement("div");
  admissionContainer.style.width = "800px";
  admissionContainer.style.padding = "20px";
  admissionContainer.style.fontFamily = "Arial, sans-serif";
  admissionContainer.style.fontSize = "12px";
  admissionContainer.style.color = "#000";
  admissionContainer.style.background = "#fff";

  admissionContainer.innerHTML = `
    <div style="border:0.5px solid #555; padding:0 15px 15px 15px; position:relative; z-index:1;">
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
        A. Child Information
      </div>
      <div style="padding:0 10px 5px 10px; border:0.5px solid #555;">
        ${twoColRow("Student ID", student.studentId, "Academic Session", student.academicSession)}
        ${twoColRow("Name", getName(student), "Class", getClass(student))}
        ${twoColRow("Section", student.section, "Roll No", student.rollNo)}
        ${twoColRow("Gender", student.gender, "Social Cast", student.socialCaste)}
        ${twoColRow("DOB", formatDOB(student.dob), "Height", student.height)}
        ${twoColRow("Weight", student.weight, "Blood Group", student.bloodGroup)}
        ${twoColRow("Nationality", student.nationality, "Languages Known", (student.languages || []).join(", "))}
        ${twoColRow("Transport Required", student.transportRequired, "Distance from School(KM)", student.distanceFromSchool)}
        ${twoColRow("Emergency Person", student.emergencyPerson, "Emergency Contact", student.emergencyContact)}
      </div>

      <!-- Permanent Address -->
      ${formatAddressBlock("Permanent Address", student.permanentAddress)}

      <!-- Current Address -->
      ${formatAddressBlock("Current Address", student.currentAddress)}

      <!-- Family Information -->
      <div class="pdf-section-header"
        style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">
        B. Family Information
      </div>
      <div style="padding:0 10px 5px 10px; border:0.5px solid #555;">
        ${twoColRow("Father", student.fatherName, "Occupation", student.fatherOccupation)}
        ${twoColRow("Father's Phone", student.fatherPhone, "Father's Email", student.fatherEmail)}
        ${twoColRow("Father's Nationality", student.fatherNationality, "Father's Qualification", student.fatherQualification)}
        ${twoColRow("Mother", student.motherName, "Occupation", student.motherOccupation)}
        ${twoColRow("Mother's Phone", student.motherPhone, "Mother's Email", student.motherEmail)}
        ${twoColRow("Mother's Nationality", student.motherNationality, "Mother's Qualification", student.motherQualification)}
        ${twoColRow("No Of Brothers", student.brothers, "No Of Sisters", student.sisters)}
        ${twoColRow("BPL", student.bpl, "BPL No", student.bplNo)}
        ${twoColRow("Family Income", student.familyIncome, "", "")}
      </div>
    </div>
  `;

  document.body.appendChild(admissionContainer);
  let canvas = await html2canvas(admissionContainer, { scale: 2 });
  let imgData = canvas.toDataURL("image/png");
  let imgProps = doc.getImageProperties(imgData);
  let pdfWidth = doc.internal.pageSize.getWidth();
  let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  document.body.removeChild(admissionContainer);

  // --- ID Card + UDISE (Second Page) ---
  const secondPageSections = [];

  if (idCardInfo && Object.keys(idCardInfo).length > 0) {
    const idCardHtml = `
      <div style="border:0.5px solid #555; padding:10px; margin-bottom:20px;">
        <h2 style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">ID Card</h2>
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <div style="flex:1; padding-right:10px;">
            <div style="border:0.5px solid #555; padding:10px;">
              ${twoColRow("Student ID", idCardInfo.studentId, "Name", idCardInfo.studentName)}
              ${twoColRow("Class", idCardInfo.className, "DOB", formatDOB(idCardInfo.dob))}
              ${twoColRow("Father", idCardInfo.fatherName, "Mother", idCardInfo.motherName)}
              ${twoColRow("Contact No", idCardInfo.contactNo || idCardInfo.motherPhone || "", "Whatsapp No", idCardInfo.whatsappNo || "")}
            </div>
            ${formatAddressBlock("Address", idCardInfo.permanentAddress)}
          </div>
          <div style="width:120px;">
            <img src="${getImageSrc(idCardInfo.photo)}" style="width:100%; border:0.5px solid #555;" />
          </div>
        </div>
      </div>
    `;
    secondPageSections.push(idCardHtml);
  }

  if (udiseInfo && Object.keys(udiseInfo).length > 0) {
    const udiseHtml = `
      <div style="border:0.5px solid #555; padding:10px;">
        <h2 style="font-weight:bold; color:#1e40af; text-align:center; margin:0 0 6px 0; font-size:13pt; padding:4px;">UDISE Form</h2>
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <div style="flex:1; padding-right:10px;">
            <div style="border:0.5px solid #555; padding:10px;">
              ${twoColRow("Student ID", udiseInfo.studentId || "", "Name", udiseInfo.studentName || "")}
              ${twoColRow("Gender", udiseInfo.gender || "", "Height", udiseInfo.height || "")}
              ${twoColRow("Weight", udiseInfo.weight || "", "DOB", formatDOB(udiseInfo.dob))}
              ${twoColRow("Admit Class", udiseInfo.admitClass || "", "Mother Tongue", udiseInfo.motherTongue || "")}
              ${twoColRow("Father", udiseInfo.fatherName || "", "Mother", udiseInfo.motherName || "")}
              ${twoColRow("Guardian Name", udiseInfo.guardianName || "", "Guardian Qualification", udiseInfo.guardianQualification || "")}
              ${twoColRow("Religion", udiseInfo.religion || "", "Nationality", udiseInfo.nationality || "")}
              ${twoColRow("BPL", udiseInfo.bpl || "", "BPL No", udiseInfo.bplNo || "")}
              ${twoColRow("EWS", udiseInfo.ews || "", "Annual Income", udiseInfo.familyIncome || "")}
              ${twoColRow("Contact No", udiseInfo.contactNo || "", "CWSN", udiseInfo.cwsn || "")}
              ${twoColRow("Social Caste", udiseInfo.socialCaste || "", "Panchayat", udiseInfo.panchayat || "")}
            </div>
            ${formatAddressBlock("Address", udiseInfo.currentAddress || {})}
          </div>
          <div style="width:120px;">
            <img src="${getImageSrc(udiseInfo.photo)}" style="width:100%; border:0.5px solid #555;" />
          </div>
        </div>
      </div>
    `;
    secondPageSections.push(udiseHtml);
  }

  if (secondPageSections.length > 0) {
    const combinedContainer = document.createElement("div");
    combinedContainer.style.width = "800px";
    combinedContainer.style.padding = "20px";
    combinedContainer.style.fontFamily = "Arial, sans-serif";
    combinedContainer.style.fontSize = "12px";
    combinedContainer.style.color = "#000";
    combinedContainer.style.background = "#fff";
    combinedContainer.innerHTML = secondPageSections.join("");

    document.body.appendChild(combinedContainer);

    const canvas = await html2canvas(combinedContainer, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    doc.addPage();
    doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    document.body.removeChild(combinedContainer);
  }

  doc.save(`${student.studentId || "student"}.pdf`);
};



// -----------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------


// --- Generate PDF for all filtered students ---
const generateStudentsListPDF = async () => {
  if (!filteredStudents.length) {
    alert("No students to print.");
    return;
  }

  const doc = new jsPDF("p", "pt", "a4");

  // --- Header ---
  const headerHTML = `
    <div style="text-align:center; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <img src="/logo1.jpg" style="height:60px;" />
        <div style="flex:1; text-align:center;">
          <h2 style="margin:2px 0; font-size:16pt; color:#004080;">CENTRAL PUBLIC SCHOOL</h2>
          <p style="margin:2px 0; color:#004080;">Affiliated to CISCE Board, New Delhi (ICSE & ISC)</p>
          <h3 style="margin:2px 0; font-size:12pt; color:#1e40af;">STUDENTS LIST</h3>
        </div>
        <img src="/logo1.jpg" style="height:60px;" />
      </div>
      <hr style="border:1px solid #004080; margin-top:5px;"/>
    </div>
  `;

// --- Table with all students ---
const tableHeader = `
  <thead>
    <tr style="font-weight:bold; text-align:center;">
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Sl.No.</th>
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Session</th>
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Student ID</th>
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Name</th>
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Class</th>
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Section</th>
      <th style="border:0.5px solid #555; padding:4px; vertical-align:middle;">Roll No</th>
    </tr>
  </thead>
`;

const tableRows = filteredStudents
  .map(
    (stu, i) => `
    <tr style="height:30px;">
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${i + 1}</td>
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${stu.academicSession || ""}</td>
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${stu.studentId || ""}</td>
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${getName(stu)}</td>
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${getClass(stu)}</td>
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${stu.section || ""}</td>
      <td style="border:0.5px solid #555; padding:3px; text-align:center; vertical-align:middle;">${stu.rollNo || ""}</td>
    </tr>
  `
  )
  .join("");


  const container = document.createElement("div");
  container.style.width = "800px";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "11px";
  container.style.color = "#000";
  container.style.background = "#fff";

  container.innerHTML = `
    ${headerHTML}
    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
      ${tableHeader}
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  document.body.appendChild(container);
  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  document.body.removeChild(container);

  doc.save("students_list.pdf");
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
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between w-full">
                    {/* Top Row: Back + Filter (mobile: left & right) */}
                    <div className="flex justify-between items-center gap-2 md:justify-start">
                      <BackButton />
                      <select
                        value={filterSession}
                        onChange={(e) => setFilterSession(e.target.value)}
                        className="border border-green-500 rounded px-2 py-0 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="">All Sessions</option>
                        {sessions.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Middle Row: Search (always centered, full width on mobile) */}
                    <div className="w-full md:flex-1 md:px-4">
                      <input
                        type="text"
                        placeholder="Search by Student ID or Name or Alphabet"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        className="w-full max-w-md border border-green-500 rounded px-2 py-0 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>

                    {/* Bottom Row: Print + New Register (mobile: left & right) */}
                    <div className="flex justify-between items-center gap-2 md:justify-end">
                      <button
                        onClick={generateStudentsListPDF}
                        className="bg-green-600 text-white px-4 py-0 rounded hover:bg-green-700"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => navigate("/StudentMaster")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-0 rounded font-semibold whitespace-nowrap"
                      >
                        New Register
                      </button>
                    </div>
                  </div>

            </div>
          </div>
          <table className="w-full table-auto border border-green-500 text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="border border-green-500 px-2 py-1">Student ID</th>
                <th className="border border-green-500 px-2 py-1">Session</th>
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
                    <td className="border border-green-500 px-2 py-1">{stu.academicSession}</td>
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
                          onClick={() => deleteStudent(stu._id, getName(stu))}
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
                        {/* <button
                          onClick={() => generatePDF(stu)}
                          className="text-purple-600 hover:text-purple-800"
                          title="View PDF"
                        >
                          <FaEye />
                        </button> */}
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