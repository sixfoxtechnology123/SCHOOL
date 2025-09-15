import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";

const UdiseForm = ({ studentId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.studentData || {};

  const [formData, setFormData] = useState({
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
    photo: null,
    languages: [],
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
  const [udiseId, setUdiseId] = useState(null);

  useEffect(() => {
    const fetchUdise = async () => {
      try {
        const id = studentData?.studentId || studentId;
        if (!id) return;

        const res = await axios.get(`http://localhost:5000/api/udise/${id}`);

        if (res?.data && res.data._id) {
          const data = res.data;
          setFormData((prev) => ({
            ...prev,
            ...data,
            socialCaste: data.socialCaste || prev.socialCaste,
            ews: data.ews || prev.ews,
            dob: data.dob ? data.dob.split("T")[0] : "",
            photo: null,
            currentAddress: data.currentAddress || prev.currentAddress,
          }));

          if (data.photo && data.photo.data) {
            const blob = new Blob([new Uint8Array(data.photo.data.data)], {
              type: data.photo.contentType,
            });
            setPhotoPreview(URL.createObjectURL(blob));
          }

          setUdiseId(data._id);
          setIsAlreadyFilled(true);
        } else {
          const fullName = [studentData.firstName, studentData.lastName]
            .filter(Boolean)
            .join(" ");
          setFormData((prev) => ({
            ...prev,
            ...studentData,
            studentName: studentData.studentName || fullName,
            dob: studentData.dob ? studentData.dob.split("T")[0] : "",
          }));
        }
      } catch (err) {
        console.log("No existing UDISE record found", err);
        const fullName = [studentData.firstName, studentData.lastName]
          .filter(Boolean)
          .join(" ");
        setFormData((prev) => ({
          ...prev,
          ...studentData,
          studentName: studentData.studentName || fullName,
          dob: studentData.dob ? studentData.dob.split("T")[0] : "",
        }));
      }
    };

    fetchUdise();
  }, [studentData, studentId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const upperCaseFields = ["motherTongue", "religion", "ews", "cwsn", "panchayat"];
    let newValue = value;
    if (upperCaseFields.includes(name)) newValue = value.toUpperCase();

    if (name.startsWith("currentAddress.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        currentAddress: { ...prev.currentAddress, [field]: newValue },
      }));
    } else if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "photo" && formData.photo) {
        data.append("photo", formData.photo);
      } else if (key === "currentAddress") {
        data.append("currentAddress", JSON.stringify(formData.currentAddress));
      } else {
        data.append(key, formData[key] || "");
      }
    });

    const id = studentData?.studentId || studentId;
    if (!id) {
      alert("Student ID is missing!");
      return;
    }
    data.append("studentId", id);

    try {
      if (isAlreadyFilled && isEditMode) {
        await axios.put(`http://localhost:5000/api/udise/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("UDISE record updated!");
      } else {
        await axios.post(`http://localhost:5000/api/udise/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("UDISE record saved!");
      }
      navigate("/StudentList");
    } catch (err) {
      console.error("Save UDISE error:", err.response || err.message);
      alert(
        "Failed to save UDISE record: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const fieldClass = (alwaysReadOnly = false) =>
    `${
      alwaysReadOnly || (isAlreadyFilled && !isEditMode)
        ? "cursor-not-allowed bg-gray-100"
        : "bg-white"
    } border p-0 rounded w-full`;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-center mb-1 text-white bg-gray-800 py-0 rounded">
            UDISE Form
          </h2>

          {isAlreadyFilled && !isEditMode && (
            <p className="text-red-600 font-semibold text-center mb-3">
              ⚠️ UDISE already filled
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {/* Student Name */}
            <label>
              Student Name
              <input type="text" name="studentName" value={formData.studentName} readOnly className={fieldClass(true)} />
            </label>

            {/* Gender */}
            <label>
              Gender
              <select name="gender" value={formData.gender} disabled className={fieldClass(true)}>
                <option value="">--Select--</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>

            {/* Height */}
            <label>
              Height
              <input type="text" name="height" value={formData.height} readOnly className={fieldClass(true)} />
            </label>

            {/* Weight */}
            <label>
              Weight
              <input type="text" name="weight" value={formData.weight} readOnly className={fieldClass(true)} />
            </label>

            {/* DOB */}
            <label>
              Date of Birth
              <input type="date" name="dob" value={formData.dob} readOnly className={fieldClass(true)} />
            </label>

            {/* Class */}
            <label>
              Class
              <input type="text" name="admitClass" value={formData.admitClass} readOnly className={fieldClass(true)} />
            </label>

            {/* Mother Tongue */}
            <label>
              Mother Tongue
              <select name="motherTongue" value={formData.motherTongue} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()}>
                <option value="">--Select--</option>
                <option value="BENGALI">BENGALI</option>
                <option value="HINDI">HINDI</option>
                <option value="ENGLISH">ENGLISH</option>
              </select>
            </label>

            {/* socialCaste */}
            <label>
              social Caste
              <input type="text" name="socialCaste" value={formData.socialCaste} onChange={handleChange} readOnly className={fieldClass(true)} />
            </label>

            {/* Father Name */}
            <label>
              Father Name
              <input type="text" name="fatherName" value={formData.fatherName} readOnly className={fieldClass(true)} />
            </label>

            {/* Mother Name */}
            <label>
              Mother Name
              <input type="text" name="motherName" value={formData.motherName} readOnly className={fieldClass(true)} />
            </label>

            {/* Guardian Name */}
            <label>
              Guardian Name
              <input type="text" name="guardianName" value={formData.fatherName} readOnly className={fieldClass(true)} />
            </label>

            {/* Religion */}
            <label>
              Religion
              <select name="religion" value={formData.religion} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()}>
                <option value="">--Select--</option>
                <option value="HINDU">HINDU</option>
                <option value="MUSLIM">MUSLIM</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>

            {/* Nationality */}
            <label>
              Nationality
              <input type="text" name="nationality" value={formData.nationality} readOnly className={fieldClass(true)} />
            </label>

            {/* BPL */}
            <label>
              BPL Beneficiary
              <select name="bpl" value={formData.bpl} disabled className={fieldClass(true)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>

            {formData.bpl === "Yes" && (
              <label>
                BPL No
                <input type="text" name="bplNo" value={formData.bplNo} readOnly className={fieldClass(true)} />
              </label>
            )}

            {/* Guardian Qualification */}
            <label>
              Guardian Qualification
              <input type="text" name="fatherQualification" value={formData.fatherQualification} readOnly className={fieldClass(true)} />
            </label>

            {/* EWS */}
            <label>
              EWS/Disadvantaged Group
              <input type="text" name="ews" value={formData.ews} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()} />
            </label>

            {/* Income */}
            <label>
              Annual Income
              <input type="text" name="familyIncome" value={formData.familyIncome} readOnly className={fieldClass(true)} />
            </label>

            {/* Contact */}
            <label>
              Contact No
              <input type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()} />
            </label>

            {/* CWSN */}
            <label>
              CWSN
              <input type="text" name="cwsn" value={formData.cwsn} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()} />
            </label>

            {/* Current Address */}
            <label>
              Village
              <input type="text" name="currentAddress.vill" value={formData.currentAddress.vill} readOnly className={fieldClass(true)} />
            </label>

            <label>
              PO
              <input type="text" name="currentAddress.po" value={formData.currentAddress.po} readOnly className={fieldClass(true)} />
            </label>

            <label>
              Block
              <input type="text" name="currentAddress.block" value={formData.currentAddress.block} readOnly className={fieldClass(true)} />
            </label>

            <label>
              PIN
              <input type="text" name="currentAddress.pin" value={formData.currentAddress.pin} readOnly className={fieldClass(true)} />
            </label>

            <label>
              PS
              <input type="text" name="currentAddress.ps" value={formData.currentAddress.ps} readOnly className={fieldClass(true)} />
            </label>

            <label>
              District
              <input type="text" name="currentAddress.dist" value={formData.currentAddress.dist} readOnly className={fieldClass(true)} />
            </label>

            <label>
              Panchayat
              <input type="text" name="panchayat" value={formData.panchayat} onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()} />
            </label>

            {/* Photo */}
            <label>
              <span className="font-bold">Upload Child Photo</span>
              <input type="file" name="photo" onChange={handleChange} disabled={isAlreadyFilled && !isEditMode} className={fieldClass()} />
            </label>

            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="col-span-full max-w-xs mt-2 rounded" />
            )}

            {/* Buttons */}
            <div className="col-span-full flex justify-between mt-3">
              <BackButton />
              {!isAlreadyFilled && (
                <button type="submit" className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded">
                  Save
                </button>
              )}
              {isAlreadyFilled && !isEditMode && (
                <button type="button" onClick={() => setIsEditMode(true)} className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">
                  Edit
                </button>
              )}
              {isAlreadyFilled && isEditMode && (
                <button type="submit" className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded">
                  Update
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UdiseForm;
