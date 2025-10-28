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
  const [showPreviousPending, setShowPreviousPending] = useState(false);
  const [tuitionMonths, setTuitionMonths] = useState([]); 
  const [selectedMonth, setSelectedMonth] = useState(""); 
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
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingFeeHeads, setPendingFeeHeads] = useState([]);
  const [disableAdmissionSession, setDisableAdmissionSession] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Full Payment");
  const [selectedFeeHeads, setSelectedFeeHeads] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherAmount, setOtherAmount] = useState('');
  const [studentScholarships, setStudentScholarships] = useState({
    admission: 0,
    session: 0
  });
  const [usedMonths, setUsedMonths] = useState({ tuition: [], transport: [] });


useEffect(() => {
  const paid = Number(paymentData.amountPaid || 0);
  const fine = Number(lateFine || 0);
  const disc = Number(discount || 0);
  const totalFee = previousPending + currentFee + fine;
  const totalPaidWithFine = paid + fine;

  if (paymentData.paymentStatus === "Pending") {
    // Pending → net payable = amountPaid - discount
    const net = Math.max(paid - disc, 0);
    setNetPayable(net);
    setPendingAmount(totalFee - net);
  } else {
    // Full Payment → normal logic
    const net = totalFee - disc;
    setNetPayable(net);
    setPendingAmount(net - totalPaidWithFine);
  }

  setTotalPaid(totalPaidWithFine);
}, [
  paymentData.amountPaid,
  paymentData.paymentStatus,
  lateFine,
  discount,
  currentFee,
  previousPending,
]);




  const location = useLocation();
  const navigate = useNavigate();

const fetchDropdownData = async () => {
  try {
    const [stuRes, classRes, sectionRes, fhRes] = await Promise.all([
      axios.get("http://localhost:5000/api/payments/students"),
      axios.get("http://localhost:5000/api/payments/classes"),
      axios.get("http://localhost:5000/api/payments/sections"),
      axios.get("http://localhost:5000/api/feeheads"),
    ]);

    let studentsData = stuRes.data || [];

    // --- Sort students by latest (descending by _id) ---
    studentsData.sort((a, b) => (a._id < b._id ? 1 : -1));

    // ---Remove duplicates by studentId ---
    const uniqueStudents = [];
    const seenIds = new Set();
    studentsData.forEach(s => {
      if (!seenIds.has(s.studentId)) {
        uniqueStudents.push(s);
        seenIds.add(s.studentId);
      }
    });

    // ---  Map to dropdown options ---
    const stuOpts = uniqueStudents.map((s) => {
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
        fullData: s,
      };
    });

    // ---  Classes ---
    const classData = Array.from(new Set((classRes.data || []).filter(Boolean))).sort();
    const classOpts = classData.map((c) => ({ value: c, label: c }));

    // ---  Sections ---
    const sectionsData = sectionRes.data || [];
    const secOpts = sectionsData.map((s) => ({
      value: s.section,
      label: s.section,
      className: s.className,
    }));

    // ---  Set state ---
    setStudents(uniqueStudents);
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


// ======= Replace your existing handleStudentChange with this exact function =======
const handleStudentChange = async (selected) => {
  if (!selected) {
    setPaymentData({
      paymentId: "",
      date: new Date().toISOString().split("T")[0],
      student: "",
      studentName: "",
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
      prevPending: 0,
      admissionScholarshipApplied: false,
      sessionScholarshipApplied: false,
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
    setShowPreviousPending(false);
    setDisableAdmissionSession(false);
    return;
  }

  const stu = initialStudentOptions.find((s) => s.value === selected.value);
  if (!stu) return;

  const studentCode = stu.fullData.studentId || stu.student || stu.value;
  const studentName =
    [stu.fullData.firstName, stu.fullData.lastName].filter(Boolean).join(" ") ||
    stu.fullData.studentName;

  // Set basic student info immediately
  setPaymentData((prev) => ({
    ...prev,
    student: stu.value,
    studentName,
    rollNo: stu.rollNo,
    admitClass: stu.admitClass,
    section: stu.section,
    academicSession: stu.academicSession,
    feeDetails: [],
    totalAmount: 0,
  }));

  // 1) fetch latest-payment-flags and keep them in local vars so we don't rely on async setState
  let admissionApplied = false;
  let sessionApplied = false;
  try {
   const res = await axios.get(
  `http://localhost:5000/api/payments/latest-payment-flags/${studentCode}`,
  { params: { academicSession: stu.academicSession } } //  send session
);

    admissionApplied = !!res.data?.admissionScholarshipApplied;
    sessionApplied = !!res.data?.sessionScholarshipApplied;

    // set into state so UI / submit payload have correct values
    setPaymentData((prev) => ({
      ...prev,
      admissionScholarshipApplied: admissionApplied,
      sessionScholarshipApplied: sessionApplied,
    }));

    // disable toggle (optional)
    setDisableAdmissionSession(admissionApplied || sessionApplied);
  } catch (err) {
    console.error("Error checking scholarship flags:", err);
    admissionApplied = false;
    sessionApplied = false;
    setPaymentData((prev) => ({
      ...prev,
      admissionScholarshipApplied: false,
      sessionScholarshipApplied: false,
    }));
    setDisableAdmissionSession(false);
  }

  // student distance
  const studentDistance = Number(stu.distanceFromSchool || 0);
  setPaymentData((prev) => ({ ...prev, studentDistance }));

  // previous pending
  try {
    const res = await axios.get(
      `http://localhost:5000/api/payments/previous-pending/${studentCode}`
    );
     const prevPending = (res.data?.previousPending || 0) + (res.data?.overallPendingAmount || 0);
     const overallPendingAmount = res.data?.overallPendingAmount || 0;
    setPreviousPending(prevPending);
    setPendingAmount(prevPending);
    setShowPreviousPending(prevPending > 0);
    setPaymentData((prev) => ({ ...prev, prevPending ,overallPendingAmount}));
  } catch (err) {
    console.error("Error fetching previous pending:", err);
    setPreviousPending(0);
    setPendingAmount(0);
    setShowPreviousPending(false);
    setPaymentData((prev) => ({ ...prev, prevPending: 0 }));
  }

  // pending fee heads
  try {
    const res = await axios.get(
      `http://localhost:5000/api/payments/pending-fee-heads/${studentCode}`
    );
    setPendingFeeHeads(res.data || []);
  } catch (err) {
    console.error("Error fetching pending fee heads:", err);
    setPendingFeeHeads([]);
  }

if (stu && stu.fullData && stu.fullData.studentId && stu.academicSession) {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/payments/used-months/${stu.fullData.studentId}/${stu.academicSession}`
    );

    console.log("Fetched used months from backend:", res.data);
    setUsedMonths(res.data || { tuition: [], transport: [] });
  } catch (err) {
    console.error("Error fetching used months:", err);
  }
}




  // scholarships amounts
  let scholarships = { admission: 0, session: 0 };
  try {
    const admissionNo = stu.admissionNo || stu.label.split("-").pop().trim();
    if (admissionNo) {
      const schRes = await axios.get(
        `http://localhost:5000/api/payments/scholarships/${admissionNo}`
      );
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

  // 2) fetch class fee heads and use the locally fetched flags (admissionApplied/sessionApplied)
  try {
    const feesRes = await axios.get("http://localhost:5000/api/payments/class-fees", {
      params: { className: stu.admitClass, academicSession: stu.academicSession },
    });

    const feeHeadOptions = (feesRes.data || []).map((fh) => {
      const name = (fh.feeHeadName || "").toLowerCase();
      const orig = Number(fh.amount || 0);
      let reduced = orig;

      // If admission/session already applied (from DB flags), mark disabled and keep amount as orig
      if (name.includes("admission") && admissionApplied) {
        return {
          feeHead: fh.feeHeadName,
          originalAmount: orig,
          amount: orig,
          distance: fh.distance || "",
          disabled: true,
        };
      }
      if (name.includes("session") && sessionApplied) {
        return {
          feeHead: fh.feeHeadName,
          originalAmount: orig,
          amount: orig,
          distance: fh.distance || "",
          disabled: true,
        };
      }

      // otherwise apply scholarship amounts (if any)
      if (name.includes("admission") && !admissionApplied) reduced = orig - (scholarships.admission || 0);
      else if (name.includes("session") && !sessionApplied) reduced = orig - (scholarships.session || 0);
      if (reduced < 0) reduced = 0;

      return {
        feeHead: fh.feeHeadName,
        originalAmount: orig,
        amount: reduced,
        distance: fh.distance || "",
        disabled: false,
      };
    });

    setFeeHeads(feeHeadOptions);
    setSelectedFeeHeads([]);
    setPaymentData((prev) => ({ ...prev, feeDetails: [] }));
    setCurrentFee(0);
    setNetPayable(0);
    setPendingAmount(0);
  } catch (err) {
    console.error("Error fetching fee heads:", err);
  }

  // new receipt id
  try {
    const res = await axios.get("http://localhost:5000/api/payments/new-receipt-id");
    setPaymentData((prev) => ({ ...prev, paymentId: res.data.paymentId }));
  } catch (err) {
    console.error("Error fetching new receipt ID:", err);
  }

  setTuitionMonths([
    { month: "January" }, { month: "February" }, { month: "March" }, { month: "April" },
    { month: "May" }, { month: "June" }, { month: "July" }, { month: "August" },
    { month: "September" }, { month: "October" }, { month: "November" }, { month: "December" },
  ]);
};


const handleFeeHeadChange = (selectedHeads) => {
  const selected = selectedHeads || [];
  const updatedFeeDetails = [];

  const stu = initialStudentOptions.find(
    (s) => s.value === paymentData.student
  );
  const studentDistance = stu
    ? Number(stu.distanceFromSchool || 0)
    : 0;

  selected.forEach((sh) => {
    const val = sh.value;
    const existing = paymentData.feeDetails.find(
      (f) => f.feeHead === val
    );

    // 🔹 Prevent adding Admission/Session if already applied
    if (
      (val.toLowerCase().includes("admission") &&
        paymentData.admissionScholarshipApplied) ||
      (val.toLowerCase().includes("session") &&
        paymentData.sessionScholarshipApplied)
    ) {
      return;
    }

    // Tuition Fee
    if (val.toLowerCase() === "tuition fee") {
      const existingTuition = paymentData.feeDetails.find(
        (f) => f.feeHead.toLowerCase() === "tuition fee"
      );
      updatedFeeDetails.push({
        feeHead: "Tuition Fee",
        selectedMonth: existingTuition?.selectedMonth || [],
        amount: existingTuition?.amount || 0,
        originalAmount: existingTuition?.originalAmount || 0,
        paymentStatus: existingTuition?.paymentStatus || "Full Payment",
        amountPaid: existingTuition?.amountPaid || 0,
        pendingAmount: existingTuition?.pendingAmount || 0,
        lateFine: existingTuition?.lateFine || 0,
      });
    }
    // Transport
else if (val.toLowerCase() === "transport") {
  let perMonthRate = 0;
  feeHeads
    .filter((f) => f.feeHead.toLowerCase() === "transport")
    .forEach((f) => {
      if (f.distance.includes("-")) {
        const [min, max] = f.distance.split("-").map(Number);
        if (studentDistance >= min && studentDistance <= max) perMonthRate = f.amount;
      } else {
        if (studentDistance === Number(f.distance)) perMonthRate = f.amount;
      }
    });

  // 🔹 Find existing transport fee (to preserve months & calculated amount)
  const existingTransport = paymentData.feeDetails.find(
    (f) => f.feeHead.toLowerCase() === "transport"
  );

  const selectedMonths = existingTransport?.selectedMonth || [];
  const totalAmount = perMonthRate * selectedMonths.length;

  updatedFeeDetails.push({
    feeHead: "Transport",
    amount: totalAmount,
    originalAmount: perMonthRate, // per-month rate
    distance: studentDistance,
    selectedMonth: selectedMonths, // <-- preserve previous months
    paymentStatus: existingTransport?.paymentStatus || "Full Payment",
    amountPaid:
      existingTransport?.paymentStatus === "Full Payment"
        ? totalAmount
        : existingTransport?.amountPaid ?? 0,
    pendingAmount:
      existingTransport?.paymentStatus === "Full Payment"
        ? 0
        : totalAmount - (existingTransport?.amountPaid ?? 0),
    lateFine: existingTransport?.lateFine ?? 0,
  });
}


    // Other
    else if (val.toLowerCase() === "other") {
      updatedFeeDetails.push({
        feeHead: "Other",
        otherName: existing?.otherName || "",
        amount: existing?.amount || 0,
        paymentStatus: existing?.paymentStatus || "Full Payment",
        amountPaid: existing?.amountPaid ?? 0,
        pendingAmount: existing?.pendingAmount ?? 0,
        lateFine: existing?.lateFine ?? 0,
      });
    }
    // General fee heads
    else {
      const feeOpt = feeHeads.find((f) => f.feeHead === val);
      if (!feeOpt) return;

      updatedFeeDetails.push({
        feeHead: feeOpt.feeHead,
        originalAmount: feeOpt.originalAmount,
        amount: feeOpt.amount,
        paymentStatus: existing?.paymentStatus || "Full Payment",
        amountPaid: existing?.amountPaid ?? feeOpt.amount,
        pendingAmount: existing?.pendingAmount ?? 0,
        lateFine: existing?.lateFine ?? 0,
        selectedMonth: "",
      });
    }
  });

  const totalAmount = updatedFeeDetails.reduce(
    (sum, f) => sum + Number(f.amount || 0),
    0
  );
  const currentFee = updatedFeeDetails.reduce(
    (sum, f) => sum + Number(f.amountPaid || 0),
    0
  );

  setPaymentData((prev) => ({
    ...prev,
    feeDetails: updatedFeeDetails,
    totalAmount,
  }));

  setCurrentFee(currentFee);
  setNetPayable(totalAmount - Number(discount || 0) + Number(lateFine || 0));
  setPendingAmount(totalAmount - currentFee + Number(lateFine || 0));
};


// Handle Other Fee Input
const handleOtherFeeChange = (type, value) => {
  setPaymentData(prev => {
    const feeDetails = prev.feeDetails.map(f => {
      if (f.feeHead === "Other") {
        const updated = { ...f };
        if (type === "name") updated.otherName = value;
        if (type === "amount") updated.amount = Number(value || 0);

        // Update amountPaid and pendingAmount based on paymentStatus
        if (updated.paymentStatus === "Full Payment") {
          updated.amountPaid = updated.amount;
          updated.pendingAmount = 0;
        } else {
          updated.amountPaid = 0;
          updated.pendingAmount = updated.amount;
        }

        return updated;
      }
      return f;
    });

    const totalAmount = feeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);

    // Recalculate currentFee, netPayable, pendingAmount
    const currentFee = feeDetails.reduce((sum, f) => sum + Number(f.amountPaid || 0), 0);
    const netPayable = totalAmount - (discount || 0) + (lateFine || 0);
    const pendingAmount = netPayable - currentFee;

    setCurrentFee(currentFee);
    setNetPayable(netPayable);
    setPendingAmount(pendingAmount);

    return { ...prev, feeDetails, totalAmount };
  });
};

const handleFeeHeadPaymentStatusChange = (feeHead, status) => {
  setPaymentData(prev => {
    const updatedFeeDetails = prev.feeDetails.map(f => {
      if (f.feeHead === feeHead) {
        const amount = f.amount || 0;
        return {
          ...f,
          paymentStatus: status,
          amountPaid: status === "Full Payment" ? amount : 0,
          pendingAmount: status === "Full Payment" ? 0 : amount,
        };
      }
      return f;
    });

    recalcTotals(updatedFeeDetails); // update currentFee, netPayable, pendingAmount

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


const recalcTotals = (feeDetails) => {
  if (!feeDetails || feeDetails.length === 0) {
    setCurrentFee(0);
    setTotalPaid(0);
    setPendingAmount(0);
    setNetPayable(0);
    setPaymentData((prev) => ({ ...prev, totalAmount: 0, feeDetails: [] }));
    return;
  }

  const totalFeeHeads = feeDetails.reduce(
    (sum, f) => sum + Number(f.amount || 0),
    0
  );

  const currentFee = feeDetails.reduce(
    (sum, f) => sum + Number(f.amountPaid || 0),
    0
  );
  const totalPaidWithFine = currentFee + Number(lateFine || 0);
  const pending = totalFeeHeads + Number(lateFine || 0) - totalPaidWithFine;
  const net = totalFeeHeads + Number(lateFine || 0) - Number(discount || 0);

  setCurrentFee(currentFee);
  setTotalPaid(totalPaidWithFine);
  setPendingAmount(pending);
  setNetPayable(
    paymentData.paymentStatus === "Pending"
      ? paymentData.amountPaid || 0
      : net
  );

  setPaymentData((prev) => ({
    ...prev,
    totalAmount: totalFeeHeads,
    feeDetails,
    netPayable:
      prev.paymentStatus === "Pending"
        ? prev.amountPaid || 0
        : net,
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
  const feeDetailsForBackend = (paymentData.feeDetails || []).map((f) => {
    const selectedMonths = Array.isArray(f.selectedMonth)
      ? f.selectedMonth.filter((m) => m)
      : [];
    const monthCount = selectedMonths.length || 1;
    const totalOriginal = Number(f.originalAmount || f.amount || 0) * monthCount;

    let finalAmount = totalOriginal;
    let scholarshipAmount = 0;
    const name = f.feeHead?.toLowerCase() || "";

    //  Apply scholarships
    if (name.includes("admission")) {
      scholarshipAmount = Number(studentScholarships.admission || 0);
      finalAmount = totalOriginal - scholarshipAmount;
    } else if (name.includes("session")) {
      scholarshipAmount = Number(studentScholarships.session || 0);
      finalAmount = totalOriginal - scholarshipAmount;
    } 
    //  For "Other" fee head: keep both same
    else if (name.includes("other")) {
      scholarshipAmount = 0;
      finalAmount = totalOriginal; // same as originalAmount
    }

    if (finalAmount < 0) finalAmount = 0;

    return {
      feeHead: f.feeHead,
      originalAmount: totalOriginal,
      amount: finalAmount,
      scholarshipAmount,
      appliedScholarship: scholarshipAmount,
      amountPaid: Number(f.amountPaid || 0),
      pendingAmount: Number(f.pendingAmount || 0),
      paymentStatus: f.paymentStatus || "Full Payment",
      lateFine: Number(f.lateFine || 0),
      otherName: f.otherName || "",
      distance: f.distance || 0,
      ...(name.includes("tuition") ? { month: selectedMonths } : {}),
      selectedMonth: selectedMonths,
    };
  });

const payload = {
  student: paymentData.student,
  rollNo: paymentData.rollNo,
  admitClass: paymentData.admitClass,
  section: paymentData.section,
  academicSession: paymentData.academicSession,
  feeDetails: feeDetailsForBackend,
  previousPending: Number(previousPending || 0),
  currentFee: Number(currentFee || 0),
  totalAmount: Number(paymentData.totalAmount || 0),
  discount: Number(discount || 0),

netPayable: Number(netPayable || 0),


  // Store amountPaid depending on payment status
  amountPaid:
    paymentData.paymentStatus === "Pending"
      ? Number(paymentData.amountPaid || 0)
      : Number(paymentData.totalAmount || 0),

  overallPendingAmount:
    paymentData.paymentStatus === "Pending"
      ? Math.max(Number(paymentData.totalAmount || 0) - Number(paymentData.amountPaid || 0), 0)
      : 0,

  paymentStatus: paymentData.paymentStatus,
  paymentMode: paymentData.paymentMode,
  transactionId: paymentData.transactionId || "",
  cardNumber: paymentData.cardNumber || "",
  remarks: paymentData.remarks || "",
  user: paymentData.user || localStorage.getItem("userId") || "admin",
  lateFine: Number(lateFine || 0),
  admissionScholarshipApplied: paymentData.admissionScholarshipApplied || false,
  sessionScholarshipApplied: paymentData.sessionScholarshipApplied || false,
};


    if (isEditMode) {
      await axios.put(`http://localhost:5000/api/payments/${paymentData._id}`, payload);
      toast.success("Receipt updated successfully!");
    } else {
      await axios.post("http://localhost:5000/api/payments", payload);
      toast.success("Receipt saved successfully!");
      await fetchNextPaymentId();
    }
    const newTuition = new Set(usedMonths.tuition || []);
const newTransport = new Set(usedMonths.transport || []);
(feeDetailsForBackend || []).forEach(fd => {
  const months = Array.isArray(fd.selectedMonth) ? fd.selectedMonth : [];
  if (fd.feeHead.toLowerCase().includes("tuition")) months.forEach(m => newTuition.add(m));
  if (fd.feeHead.toLowerCase().includes("transport")) months.forEach(m => newTransport.add(m));
});
setUsedMonths({ tuition: [...newTuition], transport: [...newTransport] });

    navigate("/PaymentsList", { replace: true });
  } catch (err) {
    console.error("Save failed:", err);
    toast.error("Error saving receipt. Check console.");
  }
};

// ================== TOTAL CALCULATIONS ==================
const totalOriginal = pendingFeeHeads.reduce(
  (sum, fh) =>
    sum +
    (String(fh.feeHead || "").toLowerCase().includes("other")
      ? Number(fh.amount || 0)
      : Number(fh.originalAmount || 0)),
  0
);

const totalScholarship = pendingFeeHeads.reduce(
  (sum, fh) =>
    sum +
    (fh.originalAmount && fh.amount
      ? Number(fh.originalAmount) - Number(fh.amount)
      : 0),
  0
);

const totalPayable = pendingFeeHeads.reduce(
  (sum, fh) => sum + Number(fh.amount || 0),
  0
);

const totalamount = pendingFeeHeads.reduce(
  (sum, fh) => sum + Number(fh.amountPaid || 0),
  0
);

const totalPending = pendingFeeHeads.reduce(
  (sum, fh) => sum + Number(fh.pendingAmount || 0),
  0
);

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
              onInputChange={(inputValue, { action }) => {
                if (action === "input-change") {
                  return inputValue.toUpperCase(); // convert typed letters to uppercase
                }
                return inputValue;
  }}
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
      //  Make sure fee heads are unique by name only
      ...feeHeads
        .filter(
          (fh, index, self) =>
            index === self.findIndex(f => f.feeHead?.toLowerCase() === fh.feeHead?.toLowerCase())
        )
        .map(fh => ({
          value: fh.feeHead,
          label: fh.feeHead,
          isDisabled:
            (fh.feeHead?.toLowerCase().includes("admission") && paymentData.admissionScholarshipApplied) ||
            (fh.feeHead?.toLowerCase().includes("session") && paymentData.sessionScholarshipApplied),
        })),
      { value: "Other", label: "Other" },
    ]}
    onChange={handleFeeHeadChange}
    value={paymentData.feeDetails.map(f =>
      f.feeHead === "Other" ? { value: "Other", label: "Other" } : { value: f.feeHead, label: f.feeHead }
    )}
    placeholder="Select Fee Heads..."
    isSearchable
    className="mb-2"
  />
</label>




{paymentData.feeDetails.map((f) => (
  <div key={f.feeHead} className="col-span-1 border p-2 rounded mb-2">
    {/* Fee Head Name */}
    <label className="flex flex-col text-sm font-semibold text-black">
      {f.feeHead === "Other" ? (
        <>
          Other Fee Name
          <input
            type="text"
            value={f.otherName || ""}
            onChange={(e) => handleOtherFeeChange("name", e.target.value)}
            className="border border-gray-400 p-1 rounded"
            placeholder="Enter fee name"
          />
        </>
      ) : (
        f.feeHead
      )}
    </label>

{f.feeHead.toLowerCase().includes("tuition") && (
  <label className="flex flex-col text-sm font-semibold text-black mt-1 required">
    Month
<Select
  isMulti
  options={tuitionMonths.map(m => ({ value: m.month, label: m.month }))}
  value={(f.selectedMonth || []).map(m => ({ value: m, label: m }))}
  isOptionDisabled={(option) => (usedMonths.tuition || []).includes(option.value)} //  disable already used
  onChange={(selectedOptions) => {
    const months = selectedOptions.map(o => o.value);
    const perMonthFee = feeHeads.find(fh => fh.feeHead.toLowerCase() === "tuition fee")?.amount || 0;

    const updatedFeeDetails = paymentData.feeDetails.map(fd => {
      if (fd.feeHead.toLowerCase() === "tuition fee") {
        const totalAmount = months.length * perMonthFee;
        return {
          ...fd,
          selectedMonth: months,
          amount: totalAmount,
          originalAmount: perMonthFee,
          amountPaid: fd.paymentStatus === "Full Payment" ? totalAmount : 0,
          pendingAmount: fd.paymentStatus === "Full Payment" ? 0 : totalAmount,
        };
      }
      return fd;
    });

    setPaymentData(prev => ({ ...prev, feeDetails: updatedFeeDetails }));
    recalcTotals(updatedFeeDetails);
  }}
  className="p-1 rounded border-gray-400"
/>

  </label>
)}


{f.feeHead.toLowerCase() === "transport" && (
  <label className="flex flex-col text-sm font-semibold text-black mt-1 required">
    Month
<Select
  isMulti
  options={tuitionMonths.map(m => ({ value: m.month, label: m.month }))}
  value={(f.selectedMonth || []).map(m => ({ value: m, label: m }))}
  isOptionDisabled={(option) => (usedMonths.transport || []).includes(option.value)} // disable already used
  onChange={(selectedOptions) => {
    const months = selectedOptions.map(o => o.value);
    const perMonthFee = Number(f.originalAmount || 0);
    const totalAmount = months.length * perMonthFee;

    const updatedFeeDetails = paymentData.feeDetails.map(fd => {
      if (fd.feeHead.toLowerCase() === "transport") {
        const amountPaid = fd.paymentStatus === "Full Payment" ? totalAmount : (fd.amountPaid || 0);
        const pending = fd.paymentStatus === "Full Payment" ? 0 : totalAmount - (fd.amountPaid || 0);
        return {
          ...fd,
          selectedMonth: months,
          amount: totalAmount,
          amountPaid,
          pendingAmount: pending,
        };
      }
      return fd;
    });

    setPaymentData(prev => ({ ...prev, feeDetails: updatedFeeDetails }));
    recalcTotals(updatedFeeDetails);
  }}
  className="p-1 rounded border-gray-400"
/>


  </label>
)}
    {/* Amount */}
    <label className="flex flex-col text-sm font-semibold text-black mt-1">
      Amount
      <input
        type="number"
        
        value={f.amount === 0 ? "" : f.amount}
        onChange={(e) => {
          if (f.feeHead === "Other") handleOtherFeeChange("amount", e.target.value);
          else handleAmountChange(f.feeHead, e.target.value);
        }}
        readOnly={f.feeHead !== "Other"} // Only editable for 'Other'
        placeholder={f.feeHead === "Other" ? "Enter Amount" : ""}
        className={`border p-1 rounded ${f.feeHead === "Other" ? "" : "bg-gray-100 cursor-not-allowed"}`}
      />
    </label>

    {/* Distance (for Transport) */}
    {f.feeHead.toLowerCase() === "transport" && (
      <label className="flex flex-col text-sm font-semibold text-black mt-1">
        Distance (KM)
        <input
          type="number"
          value={f.distance || ""}
          readOnly
          className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
        />
      </label>
    )}

    {/* Payment Status */}
    <label className="flex flex-col text-sm font-semibold text-black mt-1">
      Payment Status
      <select
        value={f.paymentStatus}
        onChange={(e) => handleFeeHeadPaymentStatusChange(f.feeHead, e.target.value)}
        className="border border-gray-400 p-1 rounded"
      >
        <option value="Full Payment">Full Payment</option>
        <option value="Pending">Pending</option>
      </select>
    </label>

    {/* Amount Paid & Pending (only if Pending) */}
    {f.paymentStatus === "Pending" && (
      <>
        <label className="flex flex-col text-sm font-semibold text-black mt-1">
          Amount Paid
          <input
            type="number"
            value={f.amountPaid === 0 ? "" : f.amountPaid}
            onChange={(e) => handleFeeHeadAmountPaidChange(f.feeHead, e.target.value)}
            className="border border-gray-400 p-1 rounded"
            placeholder="Enter Paid Amount"
          />
        </label>

        <label className="flex flex-col text-sm font-semibold text-black mt-1">
          Pending Amount
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
      value={lateFine === 0 ? "" : lateFine}
      onChange={(e) => setLateFine(e.target.value === "" ? 0 : Number(e.target.value))}
      placeholder="Enter Late Fine"
      className="border border-gray-400 p-1 rounded"
    />
    </label>
        {showPreviousPending && (
      <div className="flex items-end gap-2">
        <div className="flex flex-col text-sm font-semibold text-black">
          <label>Previous Total Pending</label>
          <input
            type="number"
            value={paymentData.prevPending}
            readOnly
            className="border rounded p-1 w-40 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-0 rounded h-fit"
          onClick={() => setShowPendingModal(true)}
        >
          View
        </button>
      </div>
    )}
    
        {showPendingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded w-auto">
              <h2 className="text-lg font-semibold mb-4">Previous Pending Details</h2>

              <table className="w-full border-collapse border border-black text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 p-2 text-center">Fee Head</th>
                    <th className="border border-gray-400 p-2 text-center">Original Amount</th>
                    <th className="border border-gray-400 p-2 text-center">Scholarship</th>
                    <th className="border border-gray-400 p-2 text-center">Payble Amount</th>
                    <th className="border border-gray-400 p-2 text-center">Paid Amount</th>
                    <th className="border border-gray-400 p-2 text-center">Pending Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingFeeHeads.length > 0 ? (
                    pendingFeeHeads.map((fh, idx) => {
                      const scholarship =
                        fh.originalAmount && fh.amount
                          ? fh.originalAmount - fh.amount
                          : 0;

                      const netAmount = fh.amount || 0;

                      return (
                        <tr key={idx} className="border-2">
                          <td className="p-1 text-center">{fh.feeHeadName}</td>

                          {/* Original Amount (for 'other' fee head show amount instead of original) */}
                          <td className="p-1 text-center">
                            {fh.feeHead?.toLowerCase().includes("other")
                              ? fh.amount
                              : fh.originalAmount ?? 0}

                          </td>

                          {/* Scholarship */}
                          <td className="p-1 text-center">
                              {scholarship > 0 ? scholarship : "--"}
                          </td>



                          {/* Net Amount */}
                          <td className="p-1 text-center">{netAmount}</td>

                          {/* Paid Amount */}
                          <td className="p-1 text-center">{fh.amountPaid || 0}</td>

                          {/* Pending Amount */}
                          <td className="p-1 text-center">{fh.pendingAmount || 0}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-2 text-center text-gray-500">
                        No pending fee heads
                      </td>
                    </tr>
                  )}
                  {/* <tr className="bg-gray-100 font-semibold">
                    <td className="text-center border p-2">Total</td>
                    <td className="text-center border p-2">{totalOriginal}</td>
                    <td className="text-center border p-2">{totalScholarship}</td>
                    <td className="text-center border p-2">{totalPayable}</td>
                    <td className="text-center border p-2">{totalamount}</td>
                    <td className="text-center border p-2">{totalPending}</td>
                  </tr> */}
                   <tr className="bg-gray-100 font-semibold">
                    <td className="text-center border p-2">Total</td>
                    <td className="text-center border p-2"></td>
                    <td className="text-center border p-2"></td>
                    <td className="text-center border p-2"></td>
                    <td className="text-center border p-2"></td>
                    <td className="text-center border p-2">{totalPending}</td>
                  </tr>
                  <tr className="bg-yellow-100 font-semibold">
                  <td colSpan={5} className="text-right p-2 border border-gray-400">
                    Previous Pending Amount
                  </td>
                  <td className="text-center p-2 border border-gray-400">
                    {Number(paymentData.overallPendingAmount || 0)}
                  </td>
                </tr>

                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => setShowPendingModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


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

{/* ================== PAYMENT STATUS ================== */}
<label className="flex flex-col text-sm font-semibold text-black">
  Payment Status
  <select
    value={paymentData.paymentStatus}
    onChange={(e) => {
      const newStatus = e.target.value;
      setPaymentData((prev) => {
        if (newStatus === "Pending") {
          return {
            ...prev,
            paymentStatus: newStatus,
            amountPaid: "",
            netPayable: 0,
            overallPendingAmount: 0,
          };
        } else {
          return {
            ...prev,
            paymentStatus: newStatus,
            amountPaid: prev.totalAmount,
            netPayable: prev.totalAmount,
            overallPendingAmount: 0,
          };
        }
      });
    }}
    className="border border-gray-400 p-1 rounded"
  >
    <option value="Full Payment">Full Payment</option>
    <option value="Pending">Pending</option>
  </select>
</label>

{/* ================== AMOUNT PAID + OVERALL PENDING ================== */}
{paymentData.paymentStatus === "Pending" && (
  <div className="flex flex-row items-end gap-4 w-full col-span-2">
    {/* Amount Paid */}
    <div className="flex flex-col w-full text-sm font-semibold text-black">
      <label>Amount Paid</label>
      <input
        type="number"
        value={paymentData.amountPaid || ""}
        onChange={(e) => {
          const paidValue = Number(e.target.value) || 0;
          const totalFee =
            (previousPending || 0) +
            (currentFee || 0) +
            (lateFine || 0);

          const pending = totalFee - paidValue;

          setPaymentData((prev) => ({
            ...prev,
            amountPaid: paidValue,
            netPayable: paidValue,
            overallPendingAmount: pending > 0 ? pending : 0,
          }));
        }}
        placeholder="Enter paid amount"
        className="border border-gray-400 p-1 rounded"
      />
    </div>

    {/* Overall Pending Amount */}
    <div className="flex flex-col w-full text-sm font-semibold text-black">
      <label>Total Pending Amount</label>
      <input
        type="number"
        value={paymentData.overallPendingAmount || 0}
        readOnly
        className="border border-gray-400 p-1 rounded bg-gray-100 cursor-not-allowed"
      />
    </div>
  </div>
)}


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