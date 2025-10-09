import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "./Header";


const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // month is 0-based
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
const today = new Date().toISOString().split("T")[0];
const StudentMaster = () => {
  const [step, setStep] = useState(1);
  const [sameAddress, setSameAddress] = useState(false);
  const [studentData, setStudentData] = useState({
    studentId: "",
    academicSession: "",
    admissionDate: today,
    admitClass: "",
    transferFrom: "",
    section: "",
    rollNo: "",
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
    nationality: "INDIAN",
    languages: [],
    permanentAddress: { vill: "", po: "", block: "", pin: "", ps: "", dist: "" },
    currentAddress: { vill: "", po: "", block: "", pin: "", ps: "", dist: "" },
    transportRequired: "No",
    distanceFromSchool: "",
    emergencyContact: "",
    emergencyPerson: "",
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherNationality: "INDIAN",
    fatherQualification: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    motherEmail: "",
    motherNationality: "INDIAN",
    motherQualification: "",
    bpl: "No",
    bplNo: "",
    familyIncome: "",
    scholarshipForAdmissionFee: "",
    scholarshipForSessionFee: "",
    remarksOfOtherPhoto: "",

  });

  const [classList, setClassList] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const studentItem = location.state?.studentItem;
  const [academicSessions, setAcademicSessions] = useState([]);
 const [admissionType, setAdmissionType] = useState("new admission"); // "new" or "readmission"


  // --- Fetch academic sessions ---
  const fetchAcademicSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/academics");
      setAcademicSessions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch students ---
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // --- Fetch next student ID ---
  const fetchNextStudentId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students/latest");
      const nextId = res.data?.studentId || "G0101";
      setStudentData((prev) => ({ ...prev, studentId: nextId }));
    } catch (err) {
      console.error("Error getting student ID:", err);
    }
  };

  // --- Fetch class list ---
  const fetchClassList = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes/unique/classes");
      setClassList(res.data || []);
    } catch (err) {
      console.error("Error fetching class list:", err);
    }
  };

  // --- Fetch sections ---
  const fetchSections = async (className) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/classes/sections/${encodeURIComponent(className)}`
      );
      setSections(res.data || []);
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

useEffect(() => {
  if (admissionType === "new admission") {
    // Generate next studentId for new admission
    const fetchNextStudentId = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/students/latest");
        const nextId = res.data?.studentId || "G0101";
        setStudentData(prev => ({ ...prev, studentId: nextId }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchNextStudentId();
  } else {
    // For re-admission, clear the field so user can enter manually
    setStudentData(prev => ({ ...prev, studentId: "" }));
  }
}, [admissionType]);



  // --- Initialize page ---
  useEffect(() => {
    fetchClassList();
    fetchStudents();
    fetchAcademicSessions();

    if (studentItem) {
      const normalizedLanguages = (studentItem.languages || []).map((l) => l.toUpperCase());
      const savedSession = localStorage.getItem("selectedAcademicSession") || studentItem.academicSession || "";

      setStudentData({
        ...studentItem,
        languages: normalizedLanguages,
        academicSession: savedSession,
        transferFrom: studentItem.admitClass === "Class - I" ? "" : studentItem.transferFrom || "",
      });

      setIsEditMode(true);

      if (studentItem.admitClass) {
        fetchSections(studentItem.admitClass);
      }
    } else {
      fetchNextStudentId();
    }

    const savedSession = localStorage.getItem("selectedAcademicSession") || "";
    if (savedSession) {
      setStudentData(prev => ({ ...prev, academicSession: savedSession }));
    }
    // eslint-disable-next-line
  }, []);

  // --- Handle form changes ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "language") {
      setStudentData((prev) => {
        let updated = [...prev.languages];
        if (checked) updated.push(value.toUpperCase());
        else updated = updated.filter((lang) => lang !== value.toUpperCase());
        return { ...prev, languages: updated };
      });
    } else if (e.target.tagName === "SELECT") {
      setStudentData({ ...studentData, [name]: value });
    } else {
      setStudentData({ ...studentData, [name]: value.toUpperCase() });
    }
  };

  const handleSameAddress = (e) => {
    const checked = e.target.checked;
    setSameAddress(checked);
    if (checked) {
      setStudentData((prev) => ({ ...prev, currentAddress: { ...prev.permanentAddress } }));
    } else {
      setStudentData((prev) => ({
        ...prev,
        currentAddress: { vill: "", po: "", block: "", pin: "", ps: "", dist: "" },
      }));
    }
  };

  const handleAddressChange = (e, type) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [name]: value.toUpperCase() },
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const val = value.toUpperCase();
    setStudentData((prev) => ({
      ...prev,
      languages: checked
        ? [...prev.languages, val]
        : prev.languages.filter((lang) => lang !== val),
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

//  Activity saving logic (same as AcademicSessionMaster)
const saveActivity = (action) => {
  const newActivity = {
    id: Date.now(),
    text: action,
    timestamp: new Date(),
  };

  const stored = JSON.parse(localStorage.getItem("activities") || "[]");
  const updated = [newActivity, ...stored];
  localStorage.setItem("activities", JSON.stringify(updated));

  window.dispatchEvent(
    new CustomEvent("newActivity", { detail: { action } })
  );
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isEditMode) {
      await axios.put(
        `http://localhost:5000/api/students/${studentData._id}`,
        studentData
      );
      saveActivity(`Updated Student ${studentData.firstName} ${studentData.lastName}`);
    } else {
      await axios.post("http://localhost:5000/api/students", studentData);
      saveActivity(`Added new Student ${studentData.firstName} ${studentData.lastName}`);
    }
    navigate("/student-list");
  } catch (error) {
    console.error("Error saving student:", error);
  }
};

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-3">
        <Header />
        <div className="p-2 bg-white shadow-md rounded-md">
          <div className="flex justify-between items-center mb-2 ">
            <h2 className="text-xl sm:text-xl font-bold text-center text-white bg-gray-800 py-1 px-3 rounded flex-1">
              {step === 1
                ? "Child Information"
                : step === 2
                ? "Family Information"
                : "Photo Upload"}
            </h2>

            {/* <div className="flex gap-2 ml-2">
            <Link
                to="/IdCardForm"
                // state={{ studentId: studentData.studentId }}
                state={{ studentData }
                className={`px-3 py-1 rounded text-white ${
                  studentData._id ? "bg-green-700 hover:bg-green-900" : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!studentData._id} // disables the button if student not saved
              >
                ID Card
              </Link> 
              <Link
                to="/IdCardForm"
                state={{ studentData }} // send whole object
                className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-900"
              >
                ID Card
              </Link>

            <Link
              to="/UdiseForm"
              state={{ studentData }} // pass studentId
              className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-900"
            >
              UDISE
            </Link>
          </div> */}

          </div>

          {step === 1 && (
            <form onSubmit={handleNext} className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <label>
                    Admission Type
                    <select
                      name="admissionType"
                      value={admissionType}
                      onChange={(e) => setAdmissionType(e.target.value)}
                      className="border bg-gray-100 p-0 rounded w-full"
                    >
                      <option value="new admission">New Admission</option>
                      <option value="re-admission">Re-Admission</option>
                    </select>

                  </label>
                               <label>
                  Academic Session
                  <select
                  className="border bg-gray-100 p-0 rounded w-full"
                    name="academicSession"
                    value={studentData.academicSession}
                    onChange={handleChange}
                    required
                  >
                    <option value="">--Select Academic Session--</option>
                    {academicSessions.map((session) => (
                      <option key={session._id} value={session.year}>
                        {session.year}
                      </option>
                    ))}
                  </select>
                  
                </label>
                
           <label>
              Student ID
            <input
              name="studentId"
              value={studentData.studentId}
              readOnly={admissionType === "new admission"} // only read-only for new admission
              onChange={(e) => {
                if (admissionType === "re-admission") {
                  setStudentData(prev => ({ ...prev, studentId: e.target.value.toUpperCase() }));
                }
              }}
              className={`border p-0 rounded w-full ${
                admissionType === "new admission" ? "bg-gray-200" : "bg-white"
              }`}/>
      </label>

              <label>Admission Date
              <input
                type="text"
                name="admissionDate"
                value={formatDate(studentData.admissionDate)} // DD-MM-YYYY
                readOnly
                className="border bg-gray-100 p-0 rounded w-full cursor-not-allowed"
              />
            </label>
           {/* Admit Class */}
              <label>
                Admit Class
                <select
                  name="admitClass"
                  value={studentData.admitClass}
                  onChange={async (e) => {
                    const selectedClass = e.target.value;

                    // Update student data
                    setStudentData((prev) => ({
                      ...prev,
                      admitClass: selectedClass,
                      section: "",
                      rollNo: "",
                      transferFrom: selectedClass === "Class - I" ? "" : prev.transferFrom || "",
                    }));

                    // Fetch sections if class is not Class - I
                  if (selectedClass) {
                  try {
                    const res = await axios.get(
                      `http://localhost:5000/api/classes/sections/${encodeURIComponent(selectedClass)}`
                    );
                    setSections(res.data || []); // always set sections
                  } catch (err) {
                    console.error("Error fetching sections:", err);
                    setSections([]);
                  }
                } else {
                  setSections([]);
                }

                  }}
                  className="border bg-gray-100 p-0 rounded w-full"
                >
                  <option value="">--Select Class--</option>
                  {classList.map((cls, index) => (
                    <option key={index} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </label>

              {/* Transfer From: only if class is not Class - I */}
              {studentData.admitClass !== "Class - I" && (
                <label>
                  Transfer From
                  <input
                    type="text"
                    name="transferFrom"
                    placeholder="Previous School Name"
                    value={studentData.transferFrom}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
              )}

              {/* Section */}
              <label>
                Section
                <select
                  name="section"
                  value={studentData.section}
                  onChange={async (e) => {
                    const selectedSection = e.target.value;
                    const selectedClass = studentData.admitClass;

                    setStudentData((prev) => ({
                      ...prev,
                      section: selectedSection,
                      rollNo: "",
                    }));

                    // Generate roll number if class & section selected and either new or changed
                    if (
                      selectedClass &&
                      selectedSection &&
                      (!isEditMode ||
                        selectedClass !== studentItem?.admitClass ||
                        selectedSection !== studentItem?.section)
                    ) {
                      try {
                        const res = await axios.get(
                          `http://localhost:5000/api/students/next-roll/${encodeURIComponent(selectedClass)}/${encodeURIComponent(selectedSection)}`
                        );
                        setStudentData((prev) => ({
                          ...prev,
                          rollNo: res.data.rollNo.toString(),
                        }));
                      } catch (err) {
                        console.error("Error fetching next roll:", err);
                      }
                    }
                  }}
                  className="border bg-gray-100 p-0 rounded w-full"
                >
                  <option value="">--Select Section--</option>
                  {sections.map((sec, index) => (
                    <option key={index} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </label>

              {/* Roll No */}
              <label>
                Roll No
                <input
                  name="rollNo"
                  value={studentData.rollNo || ""}
                  readOnly
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>

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
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHERS">Others</option>
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
                    <option value="GN">GN</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
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
              <label>
                Nationality
                <input
                  name="nationality"
                  value={studentData.nationality}
                  onChange={handleChange}
                  className="border bg-gray-100 p-0 rounded w-full"
                />
              </label>
             <div>
              <p>Languages Known</p>
              <label className="mr-1">
                <input
                  type="checkbox"
                  name="language"
                  value="English"
                  checked={studentData.languages.includes("ENGLISH")}
                  onChange={handleCheckboxChange}
                />{" "}
                English
              </label>
              <label className="mr-1">
                <input
                  type="checkbox"
                  name="language"
                  value="Bengali"
                  checked={studentData.languages.includes("BENGALI")}
                  onChange={handleCheckboxChange}
                />{" "}
                Bengali
              </label>
              <label>
                <input
                  type="checkbox"
                  name="language"
                  value="Hindi"
                  checked={studentData.languages.includes("HINDI")}
                  onChange={handleCheckboxChange}
                />{" "}
                Hindi
              </label>

            </div>

            </div>

          {/* Permanent Address */}
          <div>
            <p className="pl-4 font-bold mb-2 text-white bg-gray-800 py-0 rounded">Permanent Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
              {["vill", "po", "block", "pin", "ps", "dist"].map((field) => (
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
            </div>
          </div>


              {/* Current Address */}
            <div>
              <div className="pl-4 flex items-center font-semibold rounded gap-8 bg-gray-800 text-white">
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
                {["vill", "po", "block", "pin", "ps", "dist"].map((field) => (
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
              </div>
            </div>


              {/* bold line after current address */}
              <hr className="border-2 border-gray-800 my-3" />

              {/* School Transport */}
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
                {studentData.transportRequired === "Yes" && (
                  <label>
                    Distance From School (km)
                    <input
                      name="distanceFromSchool"
                      value={studentData.distanceFromSchool}
                      onChange={handleChange}
                      className="border bg-gray-100 p-0 rounded w-full"
                    />
                  </label>
                )}
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

                <label>
                    Scholarship(Admission Fee)
                    <input
                      name="scholarshipForAdmissionFee"
                      value={studentData.scholarshipForAdmissionFee}
                      onChange={handleChange}
                      className="border bg-gray-100 p-0 rounded w-full"
                    />
                  </label>

                  <label>
                    Scholarship(Session Fee)
                    <input
                      name="scholarshipForSessionFee"
                      value={studentData.scholarshipForSessionFee}
                      onChange={handleChange}
                      className="border bg-gray-100 p-0 rounded w-full"
                    />
                  </label>

              </div>

              <div className="col-span-full flex justify-between mt-4">
                <BackButton />
                <button
                  type="submit"
                  className="px-6 py-0 rounded text-white font-semibold bg-gray-800 hover:bg-gray-950 whitespace-nowrap"
                >
                  Save & Next
                </button>
              </div>
            </form>
          )}

          {/* --------- STEP 2 --------- */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <label>
                  Father's Name
                  <input
                    name="fatherName"
                    value={studentData.fatherName}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Father's Occupation
                  <input
                    name="fatherOccupation"
                    value={studentData.fatherOccupation}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Father's Phone
                  <input
                    name="fatherPhone"
                    value={studentData.fatherPhone}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Father's Email
                  <input
                    name="fatherEmail"
                    value={studentData.fatherEmail}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Father's Nationality
                  <input
                    name="fatherNationality"
                    value={studentData.fatherNationality}
                    readOnly
                    className="border bg-gray-200 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Father's Qualification
                  <input
                    name="fatherQualification"
                    value={studentData.fatherQualification}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Mother's Name
                  <input
                    name="motherName"
                    value={studentData.motherName}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Mother's Occupation
                  <input
                    name="motherOccupation"
                    value={studentData.motherOccupation}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Mother's Phone
                  <input
                    name="motherPhone"
                    value={studentData.motherPhone}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Mother's Email
                  <input
                    name="motherEmail"
                    value={studentData.motherEmail}
                    onChange={handleChange}
                    className="border bg-gray-100 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Mother's Nationality
                  <input
                    name="motherNationality"
                    value={studentData.motherNationality}
                    readOnly
                    className="border bg-gray-200 p-0 rounded w-full"
                  />
                </label>
                <label>
                  Mother's Qualification
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
                {studentData.bpl === "Yes" && (
                  <label>
                    BPL No
                    <input
                      name="bplNo"
                      value={studentData.bplNo}
                      onChange={handleChange}
                      className="border bg-gray-100 p-0 rounded w-full"
                    />
                  </label>
                )}
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
                  className="inline-flex items-center gap-2 bg-blue-700 font-semibo
                  
                  ld text-white
                  px-3 py-1 sm:px-4 sm:py-1
                  text-sm sm:text-base
                  rounded-lg shadow hover:bg-blue-800 transition"
                >
                  Back
                </button>
             <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-0 rounded text-white font-semibold bg-gray-800 hover:bg-gray-950 whitespace-nowrap"
            >
              Save & Next
            </button>
              </div>
            </form>
          )}

           {/* --------- STEP 3 --------- */}
          {step === 3 && (
        <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData();

              // Merge admissionType into studentData
              const dataToSend = { ...studentData, admissionType };

              // Append files if selected
              if (e.target.fatherPhoto.files[0])
                formData.append("fatherPhoto", e.target.fatherPhoto.files[0]);
              if (e.target.motherPhoto.files[0])
                formData.append("motherPhoto", e.target.motherPhoto.files[0]);
              if (e.target.childPhoto.files[0])
                formData.append("childPhoto", e.target.childPhoto.files[0]);
              if (e.target.otherDocument.files[0])
                formData.append("otherDocument", e.target.otherDocument.files[0]);

              // Append all studentData fields to formData
              Object.keys(dataToSend).forEach((key) => {
                if (key === "languages") {
                  dataToSend.languages.forEach((lang) =>
                    formData.append("languages[]", lang)
                  );
                } else if (key === "permanentAddress" || key === "currentAddress") {
                  Object.keys(dataToSend[key]).forEach((sub) => {
                    formData.append(`${key}[${sub}]`, dataToSend[key][sub]);
                  });
                } else {
                  formData.append(key, dataToSend[key]);
                }
              });

              // Activity logging
              const saveActivity = (action) => {
                const newActivity = {
                  id: Date.now(),
                  text: action,
                  timestamp: new Date(),
                };
                const stored = JSON.parse(localStorage.getItem("activities") || "[]");
                const updated = [newActivity, ...stored];
                localStorage.setItem("activities", JSON.stringify(updated));
                window.dispatchEvent(
                  new CustomEvent("newActivity", { detail: { action } })
                );
              };

              try {
                if (isEditMode) {
                  await axios.put(
                    `http://localhost:5000/api/students/${studentData._id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                  );
                  saveActivity(`Updated Student ${studentData.firstName} ${studentData.lastName}`);
                  alert("Student updated successfully!");
                } else {
                  await axios.post("http://localhost:5000/api/students", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  saveActivity(`Added new Student ${studentData.firstName} ${studentData.lastName}`);
                  alert("Student and Photos saved successfully!");
                }
                navigate("/StudentList", { replace: true });
              } catch (err) {
                console.error("Error saving student with photos:", err);
                alert("Failed to save student");
              }
            }}
              className="grid grid-cols-1 gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label>
                  Affix Photo of Father
                  <input
                    type="file"
                    name="fatherPhoto"
                    accept="image/*"
                    className="border bg-gray-100 p-1 rounded w-full"
                    // required={!isEditMode}
                  />
                </label>
                <label>
                  Affix Photo of Mother
                  <input
                    type="file"
                    name="motherPhoto"
                    accept="image/*"
                    className="border bg-gray-100 p-1 rounded w-full"
                    // required={!isEditMode}
                  />
                </label>
                <label>
                  Affix Photo of Child
                  <input
                    type="file"
                    name="childPhoto"
                    accept="image/*"
                    className="border bg-gray-100 p-1 rounded w-full"
                    // required={!isEditMode}
                  />
                </label>

                <label>
                  Other Document
                  <input
                    type="file"
                    name="otherDocument"
                    accept=".pdf,.doc,.docx,.jpg,.png"  // any allowed file types
                    className="border bg-gray-100 p-1 rounded w-full"
                  />
                </label>
                <label>
                    Remarks of Other Photo
                    <input
                      name="remarksOfOtherPhoto"
                      value={studentData.remarksOfOtherPhoto}
                      onChange={handleChange}
                      className="border bg-gray-100 p-1 rounded w-full"
                    />
                  </label>

              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-0 bg-blue-700 text-white rounded hover:bg-blue-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`px-6 py-0 rounded text-white font-semibold ${
                    isEditMode
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isEditMode ? "Update" : "Submit"}
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

