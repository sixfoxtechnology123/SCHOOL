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
const [formData, setFormData] = useState({});

const [previousPending, setPreviousPending] = useState(0); // new
const [currentFee, setCurrentFee] = useState(0);           // new
const [discount, setDiscount] = useState('');               // new
const [netPayable, setNetPayable] = useState(0);           // new

  const [classes, setClasses] = useState([]); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("");

  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  const [initialSectionOptions, setInitialSectionOptions] = useState([]);
  const [initialStudentOptions, setInitialStudentOptions] = useState([]);

  // ===== NEW STATE FOR PAYMENT STATUS FEATURE =====
  const [paymentStatus, setPaymentStatus] = useState("Full Payment"); // default
  const [amountPaid, setAmountPaid] = useState("");
  const [pendingAmount, setPendingAmount] = useState(0);

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

      const stuOpts = studentsData.map((s) => {
        const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
        return {
          value: s._id,
          label: `${fullName || s.studentName || "Unnamed"} - ${s.studentId || ""}`,
          admitClass: s.admitClass,
          section: s.section,
          rollNo: s.rollNo,
          transport: s.transport,
          distance: s.distance || 0,
        };
      });

      setStudentOptions(stuOpts);
      setInitialStudentOptions(stuOpts);

      const classData = Array.from(new Set((classRes.data || []).filter(Boolean))).sort();
      const classOpts = classData.map((c) => ({ value: c, label: c }));
      setClassOptions(classOpts);

      const sectionsData = sectionRes.data || [];
      setSections(sectionsData);
      const secOpts = sectionsData.map((s) => ({
        value: s.section,
        label: s.section,
        className: s.className,
      }));
      setSectionOptions(secOpts);
      setInitialSectionOptions(secOpts);

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
    try {
      // --- Fetch all dropdown data ---
      const [stuRes, classRes, sectionRes, fhRes, routeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/payments/students"),
        axios.get("http://localhost:5000/api/payments/classes"),
        axios.get("http://localhost:5000/api/payments/sections"),
        axios.get("http://localhost:5000/api/feeheads"),
        axios.get("http://localhost:5000/api/fees/transport/routes"),
      ]);

      const studentsData = stuRes.data || [];
      const classData = Array.from(new Set((classRes.data || []).filter(Boolean))).sort();
      const sectionsData = sectionRes.data || [];
      const feeHeadsData = fhRes.data || [];
      const routeList = routeRes.data || [];

      // --- Prepare options ---
      const stuOpts = studentsData.map((s) => {
        const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
        return {
          value: s._id,
          label: `${fullName || s.studentName || "Unnamed"} - ${s.studentId || ""}`,
          admitClass: s.admitClass,
          section: s.section,
          rollNo: s.rollNo,
          transportRequired: s.transportRequired,
          distanceFromSchool: s.distanceFromSchool,
        };
      });

      const classOpts = classData.map((c) => ({ value: c, label: c }));
      const secOpts = sectionsData.map((s) => ({
        value: s.section,
        label: s.section,
        className: s.className,
      }));

      const routeOpts = routeList.map((r) => ({
        routeId: r.routeId,
        distance: r.distance || 0,
        vanCharge: r.vanCharge || 0,
        label: r.distance.toString().includes("KM") ? r.distance : `${r.distance} KM`,
      }));

      // --- Set states ---
      setStudents(studentsData);
      setStudentOptions(stuOpts);
      setInitialStudentOptions(stuOpts);

      setClassOptions(classOpts);
      setSections(sectionsData);
      setSectionOptions(secOpts);
      setInitialSectionOptions(secOpts);

      setFeeHeads(feeHeadsData);
      setRoutes(routeOpts);
      setShowRouteDropdown(routeOpts.length > 0);

      // --- Edit mode prefill ---
      if (location.state?.paymentItem) {
        const p = location.state.paymentItem;
        setIsEditMode(true);

        // Prefill basic fields
        setPaymentData((prev) => ({
          ...prev,
          ...p,
          date: p.date?.slice(0, 10),
          user: p.user || localStorage.getItem("userId") || "admin",
          
        }));

        setPaymentStatus(p.paymentStatus || "Full Payment");
        setAmountPaid(p.amountPaid || p.totalAmount || 0);
        setPendingAmount(p.pendingAmount || 0);

        // Filter sections for class
        const filteredSections = secOpts.filter((s) => s.className === p.admitClass);
        setSectionOptions(filteredSections);

        // Filter students for class & section
        const filteredStudents = stuOpts.filter(
          (s) => s.admitClass === p.admitClass && s.section === p.section
        );
        setStudentOptions(filteredStudents);

        // Prefill student with ID only
     const selectedStudent = filteredStudents.find((s) => s.value === p.student);
if (selectedStudent) {
  const stu = students.find((s) => s._id === selectedStudent.value);
  const fullName = [stu?.firstName, stu?.lastName].filter(Boolean).join(" ");
  const displayName = `${fullName || stu?.studentName || "Unnamed"} (${stu?.studentId || ""})`;

  setPaymentData((prev) => ({
    ...prev,
    student: selectedStudent.value,   // keep ID for backend
    studentName: displayName,         // <-- add name for display
    admitClass: selectedStudent.admitClass,
    section: selectedStudent.section,
    rollNo: selectedStudent.rollNo,
  }));
}


        // Prefill transport route if exists
        const transportFee = p.feeDetails?.find(
          (f) => f.feeHead.toLowerCase() === "transport"
        );
        if (transportFee) {
          setSelectedRoute(transportFee.routeId || "");
          setShowRouteDropdown(true);
        }
      } else {
        // --- New Payment ---
        const res = await axios.get("http://localhost:5000/api/payments/latest");
        const nextId = res.data?.paymentId || "RECEIPT001";
        setPaymentData((prev) => ({ ...prev, paymentId: nextId }));
        setIsEditMode(false);
        setShowRouteDropdown(false);
        setSelectedRoute("");
      }
    } catch (err) {
      console.error("Error initializing form:", err);
    }
  };

  init();
}, [location.state]);






  // ===== Handlers (Class, Section, Student) =====
  const handleClassChange = (selected) => {
    if (!selected) {
      setPaymentData((prev) => ({ ...prev, admitClass: "", section: "", student: "", rollNo: "" }));
      setSectionOptions(initialSectionOptions);
      setStudentOptions(initialStudentOptions);
      return;
    }

    const selectedClass = selected.value;
    setPaymentData((prev) => ({ ...prev, admitClass: selectedClass, section: "", student: "", rollNo: "" }));

    const filteredSections = initialSectionOptions.filter(s => s.className === selectedClass);
    setSectionOptions(filteredSections);

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
const handleStudentChange = async (selected) => {
  if (!selected) {
    setPaymentData((prev) => ({ ...prev, student: "", rollNo: "" }));
    setPreviousPending(0);
    setCurrentFee(0);
    setNetPayable(0);
    setAmountPaid("");
    setPendingAmount(0);
    return;
  }

  const stu = initialStudentOptions.find((s) => s.value === selected.value);
  if (!stu) return;

  setPaymentData((prev) => ({
    ...prev,
    student: stu.value,
    rollNo: stu.rollNo,
    admitClass: stu.admitClass,
    section: stu.section,
  }));

  try {
    const res = await axios.get(
      `http://localhost:5000/api/payments/pending/${stu.value}`
    );

    console.log("Previous Pending:", res.data.pendingAmount); // <-- Add here

    const pending = Number(res.data?.pendingAmount || 0);
    setPreviousPending(pending);

    const totalPayable = pending + Number(currentFee);
    const discountValue = Number(discount || 0);
    const paid = Number(amountPaid || 0);
    setNetPayable(totalPayable - discountValue);
    setPendingAmount(totalPayable - discountValue - paid);

  } catch (err) {
    console.error("Error fetching previous pending:", err);
    setPreviousPending(0);
    const totalPayable = Number(currentFee);
    setNetPayable(totalPayable - Number(discount || 0));
    setPendingAmount(totalPayable - Number(discount || 0) - Number(amountPaid || 0));
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

  // ===== handleFeeHeadChange =====
const handleFeeHeadChange = async (selected) => {
  const newHeads = selected || [];
  const hasTransport = newHeads.some(
    (fh) => fh.value.toLowerCase() === "transport"
  );

  // Filter out existing transport fee details
  const otherFeeHeads = paymentData.feeDetails.filter(
    (f) => f.feeHead.toLowerCase() !== "transport"
  );

  let transportDetail = null;

  if (hasTransport) {
    const routeList = await fetchRoutes();
    const stuOpts = students.map((s) => ({
      value: s._id,
      transportRequired: s.transportRequired,
      distanceFromSchool: s.distanceFromSchool,
    }));

    const student = stuOpts.find((s) => s.value === paymentData.student);

    if (student?.transportRequired === "Yes" && student.distanceFromSchool) {
      const km = Number(student.distanceFromSchool);

      const autoRoute = routeList.find((r) => {
        const [min, max] = r.label
          .replace("KM", "")
          .split("-")
          .map((n) => parseInt(n.trim()));
        return km >= min && km <= max;
      });

      if (autoRoute) {
        const amount = await fetchAmount(
          paymentData.admitClass,
          "Transport",
          autoRoute.routeId
        );

        transportDetail = {
          feeHead: "Transport",
          amount,
          routeId: autoRoute.routeId,
          distance: autoRoute.label,
        };

        setSelectedRoute(autoRoute.routeId);
        setShowRouteDropdown(true);
      } else {
        setShowRouteDropdown(true);
      }
    } else {
      setShowRouteDropdown(true);
    }
  } else {
    setShowRouteDropdown(false);
    setRoutes([]);
    setSelectedRoute("");
  }

  // Prepare final fee details
  const finalFeeDetails = await Promise.all(
    newHeads.map(async (fh) => {
      if (fh.value.toLowerCase() === "transport") {
        return transportDetail || { feeHead: "Transport", amount: 0, routeId: "" };
      } else {
        const existing = otherFeeHeads.find((f) => f.feeHead === fh.value);
        if (existing) return existing;

        const amount = await fetchAmount(paymentData.admitClass, fh.value);
        return { feeHead: fh.value, amount };
      }
    })
  );

  // --- Calculate total of selected fee heads ---
  const total = finalFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // --- Update current fee ---
  setCurrentFee(total);

  // --- Recalculate net payable and pending amount ---
  const totalPayable = Number(previousPending) + total;
  setNetPayable(totalPayable - Number(discount));
  setPendingAmount(totalPayable - Number(discount) - Number(amountPaid || 0));

  // --- Update paymentData ---
  setPaymentData((prev) => ({
    ...prev,
    feeDetails: finalFeeDetails,
    totalAmount: total,
  }));

  // --- Optional: If payment is fully done, adjust amountPaid/pending ---
  if (paymentStatus !== "Pending") {
    setAmountPaid(total);
    setPendingAmount(0);
  }
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

    // Update pending amount
    if (paymentStatus === "Pending") {
      const remaining = total - Number(amountPaid || 0);
      setPendingAmount(remaining > 0 ? remaining : 0);
    } else {
      setAmountPaid(total);
      setPendingAmount(0);
    }
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
    //  Don’t overwrite feeDetails amount with 0
    const updatedFeeDetails = paymentData.feeDetails.map((f) => ({
      ...f,
      amount: f.amount || 0, // keep existing amount
    }));

    //  Calculate total again
    const total = updatedFeeDetails.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0
    );

  const submissionData = {
  ...paymentData,
  previousPending,
  currentFee,
  totalAmount: previousPending + currentFee,
  discount,
  netPayable,
  amountPaid,
  pendingAmount,
  feeDetails: paymentData.feeDetails,
  paymentStatus,
};


    if (isEditMode) {
      await axios.put(
        `http://localhost:5000/api/payments/${paymentData._id}`,
        submissionData
      );
      alert("Receipt updated successfully!");
      navigate("/PaymentsList", { replace: true });
    } else {
      await axios.post("http://localhost:5000/api/payments", submissionData);
      alert("Receipt saved successfully!");
      await fetchNextPaymentId();

      // reset form
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
      setPaymentStatus("Full Payment");
      setAmountPaid(0);
      setPendingAmount(0);
      navigate("/PaymentsList", { replace: true });
    }
  } catch (err) {
    console.error("Save failed:", err);
    alert("Error saving receipt. Check console.");
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
          {isEditMode ? (
            <input
              type="text"
              name="student"
              value={paymentData.studentName || ""}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          ) : (
            <Select
              options={studentOptions}
              onChange={handleStudentChange}
              value={studentOptions.find((s) => s.value === paymentData.student) || null}
              placeholder="Search Student..."
              isSearchable
              isClearable
            />
          )}



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
                disabled
                value={selectedRoute || ""}
                onChange={async (e) => {
                  setSelectedRoute(e.target.value); // keep state in sync
                  await handleRouteChange(e.target.value);
                }}
                className="border border-gray-400 p-1 rounded cursor-not-allowed"
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

         {/* Previous Pending */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Previous Pending
        <input
          type="number"
          value={previousPending}
          readOnly
          className="border border-gray-400 p-1 rounded bg-gray-100"
        />
      </label>

      {/* Current Fee */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Current Fee
        <input
          type="number"
          value={currentFee}
          onChange={(e) => {
            const val = Number(e.target.value || 0);
            setCurrentFee(val);

            // recalc net payable and pending
            const total = previousPending + val;
            setNetPayable(total - Number(discount));
            setPendingAmount(total - Number(discount) - Number(amountPaid));
          }}
          className="border border-gray-400 p-1 rounded"
        />
      </label>

      {/* Total Amount */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Total Fee
        <input
          type="number"
          value={previousPending + currentFee}
          readOnly
          className="border border-gray-400 p-1 rounded bg-gray-100"
        />

      </label>

      {/* Discount */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Discount
        <input
          type="number"
          value={discount}
         onChange={(e) => {
          const val = Number(e.target.value || '');
          setDiscount(val);

          const totalPayable = previousPending + currentFee;
          setNetPayable(totalPayable - val);
          setPendingAmount(totalPayable - val - Number(amountPaid || ''));
        }}

          className="border border-gray-400 p-1 rounded"
        />
      </label>

      {/* Net Payable */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Net Payable
        <input
          type="number"
          value={netPayable}
          readOnly
          className="border border-gray-400 p-1 rounded bg-gray-100"
        />
      </label>




          {/* ===== PAYMENT STATUS DROPDOWN ===== */}
        <label className="flex flex-col text-sm font-semibold text-black">
          Payment Status
          <select
            name="paymentStatus"
            value={paymentStatus}
            onChange={(e) => {
              const val = e.target.value;
              setPaymentStatus(val);

              if (val === "Full Payment") {
                setAmountPaid("");
                setPendingAmount(0);
              } else {
                setAmountPaid("");
                setPendingAmount(paymentData.totalAmount);
              }
            }}
            className="border border-gray-400 p-1 rounded"
          >
            <option value="Full Payment">Full Payment</option>
            <option value="Pending">Pending</option>
          </select>
        </label>

        {/* Amount Paid & Pending Amount (only if Pending) */}
        {paymentStatus === "Pending" && (
          <>
            <label className="flex flex-col text-sm font-semibold text-black">
              Amount Paid
             <input
                type="text" // change from number to text
                value={amountPaid}
                onChange={(e) => {
                  const val = e.target.value;

                  // Allow only numbers or empty
                  if (/^\d*$/.test(val)) {
                    setAmountPaid(val); // keep as string
                    const paid = val === "" ? 0 : Number(val);

                    const pending = (paymentData.totalAmount || 0) - paid;
                    setPendingAmount(pending > 0 ? pending : 0);
                  }
                }}
                className="border border-gray-400 p-1 rounded"
                placeholder="Enter paid amount"
              />

            </label>

            <label className="flex flex-col text-sm font-semibold text-black">
              Pending Amount
              <input
                type="number"
                value={netPayable-amountPaid}
                readOnly
                className="border border-gray-400 p-1 rounded cursor-not-allowed"
              />
            </label>
          </>
        )}


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

