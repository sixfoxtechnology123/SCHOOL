import React, { useState } from "react";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";

const IdCardForm = () => {
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

  // Handle normal inputs + file uploads
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle permanent address updates
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      permanentAddress: { ...prev.permanentAddress, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("ID Card Form Submitted!");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl sm:text-xl font-bold text-center text-white bg-gray-800 py-1 px-3 rounded flex-1">
              ID Card Form
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <label>
              Student’s Name
              <input
                type="text"
                name="studentName"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Date of Birth
              <input
                type="date"
                name="dob"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Class
              <input
                type="text"
                name="className"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Blood Group
              <input
                type="text"
                name="bloodGroup"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Father’s Name
              <input
                type="text"
                name="fatherName"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Mother’s Name
              <input
                type="text"
                name="motherName"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Contact No
              <input
                type="text"
                name="contactNo"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>
            <label>
              Whatsapp No
              <input
                type="text"
                name="whatsappNo"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            {/* Permanent Address Section */}
            <div className="col-span-full">
              <p className="pl-4 font-bold mb-2 text-white bg-gray-800 py-1 rounded">
            Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                {["vill", "po", "block", "pin", "ps", "dist"].map((field) => (
                  <div key={field} className="flex flex-col">
                    <label>{field.toUpperCase()} -</label>
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

            <label className="col-span-full">
              Upload Photo (School Uniform)
              <input type="file" name="photo" onChange={handleChange} />
            </label>

            <div className="col-span-full flex justify-between">
              <BackButton />
              <button
                type="submit"
                className="px-4 py-1 bg-gray-800 text-white rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdCardForm;
