import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

const PaymentsMaster = () => {
  const [paymentData, setPaymentData] = useState({
    paymentId: "",
    date: new Date().toISOString().split("T")[0],
    student: "",
    admitClass: "",
    section: "",
    rollNo: "",
    feeDetails: [],
    totalAmount: 0,
    paymentMode: "",
    transactionId: "",
    cardNumber: "",
    remarks: "",
    user: localStorage.getItem("userId") || "admin",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);

  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  const [initialSectionOptions, setInitialSectionOptions] = useState([]);
  const [initialStudentOptions, setInitialStudentOptions] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

 // ===== Fetch dropdown data =====
const fetchDropdownData = async () => {
  try {
    const [stuRes, classRes, sectionRes, fhRes] = await Promise.all([
      axios.get("http://localhost:5000/api/payments/students"),
      axios.get("http://localhost:5000/api/payments/classes"),
      axios.get("http://localhost:5000/api/payments/sections"),
      axios.get("http://localhost:5000/api/feeheads"),
    ]);

    const studentsData = stuRes.data || [];
    setStudents(studentsData);

    // Build student options
    const stuOpts = studentsData.map((s) => {
      const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
      return {
        value: s._id,
        label: `${fullName || s.studentName || "Unnamed"} - ${s.studentId || ""}`,
        admitClass: s.admitClass,
        section: s.section,
        rollNo: s.rollNo,
      };
    });
    setStudentOptions(stuOpts);
    setInitialStudentOptions(stuOpts);

    // Classes
    const classData = Array.from(new Set((classRes.data || []).filter(Boolean))).sort();
    const classOpts = classData.map((c) => ({ value: c, label: c }));
    setClassOptions(classOpts);

    // Sections
    const sectionsData = sectionRes.data || [];
    setSections(sectionsData);
    const secOpts = sectionsData.map((s) => ({
      value: s.section,
      label: s.section,
      className: s.className, // important for filtering by class
    }));
    setSectionOptions(secOpts);
    setInitialSectionOptions(secOpts);

    // Fee Heads
    setFeeHeads(fhRes.data || []);

    return { studentsData, classData, sectionsData };
  } catch (err) {
    console.error("Error fetching dropdown data:", err);
    return { studentsData: [], classData: [], sectionsData: [] };
  }
};


  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/transport/routes");
      const routeList = res.data.map((r) => ({
        routeId: r.routeId,
        distance: r.distance || 0,
        vanCharge: r.vanCharge || 0,
        label: r.distance.toString().includes("KM") ? r.distance : `${r.distance} KM`,
      }));
      setRoutes(routeList);
      setShowRouteDropdown(routeList.length > 0);
      return routeList;
    } catch (err) {
      console.error(err);
      setRoutes([]);
      setShowRouteDropdown(false);
      return [];
    }
  };

  const fetchNextPaymentId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments/latest");
      const nextId = res.data?.paymentId || "RECEIPT001";
      setPaymentData((prev) => ({ ...prev, paymentId: nextId }));
    } catch (err) {
      console.error("Error getting paymentId:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { studentsData, sectionsData } = await fetchDropdownData();

      if (location.state?.paymentItem) {
        const p = location.state.paymentItem;
        setIsEditMode(true);
        setPaymentData({
          ...p,
          date: p.date?.slice(0, 10),
          user: p.user || localStorage.getItem("userId") || "admin",
        });

        if (p.admitClass) {
          const filteredSections = sectionsData
            .filter((s) => s.className === p.admitClass)
            .map((s) => ({ value: s.section, label: s.section, className: s.className }));
          setSectionOptions(filteredSections);
        }

        if (p.admitClass && p.section) {
          const filteredStudents = studentsData
            .filter((s) => s.admitClass === p.admitClass && s.section === p.section)
            .map((s) => {
              const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
              return {
                value: s._id,
                label: `${fullName || s.studentName || "Unnamed"} - ${s.studentId || ""}`,
                admitClass: s.admitClass,
                section: s.section,
                rollNo: s.rollNo,
              };
            });
          setStudentOptions(filteredStudents);
        }
      } else {
        await fetchNextPaymentId();
        setIsEditMode(false);
      }
    };
    init();
  }, [location.state]);

  // ===== Handlers =====
 const handleClassChange = (selected) => {
  if (!selected) {
    setPaymentData((prev) => ({ ...prev, admitClass: "", section: "", student: "", rollNo: "" }));
    setSectionOptions(initialSectionOptions);
    setStudentOptions(initialStudentOptions);
    return;
  }

  const selectedClass = selected.value;
  setPaymentData((prev) => ({ ...prev, admitClass: selectedClass, section: "", student: "", rollNo: "" }));

  // Filter sections by class
  const filteredSections = initialSectionOptions.filter(s => s.className === selectedClass);
  setSectionOptions(filteredSections);

  // Filter students by class
  const filteredStudents = initialStudentOptions.filter(s => s.admitClass === selectedClass);
  setStudentOptions(filteredStudents);
};

 const handleSectionChange = (selected) => {
  if (!selected) {
    setPaymentData((prev) => ({ ...prev, section: "", student: "", rollNo: "" }));
    const filteredStudents = initialStudentOptions.filter(s => s.admitClass === paymentData.admitClass);
    setStudentOptions(filteredStudents);
    return;
  }

  const selectedSection = selected.value;
  setPaymentData((prev) => ({ ...prev, section: selectedSection, student: "", rollNo: "" }));

  const filteredStudents = initialStudentOptions.filter(
    s => s.admitClass === paymentData.admitClass && s.section === selectedSection
  );
  setStudentOptions(filteredStudents);
};

 const handleStudentChange = (selected) => {
  if (!selected) {
    setPaymentData((prev) => ({ ...prev, student: "", rollNo: "" }));
    return;
  }

  const stu = initialStudentOptions.find(s => s.value === selected.value);
  if (stu) {
    setPaymentData((prev) => ({
      ...prev,
      student: stu.value,
      rollNo: stu.rollNo,
      admitClass: stu.admitClass,
      section: stu.section,
    }));
  }
};

  const fetchAmount = async (admitClass, feeHeadName, routeId) => {
    if (!admitClass || !feeHeadName) return 0;
    try {
      const res = await axios.get("http://localhost:5000/api/payments/fee-amount", {
        params: { admitClass, feeHeadName, routeId: routeId || undefined },
      });
      return res.data?.amount || 0;
    } catch (err) {
      console.error("Error fetching fee amount:", err);
      return 0;
    }
  };

  const handleFeeHeadChange = async (selected) => {
    const newHeads = selected || [];
    const hasTransport = newHeads.some((fh) => fh.value.toLowerCase() === "transport");

    if (hasTransport) {
      await fetchRoutes();
    } else {
      setShowRouteDropdown(false);
      setRoutes([]);
    }

    const newFeeDetails = await Promise.all(
      newHeads.map(async (fh) => {
        if (fh.value.toLowerCase() === "transport") {
          const existingTransport = paymentData.feeDetails.find(
            (f) => f.feeHead.toLowerCase() === "transport"
          );
          return existingTransport
            ? existingTransport
            : { feeHead: fh.value, amount: 0, routeId: "" };
        } else {
          const existing = paymentData.feeDetails.find((f) => f.feeHead === fh.value);
          if (existing) {
            return existing;
          }
          const amount = await fetchAmount(paymentData.admitClass, fh.value);
          return { feeHead: fh.value, amount };
        }
      })
    );

    const total = newFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    setPaymentData((prev) => ({ ...prev, feeDetails: newFeeDetails, totalAmount: total }));
  };

 const handleRouteChange = async (routeId) => {
  const selectedRoute = routes.find((r) => r.routeId === routeId);
  const updatedFeeDetails = await Promise.all(
    paymentData.feeDetails.map(async (f) => {
      if (f.feeHead.toLowerCase() === "transport") {
        const amount = await fetchAmount(paymentData.admitClass, f.feeHead, routeId);
        return {
          ...f,
          amount,
          routeId,
          distance: selectedRoute?.label || "", // <-- ADD THIS
        };
      }
      return f;
    })
  );
  const total = updatedFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  setPaymentData((prev) => ({ ...prev, feeDetails: updatedFeeDetails, totalAmount: total }));
};


  const handleAmountChange = (feeHead, value) => {
    const updatedFeeDetails = paymentData.feeDetails.map((f) =>
      f.feeHead === feeHead ? { ...f, amount: Number(value) } : f
    );
    const total = updatedFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    setPaymentData((prev) => ({ ...prev, feeDetails: updatedFeeDetails, totalAmount: total }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      ["UPI", "NetBanking"].includes(paymentData.paymentMode) &&
      !paymentData.transactionId
    ) {
      alert("Transaction ID required for this payment mode!");
      return;
    }

    if (paymentData.paymentMode === "Card" && !paymentData.cardNumber) {
      alert("Card Number required for Card payment!");
      return;
    }

    try {
      const duplicateCheck = await axios.get(
        "http://localhost:5000/api/payments/check-duplicate",
        {
          params: {
            admitClass: paymentData.admitClass,
            section: paymentData.section,
            rollNo: paymentData.rollNo,
          },
        }
      );

      if (duplicateCheck.data.exists) {
        alert(
          `Receipt already exists for Class: ${paymentData.admitClass}, Section: ${paymentData.section}, Roll No: ${paymentData.rollNo}`
        );
        return;
      }

      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/payments/${paymentData._id}`,
          paymentData
        );
        alert("Receipt updated successfully!");
        navigate("/PaymentsList", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/payments", paymentData);
        alert("Receipt saved successfully!");
        await fetchNextPaymentId();
        setPaymentData({
          paymentId: "",
          date: new Date().toISOString().split("T")[0],
          student: "",
          admitClass: "",
          section: "",
          rollNo: "",
          feeDetails: [],
          totalAmount: 0,
          paymentMode: "",
          transactionId: "",
          cardNumber: "",
          remarks: "",
          user: localStorage.getItem("userId") || "admin",
        });
        setSectionOptions(initialSectionOptions);
        setStudentOptions(initialStudentOptions);
        navigate("/PaymentsList", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Error saving receipt");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Receipt" : "New Receipt"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Payment Id */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Payment Id
            <input
              type="text"
              name="paymentId"
              value={paymentData.paymentId}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Date */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Date
            <input
              type="date"
              name="date"
              value={paymentData.date}
              onChange={handleChange}
              className="border border-gray-400 p-1 rounded"
              required
            />
          </label>

      {/* Class */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Class
            <Select
              options={classOptions}
              onChange={handleClassChange}
              value={classOptions.find((c) => c.value === paymentData.admitClass) || null}
              placeholder="Select Class..."
              isClearable
            />
          </label>

          {/* Section */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Section
            <Select
              options={sectionOptions}
              onChange={handleSectionChange}
              value={sectionOptions.find((s) => s.value === paymentData.section) || null}
              placeholder="Select Section..."
              isClearable
            />
          </label>

          {/* Student */}
          <label className="flex flex-col text-sm font-semibold text-black col-span-2">
            Student
            <Select
              options={studentOptions}
              onChange={handleStudentChange}
              value={studentOptions.find((opt) => opt.value === paymentData.student) || null}
              placeholder="Search Student..."
              isSearchable
              isClearable
            />
          </label>
       
          {/* Roll No */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Roll No
            <input
              type="text"
              name="rollNo"
              value={paymentData.rollNo}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Fee Heads Multi-select */}
          <label className="flex flex-col text-sm font-semibold text-black col-span-2">
            Fee Heads
            <Select
              isMulti
              options={feeHeads.map((fh) => ({
                value: fh.feeHeadName,
                label: fh.feeHeadName,
              }))}
              onChange={handleFeeHeadChange}
              value={paymentData.feeDetails.map((f) => ({
                value: f.feeHead,
                label: f.feeHead,
              }))}
              placeholder="Select Fee Heads..."
              isSearchable
            />
          </label>

          {showRouteDropdown && (
            <label className="flex flex-col text-sm font-semibold text-black">
              Distance (KM)
              <select
                name="routeId"
                value={
                  paymentData.feeDetails.find(
                    (f) => f.feeHead.toLowerCase() === "transport"
                  )?.routeId || ""
                }
                onChange={async (e) => await handleRouteChange(e.target.value)}
                className="border border-gray-400 p-1 rounded"
              >
                <option value="">--Select Distance--</option>
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Amount per head */}
          {paymentData.feeDetails.map((f) => (
            <label
              key={f.feeHead}
              className="flex flex-col text-sm font-semibold text-black"
            >
              {f.feeHead} Amount
              <input
                type="number"
                readOnly
                value={f.amount}
                onChange={(e) => handleAmountChange(f.feeHead, e.target.value)}
                className="border border-gray-400 p-1 rounded cursor-not-allowed"
              />
            </label>
          ))}

          {/* Payment Mode */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Payment Mode
            <select
              name="paymentMode"
              value={paymentData.paymentMode}
              onChange={handleChange}
              className="border border-gray-400 p-1 rounded"
              required
            >
              <option value="">-- Select Mode --</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="NetBanking">Net Banking</option>
              <option value="No Payment">No Payment</option>
            </select>
          </label>

          {/* Transaction ID */}
          {["UPI", "NetBanking"].includes(paymentData.paymentMode) && (
            <label className="flex flex-col text-sm col-span-2 font-semibold text-black">
              Transaction ID
              <input
                type="text"
                name="transactionId"
                value={paymentData.transactionId}
                onChange={handleChange}
                placeholder="Txn ID / Ref No"
                className="border border-gray-400 p-1 rounded"
              />
            </label>
          )}

          {/* Card Number */}
          {paymentData.paymentMode === "Card" && (
            <label className="flex flex-col text-sm col-span-2 font-semibold text-black">
              Card Number
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleChange}
                placeholder="Enter Card Number"
                className="border border-gray-400 p-1 rounded"
              />
            </label>
          )}

          {/* Total Amount */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Total Amount
            <input
              type="number"
              name="totalAmount"
              value={paymentData.totalAmount}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Remarks */}
          <label className="flex flex-col text-sm font-semibold text-black col-span-2 lg:col-span-2">
            Remarks
            <input
              type="text"
              name="remarks"
              value={paymentData.remarks}
              onChange={handleChange}
              placeholder="Remarks"
              className="border border-gray-400 p-1 rounded"
            />
          </label>

          {/* Collected By */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Collected By
            <input
              type="text"
              name="user"
              value={paymentData.user}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

          {/* Buttons */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-between mt-4">
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

export default PaymentsMaster;
