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
    paymentMode: "",
    transactionId: "",
    cardNumber: "",
    remarks: "",
    user: localStorage.getItem("userId") || "admin",
  });

  const [previousPending, setPreviousPending] = useState(0);
  const [currentFee, setCurrentFee] = useState(0);
  const [discount, setDiscount] = useState('');
  const [netPayable, setNetPayable] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [pendingAmount, setPendingAmount] = useState(0);

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

  const [paymentStatus, setPaymentStatus] = useState("Full Payment");

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
          label: `${fullName || s.studentName || "Unnamed"} - ${s.studentId || ""}`,
          admitClass: s.admitClass,
          section: s.section,
          rollNo: s.rollNo,
          transportRequired: s.transportRequired,
          distanceFromSchool: s.distanceFromSchool || 0,
          academicSession: s.academicSession || "",
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
    setPaymentData(prev => ({
      ...prev,
      student: "",
      rollNo: "",
      admitClass: "",
      section: "",
      academicSession: "",
      feeDetails: [],
    }));
    setPreviousPending(0);
    setCurrentFee(0);
    setNetPayable(0);
    setAmountPaid("");
    setPendingAmount(0);
    setSelectedRoute("");
    return;
  }

  const stu = initialStudentOptions.find(s => s.value === selected.value);
  if (!stu) return;

  setPaymentData(prev => ({
    ...prev,
    student: stu.value,
    rollNo: stu.rollNo,
    admitClass: stu.admitClass,
    section: stu.section,
    academicSession: stu.academicSession,
    feeDetails: [], // keep blank for manual selection
  }));

  // --- Fetch previous pending ---
  try {
    const res = await axios.get(`http://localhost:5000/api/payments/pending/${stu.value}`);
    setPreviousPending(Number(res.data?.previousPending || 0));
  } catch (err) {
    console.error(err);
    setPreviousPending(0);
  }

  // --- Fetch Fee Heads (for dropdown only, not selected automatically) ---
  try {
    const feesRes = await axios.get("http://localhost:5000/api/payments/class-fees", {
      params: { className: stu.admitClass, academicSession: stu.academicSession },
    });

    const feeHeadOptions = feesRes.data.map(f => ({
      feeHeadName: f.feeHeadName,
      amount: f.amount,
      distance: f.distance || "",
      feeStructId: f.feeStructId,
    }));

    setFeeHeads(feeHeadOptions);

    // --- Determine transport range for student ---
    if (stu.transportRequired) {
      const transportFee = feeHeadOptions.find(fh => fh.feeHeadName.toLowerCase() === "transport");
      if (transportFee) {
        const [min, max] = transportFee.distance.split("-").map(Number);
        if (stu.distanceFromSchool >= min && stu.distanceFromSchool <= max) {
          setSelectedRoute(transportFee.distance); // show student’s applicable transport distance
        }
      }
    }

  } catch (err) {
    console.error("Error fetching fee heads:", err);
  }

  // Reset current fee & net payable
  setCurrentFee(0);
  setNetPayable(0);
  setPendingAmount(0);
  setAmountPaid("");
};



const handleFeeHeadChange = (selectedHeads) => {
  if (!selectedHeads) selectedHeads = [];

  const selectedHeadNames = selectedHeads.map(fh => fh.value);

  const updatedFeeDetails = selectedHeadNames.map(name => {
    const feeObj = feeHeads.find(fh => fh.feeHeadName === name);

    if (!feeObj) return null;

    // --- Transport: assign correct amount based on student's distance ---
    if (name.toLowerCase() === "transport") {
      const studentDistance = initialStudentOptions.find(s => s.value === paymentData.student)?.distanceFromSchool || 0;
      let matchedFee = feeHeads.find(fh => {
        if (fh.feeHeadName.toLowerCase() !== "transport") return false;
        const [min, max] = fh.distance.split("-").map(Number);
        return studentDistance >= min && studentDistance <= max;
      });
      if (!matchedFee) matchedFee = feeObj;

      return {
        feeHead: "Transport",
        amount: matchedFee.amount,
        distance: matchedFee.distance,
        routeId: "",
      };
    }

    return {
      feeHead: feeObj.feeHeadName,
      amount: feeObj.amount,
      distance: "",
      routeId: "",
    };
  }).filter(Boolean);

  const total = updatedFeeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const net = total + previousPending - Number(discount || 0);
  const pending = net - Number(amountPaid || 0);

  setCurrentFee(total);
  setNetPayable(net);
  setPendingAmount(pending);

  setPaymentData(prev => ({ ...prev, feeDetails: updatedFeeDetails }));

  // Show route dropdown only if Transport selected
  const hasTransport = selectedHeadNames.some(h => h.toLowerCase() === "transport");
  setShowRouteDropdown(hasTransport);
};



  const handleRouteChange = async (routeId) => {
    const selectedRouteObj = routes.find((r) => r.routeId === routeId);
    const updatedFeeDetails = paymentData.feeDetails.map(f => {
      if (f.feeHead.toLowerCase() === "transport") {
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
    toast.error("Transaction ID required for this payment mode!");
    return;
  }

  if (paymentData.paymentMode === "Card" && !paymentData.cardNumber) {
    toast.error("Card Number required for Card payment!");
    return;
  }

  try {
    const updatedFeeDetails = paymentData.feeDetails.map((f) => ({
      ...f,
      amount: f.amount || 0,
    }));

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
      academicSession: paymentData.academicSession,
    };

    // Get student name from students state using _id
    const studentObj = students.find((s) => s._id === paymentData.student);
    const studentName = studentObj
      ? `${studentObj.firstName || ""} ${studentObj.lastName || ""}`.trim()
      : paymentData.student;

    if (isEditMode) {
      await axios.put(
        `http://localhost:5000/api/payments/${paymentData._id}`,
        submissionData
      );
     
      toast.success("Receipt updated successfully!");
      navigate("/PaymentsList", { replace: true });
    } else {
      await axios.post("http://localhost:5000/api/payments", submissionData);
      
      toast.success("Receipt saved successfully!");
      await fetchNextPaymentId();

      // Reset form
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
    toast.error("Error saving receipt. Check console.");
  }
};




  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full m-5">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Receipt" : "New Receipt"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Academic Session */}
          <label className="flex flex-col text-sm font-semibold text-black">
            Academic Session
            <input
              type="text"
              name="academicSession"
              value={paymentData.academicSession || ""}
              readOnly
              className="border border-gray-400 p-1 rounded bg-gray-100"
            />
          </label>

    <label className="flex flex-col text-sm font-semibold text-black col-span-2">
          Fee Heads
          <Select
          isMulti
          options={feeHeads.map((fh) => ({
            value: fh.feeHeadName,
            label: fh.feeHeadName,
          }))}
          onChange={handleFeeHeadChange}
          value={paymentData.feeDetails
            .map((f) => feeHeads.find((fh) => fh.feeHeadName === f.feeHead))
            .filter(Boolean)
            .map((f) => ({ value: f.feeHeadName, label: f.feeHeadName }))}
          placeholder="Select Fee Heads..."
          isSearchable
        />

        </label>


      {paymentData.feeDetails.some(f => f.feeHead.toLowerCase() === "transport") && (
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
