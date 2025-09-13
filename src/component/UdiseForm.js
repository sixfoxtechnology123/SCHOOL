import React, { useState } from "react";
import BackButton from "../component/BackButton";
import Sidebar from "../component/Sidebar";
import Header from "./Header";

const UdiseForm = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    height: "",
    weight: "",
    dob: "",
    className: "",
    motherTongue: "",
    socialCategory: "",
    fatherName: "",
    motherName: "",
    guardianName: "",
    religion: "",
    nationality: "INDIAN",
    bpl: "No",
    bplNo: "",
    guardianQualification: "",
    ews: "",
    annualIncome: "",
    contactNo: "",
    cwsn: "",
    locality: "",
    dist: "",
    block: "",
    panchayat: "",
    po: "",
    ps: "",
    pin: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("UDISE Form Submitted!");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          {/* Heading same style as ID Card */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl sm:text-xl font-bold text-center text-white bg-gray-800 py-0 px-3 rounded flex-1">
              UDISE Form
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
              Gender
              <select
                name="gender"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              >
                <option value="">--Select--</option>
                <option>M</option>
                <option>F</option>
              </select>
            </label>

            <label>
              Height (cm)
              <input
                type="text"
                name="height"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Weight
              <input
                type="text"
                name="weight"
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
              Mother Tongue
              <select
                name="motherTongue"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              >
                <option value="">--Select--</option>
                <option value="BENGALI">BENGALI</option>
                <option value="HINDI">HINDI</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>

            <label>
              Social Category
              <select
                name="socialCategory"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              >
                <option value="">--Select--</option>
                <option>GENERAL</option>
                <option>SC</option>
                <option>ST</option>
                <option>OBC A</option>
                <option>OBC B</option>
              </select>
            </label>

            <label>
              Father Name
              <input
                type="text"
                name="fatherName"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Mother Name
              <input
                type="text"
                name="motherName"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Guardian Name
              <input
                type="text"
                name="guardianName"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Religion
              <select
                name="religion"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              >
                <option value="">--Select--</option>
                <option value="HINDU">Hindu</option>
                <option value="MUSLIM">Muslim</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label>
              Nationality
              <input
                type="text"
                value="INDIAN"
                readOnly
                className="border bg-gray-100 p-0 rounded w-full bg-gray-200"
              />
            </label>

            <label>
              BPL Beneficiary
              <select
                name="bpl"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>

            {formData.bpl === "Yes" && (
              <label>
                BPL No
                <input
                  type="text"
                  name="bplNo"
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            )}

            <label>
              Guardian Qualification
              <input
                type="text"
                name="guardianQualification"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              EWS/Disadvantaged Group
              <input
                type="text"
                name="ews"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Annual Income
              <input
                type="text"
                name="annualIncome"
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
              CWSN
              <input
                type="text"
                name="cwsn"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Locality
              <input
                type="text"
                name="locality"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              District
              <input
                type="text"
                name="dist"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Block
              <input
                type="text"
                name="block"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              Panchayat
              <input
                type="text"
                name="panchayat"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              PO
              <input
                type="text"
                name="po"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              PS
              <input
                type="text"
                name="ps"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label>
              PIN
              <input
                type="text"
                name="pin"
                onChange={handleChange}
                className="border bg-gray-100 p-0 rounded w-full"
              />
            </label>

            <label className="col-span-1">
              Upload Photo (School Uniform)
              <input type="file" name="photo" onChange={handleChange} className="border bg-gray-100 p-1 rounded w-full" />
            </label>

            <div className="col-span-full flex justify-between">
              <BackButton />
              <button
                type="submit"
                className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
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

export default UdiseForm;
