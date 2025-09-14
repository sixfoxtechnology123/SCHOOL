import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const IdCardForm = ({ studentId }) => {
  const location = useLocation();  
  const studentData = location.state?.studentData;

  console.log("Received studentData:", studentData);

  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    className: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    contactNo: "",
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

useEffect(() => {
  if (studentData) {
    setFormData({
      ...studentData,
      // Combine first and last name for display
      studentName: `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim(),
      dob: studentData.dob ? studentData.dob.split("T")[0] : "",
      photo: null,
    });

    if (studentData.photo && studentData.photo.data) {
      const blob = new Blob(
        [new Uint8Array(studentData.photo.data.data)],
        { type: studentData.photo.contentType }
      );
      setPhotoPreview(URL.createObjectURL(blob));
    }
  } else if (studentId) {
    axios.get(`/api/idcards/${studentId}`).then((res) => {
      const data = res.data;
      setFormData({
        ...data,
        studentName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
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
    });
  }
}, [studentData, studentId]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else setFormData({ ...formData, [name]: value });
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
    Object.keys(formData).forEach((key) => {
      if (key === "photo" && formData.photo) data.append(key, formData.photo);
      else if (key === "permanentAddress") data.append(key, JSON.stringify(formData[key]));
      else data.append(key, formData[key]);
    });

    try {
      await axios.post("/api/idcards", data);
      alert("ID Card saved!");
    } catch (err) {
      console.error("Error saving ID card:", err);
      alert("Failed to save ID card");
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label>
              Student’s Name
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              DOB
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Class
              <input
                type="text"
                name="className"
                value={formData.admitClass}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Blood Group
              <input
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Father’s Name
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Mother’s Name
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Contact No
              <input
                type="text"
                name="contactNo"
                value={formData.fatherPhone}
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
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
                      className="border bg-gray-100 p-0 rounded w-full"
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

            <div className="col-span-full flex justify-between">
              <BackButton />
              <button
                type="submit"
                className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
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

export default IdCardForm;
