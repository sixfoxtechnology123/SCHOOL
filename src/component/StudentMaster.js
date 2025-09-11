import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate } from "react-router-dom";
import Sidebar from '../component/Sidebar';
import Header from "./Header";


const StudentMaster = () => {
  const [step, setStep] = useState(1);
  const [sameAddress, setSameAddress] = useState(false);

  const [studentData, setStudentData] = useState({
    // ----- Page 1: Child Info -----
    studentId: "",
    firstName: "",
    lastName: "",
    gender: "",
    socialCaste: "",
    dob: "",
    height: "",
    weight: "",
    bloodGroup: "",
    brothers: "",
    sisters: "",
    nationality: "Indian",
    languages: [],
    permanentAddress: {
      vill: "",
      po: "",
      block: "",
      pin: "",
      ps: "",
      dist: "",
    },
    currentAddress: {
      vill: "",
      po: "",
      block: "",
      pin: "",
      ps: "",
      dist: "",
    },
    transportRequired: "No",
    distanceFromSchool: "",
    emergencyContact: "",
    emergencyPerson: "",

    // ----- Page 2: Family Info -----
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherQualification: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    motherEmail: "",
    motherQualification: "",
    bpl: "No",
    bplNo: "",
    familyIncome: "",
  });

  const [students, setStudents] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchNextStudentId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students/latest");
      const nextId = res.data?.studentId || "ST0001";
      setStudentData((prev) => ({ ...prev, studentId: nextId }));
    } catch (err) {
      console.error("Error getting student ID:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchNextStudentId();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "language") {
      setStudentData((prev) => {
        let updated = [...prev.languages];
        if (checked) updated.push(value);
        else updated = updated.filter((lang) => lang !== value);
        return { ...prev, languages: updated };
      });
    } else {
      setStudentData({ ...studentData, [name]: value });
    }
  };

  const handleAddressChange = (e, type) => {
    const { name, value } = e.target;
    setStudentData({
      ...studentData,
      [type]: { ...studentData[type], [name]: value },
    });
  };

  const handleSameAddress = (e) => {
    const checked = e.target.checked;
    setSameAddress(checked);
    if (checked) {
      setStudentData((prev) => ({
        ...prev,
        currentAddress: { ...prev.permanentAddress },
      }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/students/${studentData._id}`,
          studentData
        );
        alert("Student updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/students", studentData);
        alert("Student saved successfully!");
      }
      navigate("/StudentList", { replace: true });
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving student");
    }
  };

  return (
   <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
      <div className="flex-1 overflow-y-auto p-3">
        {/*  Added Header */}
        <Header/>
      <div className="p-2 bg-white shadow-md rounded-md">
        <h2 className="text-xl sm:text-xl font-bold mb-2 text-center text-white bg-gray-800 py-1 rounded">
          {step === 1 ? "Information of the Child" : "Family Information"}
        </h2>

        {/* --------- STEP 1 --------- */}
        {step === 1 && (
          <form onSubmit={handleNext} className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                First Name
                <input
                  name="firstName"
                  value={studentData.firstName}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Last Name
                <input
                  name="lastName"
                  value={studentData.lastName}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Gender
                <select
                  name="gender"
                  value={studentData.gender}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                >
                  <option value="">--Select--</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Others</option>
                </select>
              </label>
              <label>
                Social Caste
                <select
                  name="socialCaste"
                  value={studentData.socialCaste}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                >
                  <option value="">--Select--</option>
                  <option>GN</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>OBC</option>
                </select>
              </label>
              <label>
                Date of Birth
                <input
                  type="date"
                  name="dob"
                  value={studentData.dob}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                Height
                <input
                  name="height"
                  value={studentData.height}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Weight
                <input
                  name="weight"
                  value={studentData.weight}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Blood Group
                <input
                  name="bloodGroup"
                  value={studentData.bloodGroup}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                No. of Brothers
                <input
                  name="brothers"
                  value={studentData.brothers}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                No. of Sisters
                <input
                  name="sisters"
                  value={studentData.sisters}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                Nationality
                <input
                  name="nationality"
                  value={studentData.nationality}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <div className="col-span-4">
                <p>Languages Known</p>
                <label className="mr-4">
                  <input
                    type="checkbox"
                    name="language"
                    value="English"
                    checked={studentData.languages.includes("English")}
                    onChange={handleChange}
                  />{" "}
                  English
                </label>
                <label className="mr-4">
                  <input
                    type="checkbox"
                    name="language"
                    value="Bengali"
                    checked={studentData.languages.includes("Bengali")}
                    onChange={handleChange}
                  />{" "}
                  Bengali
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="language"
                    value="Hindi"
                    checked={studentData.languages.includes("Hindi")}
                    onChange={handleChange}
                  />{" "}
                  Hindi
                </label>
              </div>
            </div>

          {/* Permanent Address */}
          <div>
            <p className="pl-4 font-bold mb-2 text-white bg-gray-800 py-1 rounded">Permanent Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
              {["vill", "po", "block", "pin", "ps"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label>{field.toUpperCase()} -</label>
                  <input
                    
                    name={field}
                    value={studentData.permanentAddress[field]}
                    onChange={(e) => handleAddressChange(e, "permanentAddress")}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </div>
              ))}
              <div className="flex flex-col">
                <label>DIST -</label>
                <input
                      name="dist"
                  value={studentData.permanentAddress.dist}
                  onChange={(e) => handleAddressChange(e, "permanentAddress")}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div>
            <div className="pl-4 flex items-center font-semibold gap-8 bg-gray-800 text-white">
              <p>Current Address</p>
              <label>
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={handleSameAddress}
                />{" "}
                Same as Permanent
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
              {["vill", "po", "block", "pin", "ps"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label>{field.toUpperCase()} -</label>
                  <input
                    
                    name={field}
                    value={studentData.currentAddress[field]}
                    onChange={(e) => handleAddressChange(e, "currentAddress")}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </div>
              ))}
              <div className="flex flex-col">
                <label>DIST -</label>
                <input
                      name="dist"
                  value={studentData.currentAddress.dist}
                  onChange={(e) => handleAddressChange(e, "currentAddress")}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </div>
            </div>
          </div>


            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                School Transport
                <select
                  name="transportRequired"
                  value={studentData.transportRequired}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </label>
              <label>
                Distance From School (km)
                <input
                  name="distanceFromSchool"
                  value={studentData.distanceFromSchool}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Emergency Contact No
                <input
                  name="emergencyContact"
                  value={studentData.emergencyContact}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Name of Person
                <input
                  name="emergencyPerson"
                  value={studentData.emergencyPerson}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            </div>

            <div className="col-span-full flex justify-between mt-4">
              <BackButton />
              <button
                type="submit"
                className="px-6 py-1 rounded text-white font-semibold bg-gray-800 hover:bg-gray-950 whitespace-nowrap">
                Save & Next
              </button>
            </div>
          </form>
        )}

        {/* --------- STEP 2 --------- */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                Father Name
                <input
                  name="fatherName"
                  value={studentData.fatherName}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Father Occupation
                <input
                  name="fatherOccupation"
                  value={studentData.fatherOccupation}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Father Phone
                <input
                  name="fatherPhone"
                  value={studentData.fatherPhone}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Father Email
                <input
                  name="fatherEmail"
                  value={studentData.fatherEmail}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Father Qualification
                <input
                  name="fatherQualification"
                  value={studentData.fatherQualification}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                Mother Name
                <input
                  name="motherName"
                  value={studentData.motherName}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Mother Occupation
                <input
                  name="motherOccupation"
                  value={studentData.motherOccupation}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Mother Phone
                <input
                  name="motherPhone"
                  value={studentData.motherPhone}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Mother Email
                <input
                  name="motherEmail"
                  value={studentData.motherEmail}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Mother Qualification
                <input
                  name="motherQualification"
                  value={studentData.motherQualification}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <label>
                BPL
                <select
                  name="bpl"
                  value={studentData.bpl}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </label>
              <label>
                BPL No
                <input
                  name="bplNo"
                  value={studentData.bplNo}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
              <label>
                Total Family Income (Yearly)
                <input
                  name="familyIncome"
                  value={studentData.familyIncome}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
            </div>

            <div className="col-span-full flex font-semibold justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 bg-blue-700 font-semibold text-white
                  px-3 py-1 sm:px-4 sm:py-1
                  text-sm sm:text-base
                  rounded-lg shadow hover:bg-blue-800 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-1 rounded text-white bg-gray-800 hover:bg-gray-950 whitespace-nowrap">
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
};

export default StudentMaster;
