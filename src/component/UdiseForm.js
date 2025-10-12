import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const UdiseForm = ({ studentId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.studentData || {};

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    gender: "",
    height: "",
    weight: "",
    dob: "",
    admitClass: "",
    motherTongue: "",
    socialCaste: "",
    fatherName: "",
    motherName: "",
    guardianName: "",
    guardianQualification: "",
    religion: "",
    nationality: "INDIAN",
    bpl: "No",
    bplNo: "",
    fatherQualification: "",
    ews: "",
    familyIncome: "",
    contactNo: "",
    cwsn: "",
    panchayat: "",
    udisePhoto: null,
    currentAddress: {
      vill: "",
      po: "",
      block: "",
      pin: "",
      ps: "",
      dist: "",
    },
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAlreadyFilled, setIsAlreadyFilled] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const id = studentData?.studentId || studentId;

useEffect(() => {
  const fetchStudent = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/students/check-udise/${id}`);
      const student = res.data.udiseData || {};

      setFormData((prev) => ({
        ...prev,
        studentId: id,
        studentName:
          (student.firstName || studentData?.firstName || "") +
          (student.lastName || studentData?.lastName ? " " + (student.lastName || studentData?.lastName) : ""),
        dob: student.dob ? student.dob.split("T")[0] : studentData?.dob ? studentData.dob.split("T")[0] : "",
        admitClass: student.admitClass || studentData?.admitClass || "",
        fatherName: student.fatherName || studentData?.fatherName || "",
        motherName: student.motherName || studentData?.motherName || "",
        guardianName: student.fatherName || studentData?.fatherName || "",
        guardianQualification: student.fatherQualification || studentData?.fatherQualification || "",
        gender: student.gender || studentData?.gender || "",
        height: student.height || studentData?.height || "",
        weight: student.weight || studentData?.weight || "",
        motherTongue: student.motherTongue || "",
        socialCaste: student.socialCaste || studentData?.socialCaste || "",
        religion: student.religion || "",
        nationality: student.nationality || "INDIAN",
        bpl: student.bpl || "No",
        bplNo: student.bplNo || "",
        fatherQualification: student.fatherQualification || "",
        ews: student.ews || "",
        familyIncome: student.familyIncome || studentData?.familyIncome || "",
        contactNo: student.contactNo || "",
        cwsn: student.cwsn || "",
        panchayat: student.panchayat || "",
        currentAddress: {
          vill: student.currentAddress?.vill || studentData?.currentAddress?.vill || "",
          po: student.currentAddress?.po || studentData?.currentAddress?.po || "",
          block: student.currentAddress?.block || studentData?.currentAddress?.block || "",
          pin: student.currentAddress?.pin || studentData?.currentAddress?.pin || "",
          ps: student.currentAddress?.ps || studentData?.currentAddress?.ps || "",
          dist: student.currentAddress?.dist || studentData?.currentAddress?.dist || "",
        },
        udisePhoto: student.udisePhoto || null,
      }));

      if (student.udisePhoto?.data) {
        setPhotoPreview(`data:${student.udisePhoto.contentType};base64,${student.udisePhoto.data}`);
      } else {
        setPhotoPreview(null);
      }

      setIsAlreadyFilled(res.data.exists);
      setIsEditMode(false);
    } catch (err) {
      console.error("Failed to fetch UDISE data:", err);
    }
  };

  fetchStudent();
}, [id, studentData]);




  // ===== Disabled logic =====
  const isDisabled = (always = false) => always || (isAlreadyFilled && !isEditMode);
  const fieldClass = (alwaysReadOnly = false) =>
    `${isDisabled(alwaysReadOnly) ? "cursor-not-allowed bg-gray-100" : "bg-white"} border p-0 rounded w-full`;

  // ===== Handle input change =====
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const upperCaseFields = ["motherTongue", "religion", "ews", "cwsn", "panchayat"];
    const newValue = upperCaseFields.includes(name) ? (value || "").toUpperCase() : value;

    if (name.startsWith("currentAddress.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        currentAddress: { ...prev.currentAddress, [field]: newValue },
      }));
      return;
    }

    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, udisePhoto: files[0] }));
      setPhotoPreview(URL.createObjectURL(files[0]));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // ===== Submit UDISE =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      alert("Student ID is missing!");
      return;
    }

    const data = new FormData();
    data.append("motherTongue", formData.motherTongue || "");
    data.append("religion", formData.religion || "");
    data.append("ews", formData.ews || "");
    data.append("contactNo", formData.contactNo || "");
    data.append("cwsn", formData.cwsn || "");
    data.append("panchayat", formData.panchayat || "");
    data.append("currentAddress", JSON.stringify(formData.currentAddress || {}));
    if (formData.udisePhoto) data.append("udisePhoto", formData.udisePhoto);

    try {
   await axios.put(
  `http://localhost:5000/api/students/update/${studentData.admissionNo}`,
  data,
  { headers: { "Content-Type": "multipart/form-data" } }
);


      alert(isAlreadyFilled && isEditMode ? "UDISE record updated!" : "UDISE record saved!");
      navigate("/StudentList");
    } catch (err) {
      alert("Failed to save UDISE record: " + (err.response?.data?.error || err.message));
    }
  };

  // ===== View PDF =====
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
          <div style="min-width:210px;"><strong>${label2}</strong></div>
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
          <h3 style="margin:0; font-size:18pt; font-weight:bold; color:#1d4ed8;">UDISE</h3>
        </div>
        <img src="/logo1.jpg" style="height:80px;" />
      </div>
      <hr style="border:2px solid #004080; margin-bottom:12px;" />
    `;

    const udiseHTML = `
      <div style="border:1px solid #000; padding:12px; display:flex; justify-content:space-between;">
        <div style="flex:1; padding-right:12px;">
          ${twoColRow("Student ID", formData.studentId || "", "Name", formData.studentName || "")}
          ${twoColRow("Gender", formData.gender || "", "Height", formData.height || "")}
          ${twoColRow("Weight", formData.weight || "", "DOB", formData.dob || "")}
          ${twoColRow("Class", formData.admitClass || "", "Mother Tongue", formData.motherTongue || "")}
          ${twoColRow("Father", formData.fatherName || "", "Mother", formData.motherName || "")}
          ${twoColRow("Guardian Name", formData.guardianName || "", "Guardian Qualification", formData.guardianQualification || "")}
          ${twoColRow("Religion", formData.religion || "", "Nationality", formData.nationality || "")}
          ${twoColRow("BPL", formData.bpl || "", "BPL No", formData.bplNo || "")}
          ${twoColRow("EWS", formData.ews || "", "Family Income", formData.familyIncome || "")}
          ${twoColRow("Contact No", formData.contactNo || "", "CWSN", formData.cwsn || "")}
          ${twoColRow("Panchayat", formData.panchayat || "", "", "")}
          <hr style="margin:10px 0; border:1px solid #000;" />
          <h3 style="margin:4px 0; color:#1e40af;  font-size:14pt;">ADDRESS</h3>
          ${twoColRow("VILL", formData.currentAddress?.vill, "PO", formData.currentAddress?.po)}
          ${twoColRow("PS", formData.currentAddress?.ps, "BLOCK", formData.currentAddress?.block)}
          ${twoColRow("DIST", formData.currentAddress?.dist, "PIN", formData.currentAddress?.pin)}
        </div>
        <div style="width:150px;">
          ${photoPreview ? `<img src="${photoPreview}" style="width:100%; border:1px solid #000;" />` : ""}
        </div>
      </div>
    `;

    container.innerHTML = headerHTML + udiseHTML;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${formData.studentName || "UDISE"}.pdf`);
    document.body.removeChild(container);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-center mb-2 text-white bg-gray-800 py-0 rounded">
            UDISE Form
          </h2>

          {isAlreadyFilled && !isEditMode && (
            <p className="text-red-600 font-bold mb-2 text-center">
              ⚠️ UDISE already filled for this student
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Student info fields */}
            <label>Student Name
              <input type="text" name="studentName" value={formData.studentName} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>
            <label>Gender
              <select name="gender" value={formData.gender} onChange={handleChange} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed">
                <option value="">--Select--</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </label>
            <label>Height
              <input type="text" name="height" value={formData.height} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>
            <label>Weight
              <input type="text" name="weight" value={formData.weight} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>
            <label>DOB
              <input type="date" name="dob" value={formData.dob} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>
            <label>Class
              <input type="text" name="admitClass" value={formData.admitClass} disabled className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"/>
            </label>
            <label>Mother Tongue
              <select name="motherTongue" value={formData.motherTongue} onChange={handleChange} disabled={isDisabled()} className={fieldClass()}>
                <option value="">--Select--</option>
                <option value="BENGALI">BENGALI</option>
                <option value="HINDI">HINDI</option>
                <option value="ENGLISH">ENGLISH</option>
              </select>
            </label>

            <label>
              Social Caste
              <input
                type="text"
                name="socialCaste"
                value={formData.socialCaste}
                readOnly
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              Father Name
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                readOnly
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              Mother Name
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                readOnly
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

        <label>
          Guardian Name
          <input
            type="text"
            name="guardianName"
            value={formData.guardianName}
            readOnly
            disabled={isDisabled(true)}
            className={fieldClass(true)}
          />
        </label>




            <label>
              Religion
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                disabled={isDisabled()}
                className={fieldClass()}
              >
                <option value="">--Select--</option>
                <option value="HINDU">HINDU</option>
                <option value="MUSLIM">MUSLIM</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>

            <label>
              Nationality
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                readOnly
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              BPL Beneficiary
              <select
                name="bpl"
                value={formData.bpl}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>

            {formData.bpl === "Yes" && (
              <label>
                BPL No
                <input
                  type="text"
                  name="bplNo"
                  value={formData.bplNo}
                  disabled={isDisabled(true)}
                  className={fieldClass(true)}
                />
              </label>
            )}

            <label>
                Guardian Qualification
                <input
                  type="text"
                  name="guardianQualification" // <-- should match state property
                  value={formData.guardianQualification} // <-- use guardianQualification
                  readOnly
                  disabled={isDisabled(true)}
                  className={fieldClass(true)}
                />
              </label>


            <label>
              EWS/Disadvantaged Group
              <input
                type="text"
                name="ews"
                value={formData.ews}
                onChange={handleChange}
                disabled={isDisabled()}
                className={fieldClass()}
              />
            </label>

            <label>
              Annual Income
              <input
                type="text"
                name="familyIncome"
                value={formData.familyIncome}
                readOnly
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              Contact No
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                disabled={isDisabled()}
                className={fieldClass()}
              />
            </label>

            <label>
              CWSN
              <input
                type="text"
                name="cwsn"
                value={formData.cwsn}
                onChange={handleChange}
                disabled={isDisabled()}
                className={fieldClass()}
              />
            </label>

            <label>
              Village
              <input
                type="text"
                name="currentAddress.vill"
                value={formData.currentAddress?.vill || ""}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              PO
              <input
                type="text"
                name="currentAddress.po"
                value={formData.currentAddress?.po || ""}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              Block
              <input
                type="text"
                name="currentAddress.block"
                value={formData.currentAddress?.block || ""}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              PIN
              <input
                type="text"
                name="currentAddress.pin"
                value={formData.currentAddress?.pin || ""}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              PS
              <input
                type="text"
                name="currentAddress.ps"
                value={formData.currentAddress?.ps || ""}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              District
              <input
                type="text"
                name="currentAddress.dist"
                value={formData.currentAddress?.dist || ""}
                onChange={handleChange}
                disabled={isDisabled(true)}
                className={fieldClass(true)}
              />
            </label>

            <label>
              Panchayat
              <input
                type="text"
                name="panchayat"
                value={formData.panchayat}
                onChange={handleChange}
                disabled={isDisabled()}
                className={fieldClass()}
              />
            </label>

            {/* Photo */}
            <label>Upload Child Photo
              <input type="file" name="udisePhoto" onChange={handleChange} disabled={isDisabled()} className={fieldClass()}/>
            </label>
            {photoPreview && <img src={photoPreview} alt="Preview" className="col-span-full max-w-xs mt-2 rounded" />}

            {/* Buttons */}
            <div className="col-span-full flex justify-between items-center gap-2">
              <BackButton />
              {isAlreadyFilled && !isEditMode && (
                <>
                  <button type="button" onClick={handleView} className="px-4 py-0 bg-blue-600 hover:bg-blue-700 text-white rounded">View</button>
                  <button type="button" onClick={() => setIsEditMode(true)} className="px-4 py-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Edit</button>
                </>
              )}
              {!isAlreadyFilled && (
                <button type="submit" className="px-4 py-0 bg-green-600 hover:bg-green-700 text-white rounded">Save</button>
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

export default UdiseForm;