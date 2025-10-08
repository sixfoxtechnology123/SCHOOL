import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const IdCardForm = ({ studentId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.studentData;

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    dob: "",
    admitClass: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    fatherPhone: "",
    whatsappNo: "",
    permanentAddress: {
      vill: "",
      po: "",
      block: "",
      pin: "",
      ps: "",
      dist: "",
    },
    idCardPhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAlreadyFilled, setIsAlreadyFilled] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // ===== Fetch student ID card info =====
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        let studentIdToFetch = studentData?.studentId || studentId;
        if (!studentIdToFetch) return;

        const res = await axios.get(
          `http://localhost:5000/api/students/${studentIdToFetch}/idcard-udise`
        );

        if (res.data) {
          const data = res.data.idCardInfo || {};
          setFormData((prev) => ({
            ...prev,
            studentId: studentIdToFetch,
            studentName: studentData?.studentName || studentData?.firstName + " " + studentData?.lastName || "",
            dob: studentData?.dob ? studentData.dob.split("T")[0] : "",
            admitClass: studentData?.admitClass || "",
            bloodGroup: studentData?.bloodGroup || "",
            fatherName: studentData?.fatherName || "",
            motherName: studentData?.motherName || "",
            fatherPhone: studentData?.fatherPhone || "",
            whatsappNo: data.whatsappNo || "",
            permanentAddress: data.permanentAddress || {},
            idCardPhoto: data.idCardPhoto || null,
          }));

      if (data.idCardPhoto?.data) {
        setPhotoPreview(`data:${data.idCardPhoto.contentType};base64,${data.idCardPhoto.data}`);
      }


       setIsAlreadyFilled(
        !!(
          (data.whatsappNo && data.whatsappNo.trim() !== "") ||
          (data.idCardPhoto && data.idCardPhoto.data)
        )
      );

        }
      } catch (err) {
        console.error("Failed to fetch ID Card data", err);
      }
    };

    fetchStudentData();
  }, [studentData, studentId]);

  // ===== Handle input changes =====
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      permanentAddress: { ...prev.permanentAddress, [name]: value },
    }));
  };

  // ===== Submit/Update ID Card =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("whatsappNo", formData.whatsappNo);
      form.append("permanentAddress", JSON.stringify(formData.permanentAddress));

      if (formData.idCardPhoto) {
        form.append("idCardPhoto", formData.idCardPhoto);
      }

      await axios.put(
        `http://localhost:5000/api/students/${formData.studentId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(isAlreadyFilled ? "ID Card updated!" : "ID Card saved!");
      navigate("/StudentList");
    } catch (err) {
      console.error("Error saving ID Card:", err);
      alert(
        "Failed to save ID card: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // ===== PDF Generation =====
  const handleView = async () => {
    const container = document.createElement("div");
    container.style.padding = "25px";
    container.style.background = "#fff";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "14px";
    container.style.color = "#000";

    const twoColRow = (label1, value1, label2, value2) => `
      <div style="display:flex; padding:2px 0; font-size:14pt;">
        <div style="flex:1; display:flex;">
          <div style="min-width:150px;"><strong>${label1}</strong></div>
          <div>: ${value1 || ""}</div>
        </div>
        ${label2 ? `<div style="flex:1; display:flex;">
          <div style="min-width:150px;"><strong>${label2}</strong></div>
          <div>: ${value2 || ""}</div>
        </div>` : ""}
      </div>
    `;

    const headerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <img src="/logo1.jpg" style="height:80px;" />
        <div style="text-align:center; flex:1; margin:0 20px;">
          <h2 style="margin:0; font-size:22pt; color:#004080;">CENTRAL PUBLIC SCHOOL</h2>
          <p style="margin:4px 0; font-size:16pt; color:#004080;">Affiliated to CISCE Board, New Delhi (ICSE & ISC)</p>
          <h3 style="margin:0; font-size:18pt; font-weight:bold; color:#1d4ed8;">ID CARD</h3>
        </div>
        <img src="/logo1.jpg" style="height:80px;" />
      </div>
      <hr style="border:2px solid #004080; margin-bottom:12px;" />
    `;

    const idCardHTML = `
      <div style="border:1px solid #000; padding:12px; display:flex; justify-content:space-between;">
        <div style="flex:1; padding-right:12px;">
          ${twoColRow("Student ID", formData.studentId, "Name", formData.studentName)}
          ${twoColRow("Class", formData.admitClass, "DOB", formData.dob)}
          ${twoColRow("Father", formData.fatherName, "Mother", formData.motherName)}
          ${twoColRow("Contact No", formData.fatherPhone || "", "Whatsapp No", formData.whatsappNo || "")}
          <hr style="margin:10px 0; border:1px solid #000;" />
          <h3 style="margin:4px 0; color:#1e40af;  font-size:14pt;">ADDRESS</h3>
          ${twoColRow("VILL", formData.permanentAddress?.vill, "PO", formData.permanentAddress?.po)}
          ${twoColRow("PS", formData.permanentAddress?.ps, "BLOCK", formData.permanentAddress?.block)}
          ${twoColRow("DIST", formData.permanentAddress?.dist, "PIN", formData.permanentAddress?.pin)}
        </div>
        <div style="width:150px;">
          ${photoPreview ? `<img src="${photoPreview}" style="width:100%; border:1px solid #000;" />` : ""}
        </div>
      </div>
    `;

    container.innerHTML = headerHTML + idCardHTML;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${formData.studentName || "ID_Card"}.pdf`);
    document.body.removeChild(container);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-center mb-2 text-white bg-gray-800 py-0 rounded">
            ID Card Form
          </h2>

          {isAlreadyFilled && !isEditMode && (
            <p className="text-red-600 font-bold mb-2 text-center">
              ⚠️ ID Card already filled for this student
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            {/* Student Info */}
            <label>
              Student’s Name
              <input type="text" name="studentName" value={formData.studentName} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              DOB
              <input type="date" name="dob" value={formData.dob} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              Class
              <input type="text" name="admitClass" value={formData.admitClass} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              Blood Group
              <input type="text" name="bloodGroup" value={formData.bloodGroup} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              Father’s Name
              <input type="text" name="fatherName" value={formData.fatherName} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              Mother’s Name
              <input type="text" name="motherName" value={formData.motherName} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              Contact No
              <input type="text" name="fatherPhone" value={formData.fatherPhone} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>

            <label>
              Whatsapp No
              <input type="text" name="whatsappNo" value={formData.whatsappNo} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={`border p-0 rounded w-full ${isAlreadyFilled && !isEditMode ? "bg-gray-100" : ""}`}/>
            </label>

            {/* Address */}
            <div className="col-span-full">
              <p className="pl-2 font-bold mb-1 text-white bg-gray-800 py-1 rounded">Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                {["vill", "po", "block", "pin", "ps", "dist"].map((field) => (
                  <div key={field} className="flex flex-col">
                    <label>{field.toUpperCase()}</label>
                    <input name={field} value={formData.permanentAddress[field]} onChange={handleAddressChange} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo */}
            <label className="col-span-1">
              <span className="font-bold">Upload ID Card Photo</span>
              <input type="file" name="idCardPhoto" onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={`border p-1 rounded w-full ${isAlreadyFilled && !isEditMode ? "bg-gray-100" : ""}`} />
            </label>

           {photoPreview && <img src={photoPreview} alt="Preview" className="col-span-full max-w-xs mt-2 rounded" />}


            {/* Buttons */}
            <div className="col-span-full flex justify-between items-center gap-2">
              <BackButton />

              {isAlreadyFilled && !isEditMode && (
                <button type="button" onClick={handleView} className="px-4 py-0 bg-blue-600 hover:bg-blue-700 text-white rounded">View</button>
              )}

              {!isAlreadyFilled && (
                <button type="submit" className="px-4 py-0 bg-green-600 hover:bg-green-700 text-white rounded">Save</button>
              )}

              {isAlreadyFilled && !isEditMode && (
                <button type="button" onClick={() => setIsEditMode(true)} className="px-4 py-0 bg-blue-600 hover:bg-blue-700 text-white rounded">Edit</button>
              )}

              {isAlreadyFilled && isEditMode && (
                <button type="submit" className="px-4 py-0 bg-green-600 hover:bg-green-700 text-white rounded">Update</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdCardForm;
