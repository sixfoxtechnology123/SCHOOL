import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";

const StudentMaster = () => {
  const [studentData, setStudentData] = useState({
    studentId: "",
    name: "",
    className: "",
    section: "",
    rollNo: "",
    dob: "",
    fatherName: "",
    motherName: "",
    address: "",
    phoneNo: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [students, setStudents] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Convert Roman numeral to number
  const romanToNumber = (roman) => {
    const map = {
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      VI: 6,
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };
    return map[roman] || 0;
  };

  // Sort classes like Class-I, Class-II, Class-III
  const sortClasses = (classArray) => {
    return classArray.sort((a, b) => {
      const romanA = a.split("-")[1]?.trim();
      const romanB = b.split("-")[1]?.trim();
      return romanToNumber(romanA) - romanToNumber(romanB);
    });
  };

  // Fetch Classes
  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      const data = res.data || [];
      setClasses(data);

      // Extract unique class names and sort
      const unique = [...new Set(data.map((c) => c.className))];
      setUniqueClasses(sortClasses(unique));
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  // Fetch All Students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Fetch Next Student ID
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
    fetchClasses();
    fetchStudents();

    if (location.state?.studentItem) {
      const s = location.state.studentItem;
      setIsEditMode(true);
      setStudentData({ ...s, dob: s.dob?.slice(0, 10) });

      // Pre-fill sections if class is already selected
      const sec = classes
        .filter((c) => c.className === s.className)
        .map((c) => c.section);
      setFilteredSections(sec);
    } else {
      fetchNextStudentId();
      setIsEditMode(false);
    }
  }, [location.state]);

  // When class changes → filter its sections
  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    setStudentData({ ...studentData, className: selectedClass, section: "" });

    const sec = classes
      .filter((c) => c.className === selectedClass)
      .map((c) => c.section);
    setFilteredSections(sec);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDuplicate = students.some(
      (s) =>
        s.className === studentData.className &&
        s.section === studentData.section &&
        s.rollNo.toString() === studentData.rollNo.toString() &&
        (!isEditMode || s._id !== studentData._id)
    );

    if (isDuplicate) {
      alert("❌ A student with the same Class, Section, and Roll No already exists!");
      return;
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/students/${studentData._id}`,
          studentData
        );
        alert("Student updated successfully!");
        navigate("/StudentList", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/students", studentData);
        alert("Student saved successfully!");
        fetchNextStudentId();
        fetchStudents();
        setStudentData({
          studentId: "",
          name: "",
          className: "",
          section: "",
          rollNo: "",
          dob: "",
          fatherName: "",
          motherName: "",
          address: "",
          phoneNo: "",
        });
        navigate("/StudentList", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving student");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Student" : "Student"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <label className="flex flex-col text-sm font-semibold text-black">
            Student ID
            <input
              type="text"
              name="studentId"
              value={studentData.studentId}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Name
            <input
              type="text"
              name="name"
              value={studentData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Class
            <select
              name="className"
              value={studentData.className}
              onChange={handleClassChange}
              className="border border-gray-400 p-1 rounded"
              required
            >
              <option value="">--Select Class--</option>
              {uniqueClasses.map((cls, idx) => (
                <option key={idx} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Section
            <select
              name="section"
              value={studentData.section}
              onChange={handleChange}
              className="border border-gray-400 p-1 rounded"
              required
              disabled={!studentData.className}
            >
              <option value="">--Select Section--</option>
              {filteredSections.map((sec, idx) => (
                <option key={idx} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Roll No
            <input
              type="number"
              name="rollNo"
              value={studentData.rollNo}
              onChange={handleChange}
              placeholder="Roll Number"
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Date of Birth
            <input
              type="date"
              name="dob"
              value={studentData.dob}
              onChange={handleChange}
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Father&apos;s Name
            <input
              type="text"
              name="fatherName"
              value={studentData.fatherName}
              onChange={handleChange}
              placeholder="Father's Name"
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black">
            Mother&apos;s Name
            <input
              type="text"
              name="motherName"
              value={studentData.motherName}
              onChange={handleChange}
              placeholder="Mother's Name"
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black sm:col-span-2 lg:col-span-2">
            Address
            <input
              type="text"
              name="address"
              value={studentData.address}
              onChange={handleChange}
              placeholder="Address"
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <label className="flex flex-col text-sm font-semibold text-black sm:col-span-2 lg:col-span-2">
            Phone No
            <input
              type="text"
              name="phoneNo"
              value={studentData.phoneNo}
              onChange={handleChange}
              placeholder="Parent Contact (10 digits)"
              pattern="[0-9]{10}"
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-between mt-4 ">
            <BackButton />
            <button
              type="submit"
              className={`px-6 py-1 rounded text-white ${
                isEditMode
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentMaster;
