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
  container.style.fontSize = "12px";
  container.style.fontFamily = "Arial, sans-serif";

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `
    <b>Vill</b> - ${addr.vill || ""} 
    <b>PO</b> - ${addr.po || ""} 
    <b>Block</b> - ${addr.block || ""} 
    <b>PS</b> - ${addr.ps || ""} 
    <b>Dist</b> - ${addr.dist || ""} 
    <b>PIN</b>- ${addr.pin || ""}
    `;
      };

  // Convert binary Base64 object to data URL
  const getImageSrc = (photoObj) => {
    if (!photoObj || !photoObj.data || !photoObj.contentType) return "";
    // If your photoObj.data is a Binary object, convert to Base64 string
    let base64String = "";
    if (photoObj.data && photoObj.data.buffer) {
      // Node Buffer style (if fetched via MongoDB driver)
      const binary = new Uint8Array(photoObj.data.buffer);
      base64String = btoa(String.fromCharCode(...binary));
    } else if (photoObj.data && typeof photoObj.data === "string") {
      // Already Base64 string
      base64String = photoObj.data.replace(/^data:.*;base64,/, "");
    }
    return `data:${photoObj.contentType};base64,${base64String}`;
  };

  // Images in order: Father, Mother, Child
 const imagesHTML = `
  <div style="display:flex; gap:20px; margin:20px 0;">
    ${student.fatherPhoto ? `
      <div style="text-align:center;">
        <p style="margin-bottom:5px;"><strong>Father Photo</strong></p>
        <img src="${getImageSrc(student.fatherPhoto)}" style="height:100px; display:block; margin:0 auto;" />
      </div>` : ""}
    ${student.motherPhoto ? `
      <div style="text-align:center;">
        <p style="margin-bottom:5px;"><strong>Mother Photo</strong></p>
        <img src="${getImageSrc(student.motherPhoto)}" style="height:100px; display:block; margin:0 auto;" />
      </div>` : ""}
    ${student.childPhoto ? `
      <div style="text-align:center;">
        <p style="margin-bottom:5px;"><strong>Child Photo</strong></p>
        <img src="${getImageSrc(student.childPhoto)}" style="height:100px; display:block; margin:0 auto;" />
      </div>` : ""}
  </div>
`;


  container.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <img src="/logo.jpg" style="height: 60px; margin-right: 20px;" />
      <div>
        <h2 style="margin:0; font-size:18pt;">CENTRAL PUBLIC SCHOOL</h2>
        <p style="margin:0;">Affiliated to CISCE Board, New Delhi (ICSE & ISC)</p>
        <h3 style="margin:0;">APPLICATION FOR ADMISSION</h3>
      </div>
    </div>
    <hr style="margin-bottom: 20px;" />

    ${imagesHTML}

    <!-- Child Information -->
    <h4><strong>Child Information</strong></h4>
    <div style="margin-bottom: 15px;">
      <p><strong>Student ID:</strong> ${student.studentId || ""}</p>
      <p><strong>Name:</strong> ${getName(student)}</p>
      <p><strong>Class:</strong> ${getClass(student)}</p>
      <p><strong>Section:</strong> ${student.section || ""}</p>
      <p><strong>Roll No:</strong> ${student.rollNo || ""}</p>
      <p><strong>Gender:</strong> ${student.gender || ""}</p>
      <p><strong>Social Cast:</strong> ${student.socialCaste || ""}</p>
      <p><strong>DOB:</strong> ${formatDOB(student.dob)}</p>
      <p><strong>Height:</strong> ${student.height || ""}</p>
      <p><strong>Weight:</strong> ${student.weight || ""}</p>
      <p><strong>Blood Group:</strong> ${student.bloodGroup || ""}</p>
      <p><strong>No Of Brothers:</strong> ${student.brothers || ""}</p>
      <p><strong>No Of Sisters:</strong> ${student.sisters || ""}</p>
      <p><strong>Nationality:</strong> ${student.nationality || ""}</p>
      <p><strong>Languages:</strong> ${(student.languages || []).join(", ")}</p>
      <p><strong>Transport Required:</strong> ${student.transportRequired || ""}</p>
      <p><strong>Distance from School(KM):</strong> ${student.distanceFromSchool || ""}</p>

      <p><strong>Emergency Person:</strong> ${student.emergencyPerson || ""}</p>
      <p><strong>Emergency Contact:</strong> ${student.emergencyContact || ""}</p>

      <h4><strong>Permanent Address</strong></h4>
      <pre style="margin-bottom:10px;">${formatAddress(student.permanentAddress)}</pre>

      <h4><strong>Current Address</strong></h4>
      <pre style="margin-bottom:10px;">${formatAddress(student.currentAddress)}</pre>
    </div>

    <!-- Family Information -->
    <h4><strong>Family Information</strong></h4>
    <div>
      <p><strong>Father:</strong> ${student.fatherName || ""}</p>
      <p><strong>Father Occupation:</strong> ${student.fatherOccupation || ""}</p>
      <p><strong>Father Phone:</strong> ${student.fatherPhone || ""}</p>
      <p><strong>Father Email:</strong> ${student.fatherEmail || ""}</p>
      <p><strong>Father Nationality:</strong> ${student.fatherNationality || ""}</p>
      <p><strong>Father Qualification:</strong> ${student.fatherQualification || ""}</p>

      <p><strong>Mother:</strong> ${student.motherName || ""}</p>
      <p><strong>Mother Occupation:</strong> ${student.motherOccupation || ""}</p>
      <p><strong>Mother Phone:</strong> ${student.motherPhone || ""}</p>
      <p><strong>Mother Email:</strong> ${student.motherEmail || ""}</p>
      <p><strong>Mother Nationality:</strong> ${student.motherNationality || ""}</p>
      <p><strong>Mother Qualification:</strong> ${student.motherQualification || ""}</p>

      <p><strong>BPL:</strong> ${student.bpl || ""}</p>
      <p><strong>BPL No:</strong> ${student.bplNo || ""}</p>
      <p><strong>Family Income:</strong> ${student.familyIncome || ""}</p>
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
