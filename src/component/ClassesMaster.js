// pages/ClassesMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ClassesMaster = () => {
  const [classData, setClassData] = useState({
    classId: "",
    className: "",
    section: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [incomingClass, setIncomingClass] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Auto-generate next Class ID
  const fetchNextClassId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes/latest");
      const nextId = res.data?.classId || "C01";
      setClassData((prev) => ({ ...prev, classId: nextId }));
    } catch (err) {
      console.error("Error getting class ID:", err);
    }
  };

  useEffect(() => {
    if (location.state?.classItem) {
      const c = location.state.classItem;
      setIncomingClass(c);
      setIsEditMode(true);
      setClassData({
        _id: c._id,
        classId: c.classId || "",
        className: c.className || "",
        section: c.section || "",
      });
    } else {
      fetchNextClassId();
      setIsEditMode(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData({ ...classData, [name]: value });
  };

  // --------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🔍 Validation: prevent same class + same section
      const res = await axios.get("http://localhost:5000/api/classes");
      const allClasses = res.data || [];

      const duplicate = allClasses.find(
        (c) =>
          c.className === classData.className &&
          c.section === classData.section &&
          (!isEditMode || c._id !== classData._id)
      );

      if (duplicate) {
        toast.success("This Class + Section already exists!");
        return;
      }

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/classes/${classData._id}`,
          classData
        );

        toast.success("Class updated successfully!");
        navigate("/ClassesList", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/classes", classData);

        toast.success("Class saved successfully!");
        const resNext = await axios.get("http://localhost:5000/api/classes/latest");
        setClassData({
          classId: resNext.data?.classId || "C01",
          className: "",
          section: "",
        });
        navigate("/ClassesList", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err);
      toast.success("Error saving class");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Class" : "Class"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* Class ID */}
          <div>
            <label className="block font-medium">Class ID</label>
            <input
              type="text"
              name="classId"
              value={classData.classId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* Class Name */}
          <div>
            <label className="block font-medium">Class Name</label>
            <select
              name="className"
              value={classData.className}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              {[
                "Class - I",
                "Class - II",
                "Class - III",
                "Class - IV",
                "Class - V",
                "Class - VI",
                "Class - VII",
                "Class - VIII",
                "Class - IX",
                "Class - X",
                "Class - XI",
                "Class - XII",
              ].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block font-medium">Section</label>
            <select
              name="section"
              value={classData.section}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">--Select--</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div className="flex justify-between">
            <BackButton />
            <button
              type="submit"
              className={`px-4 py-1 rounded text-white ${
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

export default ClassesMaster;
