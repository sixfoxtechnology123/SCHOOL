import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";

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
    paymentMode: "Cash",
    transactionId: "",
    cardNumber: "",
    remarks: "",
    user: localStorage.getItem("userId") || "admin",
  });

  const [previousPending, setPreviousPending] = useState('');
  const [currentFee, setCurrentFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [amountPaid, setAmountPaid] = useState("");
  const [pendingAmount, setPendingAmount] = useState(0);
  const [netPayable, setNetPayable] = useState(0);


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
  const [lateFine, setLateFine] = useState(' ');
  const [totalPaid, setTotalPaid] = useState(0);


  const [paymentStatus, setPaymentStatus] = useState("Full Payment");
    // --- Fee Heads State ---
const [selectedFeeHeads, setSelectedFeeHeads] = useState([]);
const [isOtherSelected, setIsOtherSelected] = useState(false);
const [otherName, setOtherName] = useState("");
const [otherAmount, setOtherAmount] = useState('');
const [studentScholarships, setStudentScholarships] = useState({
  admission: 0,
  session: 0
});

useEffect(() => {
  const paid = Number(amountPaid || 0);
  const fine = Number(lateFine || 0);
  const disc = Number(discount || 0);

  const totalPaidWithFine = paid + fine;
  setTotalPaid(totalPaidWithFine);

  // Net payable = total fee (currentFee + previousPending) + lateFine - discount
  const totalFee = previousPending + currentFee + fine;
  setNetPayable(totalFee - disc);
  setPendingAmount(totalFee - disc - totalPaidWithFine);
}, [amountPaid, lateFine, discount, currentFee, previousPending]);






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
      const stuOpts = studentsData.map((s) => {
        const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
        return {
          value: s._id,
         label: `${fullName || s.studentName || "Unnamed"} - ${s.studentId || ""} - ${s.admissionNo || ""}`,

          admitClass: s.admitClass,
          section: s.section,
          rollNo: s.rollNo,
          transportRequired: s.transportRequired,
          distanceFromSchool: s.distanceFromSchool || 0,
          academicSession: s.academicSession || "",
          fullData: s ,
        };
      });

      const classData = Array.from(new Set((classRes.data || []).filter(Boolean))).sort();
      const classOpts = classData.map((c) => ({ value: c, label: c }));

      const sectionsData = sectionRes.data || [];
      const secOpts = sectionsData.map((s) => ({
        value: s.section,
        label: s.section,
        className: s.className,
      }));

      setStudents(studentsData);
      setStudentOptions(stuOpts);
      setInitialStudentOptions(stuOpts);

      setClassOptions(classOpts);
      setSections(sectionsData);
      setSectionOptions(secOpts);
      setInitialSectionOptions(secOpts);

      setFeeHeads(fhRes.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/transport/routes");
      const routeList = res.data.map((r) => {
        let minKm = 0, maxKm = 0;
        if (r.distance.includes("-")) {
          const [minStr, maxStr] = r.distance.split("-");
          minKm = Number(minStr.trim());
          maxKm = Number(maxStr.trim());
        } else {
          minKm = maxKm = Number(r.distance.trim());
        }
        return {
          routeId: r.routeId,
          distance: r.distance,
          vanCharge: r.vanCharge || 0,
          label: r.distance,
          minKm,
          maxKm,
        };
      });
      setRoutes(routeList);
      setShowRouteDropdown(routeList.length > 0);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setRoutes([]);
      setShowRouteDropdown(false);
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
    await fetchRoutes();       // fetch transport routes first
    await fetchDropdownData(); // then fetch students
    await fetchNextPaymentId();
  };
  init();
}, []);


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
    // reset
    setPaymentData({
      paymentId: "",
      date: new Date().toISOString().split("T")[0],
      student: "",
      admitClass: "",
      section: "",
      rollNo: "",
      feeDetails: [],
      totalAmount: 0,
      paymentMode: paymentData.paymentMode,
      transactionId: "",
      cardNumber: "",
      remarks: "",
      user: paymentData.user,
    });
    setPreviousPending(0);
    setCurrentFee(0);
    setNetPayable(0);
    setAmountPaid(0);
    setPendingAmount(0);
    setSelectedRoute("");
    setStudentScholarships({ admission: 0, session: 0 });
    setFeeHeads([]);
    setSelectedFeeHeads([]);
    return;
  }

  const stu = initialStudentOptions.find(s => s.value === selected.value);
  if (!stu) return;

  // set basic data
  setPaymentData(prev => ({
    ...prev,
    student: stu.value,
    rollNo: stu.rollNo,
    admitClass: stu.admitClass,
    section: stu.section,
    academicSession: stu.academicSession,
    feeDetails: [],         // keep empty: user must select manually
    totalAmount: 0,
  }));

  // previous pending
  let prevPending = 0;
  try {
    const res = await axios.get(`http://localhost:5000/api/payments/pending/${stu.value}`);
    prevPending = res.data?.previousPending || 0;
    setPreviousPending(prevPending);
  } catch (err) {
    console.error("Error fetching previous pending:", err);
    setPreviousPending(0);
  }

  // scholarships (fetch, store)
  let scholarships = { admission: 0, session: 0 };
  try {
    const admissionNo = stu.admissionNo || stu.label.split("-").pop().trim();
    if (admissionNo) {
      const schRes = await axios.get(`http://localhost:5000/api/payments/scholarships/${admissionNo}`);
      const schData = schRes.data || {};
      scholarships = {
        admission: Number(schData.scholarshipForAdmissionFee || 0),
        session: Number(schData.scholarshipForSessionFee || 0),
      };
      setStudentScholarships(scholarships);
    }
  } catch (err) {
    console.error("Error fetching scholarships:", err);
    setStudentScholarships({ admission: 0, session: 0 });
  }

  // fetch fee heads and build "options" that contain BOTH originalAmount and amount (already reduced)
  try {
    const feesRes = await axios.get("http://localhost:5000/api/payments/class-fees", {
      params: { className: stu.admitClass, academicSession: stu.academicSession },
    });

    const feeHeadOptions = (feesRes.data || []).map(fh => {
      const orig = Number(fh.amount || 0);
      let reduced = orig;
      const name = (fh.feeHeadName || "").toLowerCase();
      if (name.includes("admission")) reduced = orig - (scholarships.admission || 0);
      else if (name.includes("session")) reduced = orig - (scholarships.session || 0);

      // make sure reduced never goes negative
      if (reduced < 0) reduced = 0;

      return {
        feeHead: fh.feeHeadName,
        originalAmount: orig,
        amount: reduced,       // scholarship applied ONCE here
      };
    });

    // set options for select but do NOT mark them selected
    setFeeHeads(feeHeadOptions);
    setSelectedFeeHeads([]);            // no selection
    setPaymentData(prev => ({ ...prev, feeDetails: [] })); // user will populate feeDetails via handleFeeHeadChange

    // reset totals
    setCurrentFee(0);
    setNetPayable(0);
    setPendingAmount(prevPending); // show previous pending if you want
  } catch (err) {
    console.error("Error fetching fee heads:", err);
  }
};

const handleFeeHeadChange = (selectedHeads) => {
  const selected = selectedHeads || [];
  setSelectedFeeHeads(selected);

  setPaymentData(prev => {
    const updated = [];

    selected.forEach(sh => {
      const feeOpt = feeHeads.find(f => f.feeHead === sh.value);
      if (!feeOpt) return;

      // If already exists, preserve values; otherwise, default Full Payment
      const existing = prev.feeDetails.find(fd => fd.feeHead === feeOpt.feeHead);

      const isFullPayment = existing?.paymentStatus === "Full Payment" || !existing;

      updated.push({
        feeHead: feeOpt.feeHead,
        originalAmount: feeOpt.originalAmount,
        amount: feeOpt.amount,
        paymentStatus: isFullPayment ? "Full Payment" : existing.paymentStatus,
        amountPaid: isFullPayment ? feeOpt.amount : existing?.amountPaid ?? 0, // ✅ full amount if full payment
        pendingAmount: isFullPayment ? 0 : existing?.pendingAmount ?? feeOpt.amount, // ✅ pending 0 if full payment
        lateFine: existing?.lateFine ?? 0,
        otherName: existing?.otherName || ""
      });
    });

    recalcTotals(updated); // recalc totals based on new selection

    return { ...prev, feeDetails: updated, totalAmount: updated.reduce((s, f) => s + Number(f.amount || 0), 0) };
  });
};


// ===== Payment Status Change =====
const handleFeeHeadPaymentStatusChange = (feeHead, status) => {
  setPaymentData(prev => {
    const updatedFeeDetails = prev.feeDetails.map(f => {
      if (f.feeHead === feeHead) {
        if (status === "Full Payment") {
          return { ...f, paymentStatus: status, amountPaid: f.amount, pendingAmount: 0 };
        } else {
          return { ...f, paymentStatus: status, amountPaid: 0, pendingAmount: f.amount };
        }
      }
      return f;
    });

    // Recalculate totals
    recalcTotals(updatedFeeDetails);

    return { ...prev, feeDetails: updatedFeeDetails };
  });
};

// ===== Amount Paid Change (for Pending) =====
const handleFeeHeadAmountPaidChange = (feeHead, val) => {
  setPaymentData(prev => {
    const updatedFeeDetails = prev.feeDetails.map(f => {
      if (f.feeHead === feeHead) {
        const paid = Number(val || 0);
        const pending = f.amount - paid;
        return { ...f, amountPaid: paid, pendingAmount: pending };
      }
      return f;
    });

    recalcTotals(updatedFeeDetails);

    return { ...prev, feeDetails: updatedFeeDetails };
  });
};

// ===== Other Fee Change =====
const handleOtherFeeChange = (name, val) => {
  setOtherName(name);
  setOtherAmount(Number(val || 0));

  setPaymentData(prev => {
    const updated = prev.feeDetails.map(f =>
      f.feeHead === "Other" ? { ...f, otherName: name, amount: Number(val || 0), amountPaid: Number(val || 0), pendingAmount: 0 } : f
    );

    recalcTotals(updated);
    return { ...prev, feeDetails: updated };
  });
};

const recalcTotals = (feeDetails) => {
  if (!feeDetails || feeDetails.length === 0) {
    setCurrentFee(0);
    setTotalPaid(0);
    setPendingAmount(0);
    setNetPayable(0);
    setPaymentData(prev => ({ ...prev, totalAmount: 0, feeDetails: [] }));
    return;
  }

  // Total of fee heads
  const totalFeeHeads = feeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // Total actually paid (amountPaid + lateFine)
  const currentFee = feeDetails.reduce((sum, f) => sum + Number(f.amountPaid || 0), 0);
  const totalPaidWithFine = currentFee + Number(lateFine || 0);

  const pending = totalFeeHeads + Number(lateFine || 0) - totalPaidWithFine;
  const net = totalFeeHeads + Number(lateFine || 0) - Number(discount || 0);

  setCurrentFee(currentFee);
  setTotalPaid(totalPaidWithFine);
  setPendingAmount(pending);
  setNetPayable(net);

  setPaymentData(prev => ({
    ...prev,
    totalAmount: totalFeeHeads,
    feeDetails: feeDetails,
    netPayable: net
  }));
};





  const handleRouteChange = async (routeId) => {
    const selectedRouteObj = routes.find((r) => r.routeId === routeId);
    const updatedFeeDetails = paymentData.feeDetails.map(f => {
     if ((f.feeHead || "").toLowerCase() === "transport")
 {
        return {
          ...f,
          amount: selectedRouteObj?.vanCharge || f.amount,
          distance: selectedRouteObj?.label || "",
          routeId: routeId,
        };
      }
      return f;
    });

    const total = updatedFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    setPaymentData(prev => ({ ...prev, feeDetails: updatedFeeDetails, totalAmount: total }));
  };

  const handleAmountChange = (feeHead, value) => {
    const updatedFeeDetails = paymentData.feeDetails.map((f) =>
      f.feeHead === feeHead ? { ...f, amount: Number(value) } : f
    );
    const total = updatedFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    setPaymentData((prev) => ({ ...prev, feeDetails: updatedFeeDetails, totalAmount: total }));

    if (paymentStatus === "Pending") {
      const remaining = total - Number(amountPaid || 0);
      setPendingAmount(remaining > 0 ? remaining : 0);
    } else {
      setAmountPaid(total);
      setPendingAmount(0);
    }
  };

//  Replace your old handleChange function with this:
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "discount") {
    const discountValue = parseFloat(value) || 0;
    const totalValue = parseFloat(paymentData.totalAmount) || 0;

    const newNetPayable = totalValue - discountValue;
    setDiscount(discountValue);
    setNetPayable(newNetPayable);

    setPaymentData((prev) => ({
      ...prev,
      discount: discountValue,
      netPayable: newNetPayable,
    }));
  } else {
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (["UPI", "NetBanking"].includes(paymentData.paymentMode) && !paymentData.transactionId) {
    toast.error("Transaction ID required for this payment mode!");
    return;
  }
  if (paymentData.paymentMode === "Card" && !paymentData.cardNumber) {
    toast.error("Card Number required for Card payment!");
    return;
  }

  try {
    // Fee details including late fine per fee head
    const feeDetailsForBackend = (paymentData.feeDetails || []).map(f => ({
      feeHead: f.feeHead,
      originalAmount: Number(f.originalAmount || 0),
      amount: Number(f.amount || 0),
      amountPaid: Number(f.amountPaid || 0),
      pendingAmount: Number(f.pendingAmount || 0),
      paymentStatus: f.paymentStatus || "Full Payment",
      lateFine: Number(f.lateFine || 0),
      otherName: f.otherName || "",
    }));

    const payload = {
      student: paymentData.student,
      rollNo: paymentData.rollNo,
      admitClass: paymentData.admitClass,
      section: paymentData.section,
      academicSession: paymentData.academicSession,
      feeDetails: feeDetailsForBackend,
      previousPending: Number(previousPending || 0),
      currentFee: Number(currentFee || 0),           // use frontend state
      totalAmount: Number(paymentData.totalAmount || 0), // use frontend state
      discount: Number(discount || 0),
      netPayable: Number(netPayable || 0),           // use frontend state
      amountPaid: Number(totalPaid || 0),            // use frontend state
      pendingAmount: Number(pendingAmount || 0),     // use frontend state
      paymentStatus,
      paymentMode: paymentData.paymentMode,
      transactionId: paymentData.transactionId || "",
      cardNumber: paymentData.cardNumber || "",
      remarks: paymentData.remarks || "",
      user: paymentData.user || localStorage.getItem("userId") || "admin",
      lateFine: Number(lateFine || 0),               // overall late fine
    };

    if (isEditMode) {
      await axios.put(`http://localhost:5000/api/payments/${paymentData._id}`, payload);
      toast.success("Receipt updated successfully!");
    } else {
      await axios.post("http://localhost:5000/api/payments", payload);
      toast.success("Receipt saved successfully!");
      await fetchNextPaymentId();
    }

    navigate("/PaymentsList", { replace: true });
  } catch (err) {
    console.error("Save failed:", err);
    toast.error("Error saving receipt. Check console.");
  }
};





  return (
    <div className="min-h-screen bg-zinc-300 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-2 w-full m-2">
        <h2 className="text-xl font-bold mb-2 text-center text-black">
          {isEditMode ? "Update Receipt" : "Student Receipt"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Payment Id */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Payment Id
            <input
              type="text"
              name="paymentId"
              value={paymentData.paymentId}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
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

                {/* Academic Session */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Academic Session
            <input
              type="text"
              name="academicSession"
              value={paymentData.academicSession || ""}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
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
              className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
            />
          </label>

    

{/* ================== Fee Heads ================== */}
<label className="flex flex-col text-sm font-semibold text-black col-span-2 mb-2">
  Fee Heads
  <Select
    isMulti
    options={[
      ...feeHeads.map((fh) => ({ value: fh.feeHead, label: fh.feeHead })),
      { value: "Other", label: "Other" },
    ]}
    onChange={(selected) => {
      handleFeeHeadChange(selected);
      const hasOther = selected.some((s) => s.value === "Other");
      setIsOtherSelected(hasOther);

      setPaymentData((prev) => {
        let updated = prev.feeDetails.filter((f) => f.feeHead !== "Other");
        if (hasOther) {
          updated.push({
            feeHead: "Other",
            otherName: otherName || "",
            amount: otherAmount || 0,
          });
        }
        return { ...prev, feeDetails: updated };
      });
    }}
    value={paymentData.feeDetails.map((f) =>
      f.feeHead === "Other" ? { value: "Other", label: "Other" } : { value: f.feeHead, label: f.feeHead }
    )}
    placeholder="Select Fee Heads..."
    isSearchable
    className="mb-2"
  />
</label>

{/* ================== Other Fields (Vertical) ================== */}
{isOtherSelected && (
  <div className="flex flex-col gap-2 mb-4">
    {/* Other Name */}
    <label className="flex flex-col text-sm font-semibold text-black">
      Other Name
      <input
        type="text"
        value={otherName}
        onChange={(e) => handleOtherFeeChange("name", e.target.value)}
        placeholder="Enter other fee name"
        className="border border-gray-400 p-1 rounded"
      />
    </label>

    {/* Other Amount */}
    <label className="flex flex-col text-sm font-semibold text-black">
      Other Amount
      <input
        type="number"
        value={otherAmount}
        onChange={(e) => handleOtherFeeChange("amount", e.target.value)}
        placeholder="Enter other amount"
        className="border border-gray-400 p-1 rounded"
      />
    </label>
  </div>
)}







     {paymentData.feeDetails.some(f => (f.feeHead || "").toLowerCase() === "transport") && (

        <label className="flex flex-col text-sm font-semibold text-black">
          Distance (KM)
          <input
            type="number"
            value={initialStudentOptions.find(s => s.value === paymentData.student)?.distanceFromSchool || ""}
            readOnly
            className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
          />
        </label>
      )}



         
{paymentData.feeDetails.map((f) => (
  <div key={f.feeHead} className="col-span-1">
    {/* Fee Amount */}
    <label className="flex flex-col text-sm font-semibold text-black">
      {f.feeHead} Amount
      <input
        type="number"
        value={f.amount}
        readOnly
        className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
      />
    </label>

    {/* Payment Status */}
    <label className="flex flex-col text-sm font-semibold text-black mt-1">
      {f.feeHead} Payment Status
      <select
        value={f.paymentStatus}
        onChange={(e) => handleFeeHeadPaymentStatusChange(f.feeHead, e.target.value)}
        className="border border-gray-400 p-1 rounded"
      >
        <option value="Full Payment">Full Payment</option>
        <option value="Pending">Pending</option>
      </select>
    </label>

    {/* Show only if Pending */}
    {f.paymentStatus === "Pending" && (
      <>
        <label className="flex flex-col text-sm font-semibold text-black mt-1">
          {f.feeHead} Amount Paid
          <input
            type="text"
            value={f.amountPaid === 0 ? "" : String(f.amountPaid)}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val))
                handleFeeHeadAmountPaidChange(f.feeHead, val === "" ? 0 : Number(val));
            }}
            className="border border-gray-400 p-1 rounded"
            placeholder="Enter paid amount"
          />
        </label>

        <label className="flex flex-col text-sm font-semibold text-black mt-1">
          {f.feeHead} Pending Amount
          <input
            type="number"
            value={f.pendingAmount}
            readOnly
            className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
          />
        </label>
      </>
    )}
  </div>
))}



          {/* If status is Full Payment show read-only paid and pending=0 */}
          {/* {f.paymentStatus === "Full Payment" && (
            <>
              <label className="flex flex-col text-sm font-semibold text-black mt-1">
                {f.feeHead} Amount Paid
                <input
                  type="number"
                  value={f.amountPaid}
                  readOnly
                  className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
                />
              </label>
              <label className="flex flex-col text-sm font-semibold text-black mt-1">
                {f.feeHead} Pending Amount
                <input
                  type="number"
                  value={0}
                  readOnly
                  className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
                />
              </label>
            </>
          )}
        </div>
      ))} */}


         {/* Previous Pending */}
      {/* <label className="flex flex-col text-sm font-semibold text-black">
        Previous Pending
        <input
          type="number"
          value={previousPending}
          readOnly
          className="border border-gray-400 p-1 rounded bg-gray-100"
        />
      </label> */}

      {/* Current Fee */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Current Fee
        <input
          type="number"
          value={currentFee}
          readOnly
          onChange={(e) => {
            const val = Number(e.target.value || '');
            setCurrentFee(val);

            // recalc net payable and pending
            const total = previousPending + val;
            setNetPayable(total - Number(discount));
            setPendingAmount(total - Number(discount) - Number(amountPaid));
          }}
          className="border border-gray-400 p-1 rounded cursor-not-allowed"
        />
      </label>


<label className="flex flex-col text-sm font-semibold text-black">
  Late Fine
  <input
    type="number"
    value={lateFine}
    onChange={(e) => setLateFine(Number(e.target.value) || 0)}

    className="border border-gray-400 p-1 rounded"
    placeholder="Enter Late Fine"
  />
</label>


      {/* Total Amount */}
      <label className="flex flex-col text-sm font-semibold text-black">
        Total Fee
        <input
          type="number"
          value={Number(previousPending || 0) + Number(currentFee || 0) + Number(lateFine || 0)}
          readOnly
          className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
        />

      </label>

     {/* Discount */}
<label className="flex flex-col text-sm font-semibold text-black">
  Discount
  <input
    type="number"
    value={discount} // blank default
    onChange={(e) => {
      const val = e.target.value === "" ? "" : Number(e.target.value);
      setDiscount(val);

      const disc = val === "" ? 0 : Number(val);
      const totalPayable = previousPending + currentFee + (lateFine || 0); // include late fine if needed
      setNetPayable(totalPayable - disc);
      setPendingAmount(totalPayable - disc - Number(amountPaid || 0));
    }}
    className="border border-gray-400 p-1 rounded"
    placeholder="Enter Discount"
  />
</label>


<label className="flex flex-col text-sm font-semibold text-black">
  Net Payable
  <input
    type="number"
    value={netPayable}  //  use the state, not paymentData.netPayable
    readOnly
    className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
  />
</label>






          {/* ===== PAYMENT STATUS DROPDOWN =====
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

        Amount Paid & Pending Amount (only if Pending)
        {paymentStatus === "Pending" && (
          <>
            <label className="flex flex-col text-sm font-semibold text-black">
              Amount Paid
             <input
                type="text" 
                value={amountPaid}
                onChange={(e) => {
                  const val = e.target.value;

                  Allow only numbers or empty
                  if (/^\d*$/.test(val)) {
                    setAmountPaid(val); 
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
        )} */}


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
            <label className="flex flex-col text-sm  font-semibold text-black">
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
          <label className="flex flex-col text-sm font-semibold text-black ">
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
              className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
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