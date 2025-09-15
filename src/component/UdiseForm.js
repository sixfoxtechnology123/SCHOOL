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
console.log(studentData)
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
     panchayat: "",
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
            dob: data.dob ? data.dob.split("T")[0] : "",
            photo: null,
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-center mb-2 text-white bg-gray-800 py-0 rounded">
            UDISE Form
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-1">
            {/* Fixed: Correct field names */}
            <label>
              Student Name
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Gender
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              >
                <option value="">--Select--</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>

            <label>
              Height
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Weight
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Date of Birth
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Class
              <input
                type="text"
                name="admitClass"
                value={formData.admitClass}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Mother Tongue
              <select
                name="motherTongue"
                value={formData.motherTongue}
                onChange={handleChange}
                className="border bg-gray-100 p-1 rounded w-full"
              >
                <option value="">--Select--</option>
                <option value="BENGALI">BENGALI</option>
                <option value="HINDI">HINDI</option>
                <option value="ENGLISH">ENGLISH</option>
              </select>
            </label>

            <label>
              Social Category
              <input
                type="text"
                name="socialCaste"
                value={formData.socialCaste}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Father Name
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Mother Name
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Guardian Name
              <input
                type="text"
                name="guardianName"
                value={formData.fatherName}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Religion
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="border bg-gray-100 p-1 rounded w-full"
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
                className="border p-1 rounded w-full bg-gray-200"
              />
            </label>

            <label>
              BPL Beneficiary
              <select
                name="bpl"
                value={formData.bpl}
                onChange={handleChange}
                disabled
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
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
                  onChange={handleChange}
                  readOnly
                  className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                />
              </label>
            )}

            <label>
              Guardian Qualification
              <input
                type="text"
                name="fatherQualification"
                value={formData.fatherQualification}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              EWS/Disadvantaged Group
              <input
                type="text"
                name="ews"
                value={formData.ews}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Anual Income
              <input
                type="text"
                name="familyIncome"
                value={formData.familyIncome}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Contact No
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              CWSN
              <input
                type="text"
                name="cwsn"
                value={formData.cwsn}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            {/* Current Address */}
            <label>
              Village
              <input
                type="text"
                name="currentAddress.vill"
                value={formData.currentAddress.vill}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              PO
              <input
                type="text"
                name="currentAddress.po"
                value={formData.currentAddress.po}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              Block
              <input
                type="text"
                name="currentAddress.block"
                value={formData.currentAddress.block}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              PIN
              <input
                type="text"
                name="currentAddress.pin"
                value={formData.currentAddress.pin}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              PS
              <input
                type="text"
                name="currentAddress.ps"
                value={formData.currentAddress.ps}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>

            <label>
              District
              <input
                type="text"
                name="currentAddress.dist"
                value={formData.currentAddress.dist}
                onChange={handleChange}
                readOnly
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Panchayat
              <input
                type="text"
                name="panchayat"
                value={formData.panchayat}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              <span className="font-bold">Upload Child Photo</span>
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="col-span-full max-w-xs mt-2 rounded"
              />
            )}

            <div className="col-span-full flex justify-between mt-3">
              <BackButton />
              <button
                type="submit"
                className="px-4 py-0 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UdiseForm;
