import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";

const IdCardForm = ({ studentId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.studentData;

  const [formData, setFormData] = useState({
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
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAlreadyFilled, setIsAlreadyFilled] = useState(false);

  useEffect(() => {
    const fetchIdCard = async () => {
      try {
        let idCardRes = null;

        if (studentData?.studentId) {
          idCardRes = await axios.get(`http://localhost:5000/api/idcards/student/${studentData.studentId}`);
        } else if (studentId) {
          idCardRes = await axios.get(`http://localhost:5000/api/idcards/student/${studentId}`);
        }

        if (idCardRes?.data) {
          const data = idCardRes.data;
          setFormData({
            ...data,
            dob: data.dob ? data.dob.split("T")[0] : "",
            photo: null,
          });

          if (data.photo && data.photo.data) {
            const blob = new Blob(
              [new Uint8Array(data.photo.data.data)],
              { type: data.photo.contentType }
            );
            setPhotoPreview(URL.createObjectURL(blob));
          }

          setIsAlreadyFilled(true); // mark ID card as already filled
        } else if (studentData) {
          setFormData({
            ...studentData,
            studentName: `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim(),
            dob: studentData.dob ? studentData.dob.split("T")[0] : "",
            photo: null,
          });
        }
      } catch (err) {
        if (studentData) {
          setFormData({
            ...studentData,
            studentName: `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim(),
            dob: studentData.dob ? studentData.dob.split("T")[0] : "",
            photo: null,
          });
        }
        console.log("No existing ID card found", err);
      }
    };

    fetchIdCard();
  }, [studentData, studentId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      permanentAddress: { ...prev.permanentAddress, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("studentName", formData.studentName);
    data.append("dob", formData.dob);
    data.append("className", formData.admitClass);
    data.append("bloodGroup", formData.bloodGroup);
    data.append("fatherName", formData.fatherName);
    data.append("motherName", formData.motherName);
    data.append("contactNo", formData.fatherPhone);
    data.append("whatsappNo", formData.whatsappNo);
    data.append("permanentAddress", JSON.stringify(formData.permanentAddress));
    if (formData.photo) data.append("photo", formData.photo);

    // Pass actual studentId
    if (studentData?.studentId) {
      data.append("studentId", studentData.studentId);
    } else if (studentId) {
      data.append("studentId", studentId);
    }

    try {
      await axios.post("http://localhost:5000/api/idcards", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("ID Card saved!");
      navigate("/StudentList");
    } catch (err) {
      alert(
        "Failed to save ID card: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-center mb-2 text-white bg-gray-800 py-1 rounded">
            ID Card Form
          </h2>

          {isAlreadyFilled && (
            <p className="text-red-600 font-bold mb-2 text-center">
              ID Card already filled for this student
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label>
              Student’s Name
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              DOB
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              Class
              <input
                type="text"
                name="admitClass"
                value={formData.admitClass}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              Blood Group
              <input
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              Father’s Name
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              Mother’s Name
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              Contact No
              <input
                type="text"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                disabled
              />
            </label>

            <label>
              Whatsapp No
              <input
                type="text"
                name="whatsappNo"
                value={formData.whatsappNo}
                onChange={handleChange}
                placeholder="Whatsapp number"
                className="border bg-gray-100 p-0 rounded w-full"
                
              />
            </label>

            <div className="col-span-full">
              <p className="pl-2 font-bold mb-1 text-white bg-gray-800 py-1 rounded">
                Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                {["vill", "po", "block", "pin", "ps", "dist"].map((field) => (
                  <div key={field} className="flex flex-col">
                    <label>{field.toUpperCase()}</label>
                    <input
                      name={field}
                      value={formData.permanentAddress[field]}
                      onChange={handleAddressChange}
                      className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>

            <label className="col-span-1">
              Upload Photo
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className="border bg-gray-100 p-1 rounded w-full"
                
              />
            </label>

            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="col-span-full max-w-xs mt-2 rounded"
              />
            )}

            {!isAlreadyFilled && (
              <div className="col-span-full flex justify-between">
                <BackButton />
                <button
                  type="submit"
                  className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdCardForm;
