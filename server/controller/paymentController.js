// ======= server/controllers/paymentController.js =======
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const FeeHead = require("../models/FeeHead");
const ClassMaster = require("../models/Class");
const logActivity = require("../utils/logActivity");

const PREFIX = "RCPT";

// ================== Helper: Generate next PaymentId ==================
async function generateNextPaymentId() {
  // Fetch the latest payment by creation time or _id
  const last = await Payment.findOne().sort({ createdAt: -1 }).lean(); 
  // If your model doesn't have 'createdAt', use: sort({ _id: -1 })

  let lastNum = 0;
  if (last && last.paymentId?.startsWith(PREFIX)) {
    // Extract the numeric part after "RCPT"
    lastNum = parseInt(last.paymentId.replace(PREFIX, ""), 10) || 0;
  }

  const nextNum = lastNum + 1;
  return `${PREFIX}${nextNum}`; // RCPT1, RCPT2, RCPT3...
}



// ================== Student Routes ==================
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

const getAllClasses = async (_req, res) => {
  try {
    const classDocs = await ClassMaster.find().select("className").lean();
    const classes = Array.from(new Set(classDocs.map((c) => c.className)));
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch classes" });
  }
};

// ================== Get Sections by Class ==================
const getSectionsByClass = async (req, res) => {
  try {
    const { className } = req.query;

    if (className) {
      const classDocs = await ClassMaster.find({ className }).select("section className -_id").lean();
      const sections = classDocs.map((c) => ({ className: c.className, section: c.section }));
      return res.json(sections);
    } else {
      const classDocs = await ClassMaster.find().select("className section -_id").lean();
      const uniquePairs = classDocs.map((c) => ({ className: c.className, section: c.section }));
      return res.json(uniquePairs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch sections" });
  }
};

const getStudentsByClassAndSection = async (req, res) => {
  try {
    const { className, section } = req.query;
    if (!className || !section)
      return res.status(400).json({ error: "className and section required" });

    const students = await Student.find({ admitClass: className, section })
      .select("_id firstName lastName studentName rollNo studentId admitClass section academicSession distanceFromSchool transportRequired")
      .lean();

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// ================== Payment Routes ==================
const getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch payments" });
  }
};

const getLatestPaymentId = async (_req, res) => {
  try {
    const nextId = await generateNextPaymentId();
    res.json({ paymentId: nextId });
  } catch (err) {
    res.status(500).json({ error: "Failed to get paymentId" });
  }
};

// ================== Helper: Parse distance range ==================
function parseDistanceRange(distanceStr) {
  if (!distanceStr) return { min: 0, max: 0 };
  const cleaned = distanceStr.replace(/[a-zA-Z]/g, "").trim(); // remove letters
  let min = 0, max = 0;
  if (cleaned.includes("-")) {
    const [start, end] = cleaned.split("-");
    min = parseInt(start.trim());
    max = parseInt(end.trim());
  } else {
    min = parseInt(cleaned);
    max = min;
  }
  return { min, max };
}

async function populateFeeAmounts(paymentBody) {
  // Parse feeDetails if it's a string
  if (!Array.isArray(paymentBody.feeDetails)) {
    try {
      paymentBody.feeDetails = JSON.parse(paymentBody.feeDetails);
    } catch {
      paymentBody.feeDetails = [];
    }
  }

  paymentBody.date = paymentBody.date ? new Date(paymentBody.date) : new Date();

  // Find student
  let studentDoc = null;
  if (paymentBody.student) {
    studentDoc = await Student.findOne({
      $or: [{ studentId: paymentBody.student }, { _id: paymentBody.student }],
    }).lean();

    if (studentDoc) {
      paymentBody.student = studentDoc.studentId;
      paymentBody.studentName = `${studentDoc.firstName || ""} ${studentDoc.lastName || ""}`.trim();
      paymentBody.admitClass = studentDoc.admitClass;
      paymentBody.section = studentDoc.section;
      paymentBody.rollNo = studentDoc.rollNo;
      paymentBody.academicSession = studentDoc.academicSession;
    }
  }

  // Get classId
  let classId = paymentBody.classId;
  if (!classId && paymentBody.admitClass) {
    const classData = await ClassMaster.findOne({ className: paymentBody.admitClass }).lean();
    if (classData) classId = classData.classId;
  }

  // Fetch fee structure and fee heads
  const classStructures = await FeeStructure.find({
    classId,
    academicSession: paymentBody.academicSession,
  }).lean();
  const feeHeads = await FeeHead.find().lean();

  // Scholarships
  let remainingAdmission = Number(studentDoc?.scholarshipForAdmissionFee || 0);
  let remainingSession = Number(studentDoc?.scholarshipForSessionFee || 0);

  let total = 0;
  let totalLateFine = 0;
  const finalFeeDetails = [];

  for (const f of paymentBody.feeDetails) {
    f.amount = f.amount !== undefined ? Number(f.amount) : undefined;
    f.originalAmount = f.originalAmount !== undefined ? Number(f.originalAmount) : undefined;
    f.lateFine = Number(f.lateFine || 0);

    let amount = 0;
      let feeHeadData = feeHeads.find(h => h.feeHeadName === f.feeHead);
      if (!feeHeadData && (f.feeHead || "").toLowerCase() === "other") {
        // treat "Other" as custom head, allow it
        feeHeadData = { feeHeadId: "OTHER", feeHeadName: "Other" };
      }
      if (!feeHeadData) {
        finalFeeDetails.push({ ...f, amount: f.amount || 0 });
        totalLateFine += f.lateFine;
        continue;
      }


    if (typeof f.originalAmount === "number" && typeof f.amount === "number") {
      amount = f.amount;
      f.appliedScholarship = f.appliedScholarship || 0;
    } else {
      if ((f.feeHead || "").toLowerCase() === "transport") {
        if ((!f.routeId || f.routeId === "") && studentDoc?.distanceFromSchool && studentDoc.transportRequired === "Yes") {
          const routes = classStructures.filter(cs => cs.feeHeadId === feeHeadData.feeHeadId);
          const km = Number(studentDoc.distanceFromSchool);
          const autoRoute = routes.find(r => {
            const { min, max } = parseDistanceRange(r.distance);
            return km >= min && km <= max;
          });
          if (autoRoute) {
            f.routeId = autoRoute.routeId;
            f.distance = autoRoute.distance;
          }
        }

      if (f.distance) {
          const routeFee = classStructures.find(cs => cs.feeHeadId === feeHeadData.feeHeadId && cs.distance === f.distance);
          amount = routeFee ? Number(routeFee.amount) : Number(f.amount || 0);
        } else if (studentDoc?.distanceFromSchool) {
          const km = Number(studentDoc.distanceFromSchool);
          const routeFee = classStructures.find(cs => {
            const { min, max } = parseDistanceRange(cs.distance);
            return km >= min && km <= max;
          });
          amount = routeFee ? Number(routeFee.amount) : Number(f.amount || 0);
        } else {
          amount = Number(f.amount || 0);
        }

      } else {
        const feeData = classStructures.find(cs => cs.feeHeadId === feeHeadData.feeHeadId);
        amount = feeData ? Number(feeData.amount) : Number(f.amount || 0);
      }

      const head = (f.feeHead || "").toLowerCase();
      f.appliedScholarship = 0;

      if (head.includes("admission") && remainingAdmission > 0) {
        const apply = Math.min(remainingAdmission, amount);
        amount -= apply;
        remainingAdmission -= apply;
        f.appliedScholarship = apply;
      }

      if (head.includes("session") && remainingSession > 0) {
        const apply = Math.min(remainingSession, amount);
        amount -= apply;
        remainingSession -= apply;
        f.appliedScholarship = (f.appliedScholarship || 0) + apply;
      }
    }

    if (amount < 0) amount = 0;

    total += Number(amount);
    totalLateFine += Number(f.lateFine || 0);

    finalFeeDetails.push({ ...f, amount });
  }

 const sanitizedFeeDetails = finalFeeDetails
    .filter(fd => fd && fd.feeHead)                 // drop empty objects
    .map(fd => ({
      feeHead: fd.feeHead,
      originalAmount: Number(fd.originalAmount || 0),
      amount: Number(fd.amount || 0),
      amountPaid: Number(fd.amountPaid || 0),
      pendingAmount: Number(fd.pendingAmount || 0),
      paymentStatus: fd.paymentStatus || (Number(fd.pendingAmount || 0) > 0 ? "Pending" : "Full Payment"),
      lateFine: Number(fd.lateFine || 0),
      otherName: fd.otherName || "",
      appliedScholarship: Number(fd.appliedScholarship || 0),
      routeId: fd.routeId || "",
      distance: fd.distance || "",
     selectedMonth: Array.isArray(fd.selectedMonth) && fd.selectedMonth.length > 0
                     ? fd.selectedMonth.filter(m => m)  // remove null/undefined
                     : [] 
    }));

  paymentBody.feeDetails = sanitizedFeeDetails;

  // Discount (force numeric)
  paymentBody.discount = Number(paymentBody.discount || 0);

 const previousPending = Number(paymentBody.previousPending || 0);
  const lateFine = Number(paymentBody.lateFine || 0);

  // currentFee = SUM of amountPaid (what has been paid for the current fee heads)
  const currentFee = sanitizedFeeDetails.reduce((s, fd) => s + Number(fd.amountPaid || 0), 0);

//  Correct calculations
paymentBody.totalFee = Number(currentFee + lateFine + previousPending);
paymentBody.netPayable = Math.max(paymentBody.totalFee - paymentBody.discount, 0);
paymentBody.totalPaidAmount = paymentBody.netPayable;
paymentBody.totalPendingAmount = paymentBody.feeDetails.reduce(
  (sum, f) => sum + Number(f.pendingAmount || 0),
  0
);

paymentBody.amountPaid = paymentBody.totalPaidAmount;
paymentBody.pendingAmount = paymentBody.totalPendingAmount;

// Payment status
paymentBody.paymentStatus = paymentBody.totalPendingAmount > 0 ? "Pending" : "Full Payment";
// // debug log computed values
// console.log("POPULATE_COMPUTED", {
//   previousPending,
//   lateFine,
//   currentFee,
//   totalFee: paymentBody.totalFee,
//   netPayable: paymentBody.netPayable,
//   totalPaidAmount: paymentBody.totalPaidAmount,
//   totalPendingAmount: paymentBody.totalPendingAmount,
//   feeDetails: paymentBody.feeDetails,
// });
return paymentBody;

}

// ===== Create Payment =====
const createPayment = async (req, res) => {
  try {
    if (!req.body.paymentId) req.body.paymentId = await generateNextPaymentId();
    await populateFeeAmounts(req.body);

    const payment = new Payment(req.body);
    await payment.save();
    await logActivity(`Added Payment for ${payment.studentName} | PaymentId: ${payment.paymentId}`);
    res.status(201).json(payment);
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: err.message || "Failed to create payment" });
  }
};
// ================== Update Payment ==================
const updatePayment = async (req, res) => {
  try {
    const updateBody = { ...req.body };
    await populateFeeAmounts(updateBody);

    const paymentDoc = await Payment.findById(req.params.id);
    if (!paymentDoc) return res.status(404).json({ error: "Payment not found" });

    Object.keys(updateBody).forEach((key) => {
      paymentDoc[key] = updateBody[key];
    });

    await paymentDoc.save();
    await logActivity(`Updated Payment for ${paymentDoc.studentName} | PaymentId: ${paymentDoc.paymentId}`);
    res.json(paymentDoc);
  } catch (err) {
    console.error("Update payment error:", err);
    res.status(500).json({ error: err.message || "Failed to update payment" });
  }
};

// ================== Duplicate Payment Check ==================
const checkDuplicatePayment = async (req, res) => {
  try {
    const { studentId, month, year } = req.query;
    const existingPayment = await Payment.findOne({ student: studentId, month, year });
    res.status(200).json({ duplicate: !!existingPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Delete Payment ==================
const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });
     await logActivity(`Deleted Payment for ${deleted.studentName} | PaymentId: ${deleted.paymentId}`);
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete payment" });
  }
};



// ================== Get Fee Amount ==================
const getFeeAmount = async (req, res) => {
  try {
    const { className, admitClass, feeHeadName, routeId } = req.query;
    const classToUse = admitClass || className;

    if (!classToUse || !feeHeadName) {
      return res.status(400).json({ message: "className/admitClass and feeHeadName required" });
    }

    const classData = await ClassMaster.findOne({ className: classToUse }).lean();
    if (!classData) return res.json({ amount: 0 });

    const feeHeadData = await FeeHead.findOne({ feeHeadName }).lean();
    if (!feeHeadData) return res.json({ amount: 0 });

    if (feeHeadName.toLowerCase() === "transport" && routeId) {
      const routeData = await FeeStructure.findOne({
        classId: classData.classId,
        feeHeadId: feeHeadData.feeHeadId,
        routeId,
      }).lean();
      return res.json({ amount: routeData ? routeData.amount : 0 });
    }

    const fee = await FeeStructure.findOne({
      classId: classData.classId,
      feeHeadId: feeHeadData.feeHeadId,
    }).lean();

    res.json({ amount: fee ? fee.amount : 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ====== Get all Fee Heads Amount for Class + Academic Session ======
const getClassFeeStructure = async (req, res) => {
  try {
    const { className, academicSession, distance } = req.query;

    if (!className || !academicSession) {
      return res.status(400).json({ message: "className and academicSession required" });
    }

    let query = { className, academicSession };
    let feeStructs = await FeeStructure.find(query).lean();

    if (distance) {
      const dist = Number(distance);
      feeStructs = feeStructs.filter(f => {
        if (f.feeHeadName !== "Transport" || !f.distance) return true;
        const { min, max } = parseDistanceRange(f.distance);
        return dist >= min && dist <= max;
      });
    }

    res.json(feeStructs);
  } catch (err) {
    console.error("Error fetching class fee structure:", err);
    res.status(500).json({ message: "Error fetching fee structure" });
  }
};

// ====== New: Get Fee Structure By ClassId & AcademicSession ======
const getFeeStructureByClassAndSession = async (req, res) => {
  try {
    const { classId, academicSession } = req.query;

    if (!classId || !academicSession) {
      return res.status(400).json({ message: "classId and academicSession required" });
    }

    const feeStructures = await FeeStructure.find({
      classId,
      academicSession,
    }).select("feeHeadId feeHeadName amount distance");

    res.json(feeStructures);
  } catch (err) {
    res.status(500).json({ message: "Error fetching fee structure", error: err.message });
  }
};


// GET /api/payments/previous-pending/:student
const getPreviousPending = async (req, res) => {
  try {
    const { student } = req.params;
    if (!student) return res.status(400).json({ message: "Student required" });

    const latestPayment = await Payment.findOne({ student })
      .sort({ date: -1 })
      .lean();

    if (!latestPayment)
      return res.status(200).json({ previousPending: 0, lastPaymentId: null });

    return res.status(200).json({
      previousPending: latestPayment.totalPendingAmount || 0,
      lastPaymentId: latestPayment.paymentId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get latest pending fee heads for a student
const getPendingFeeHeads = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    //  Fetch latest payment record for the student
    const latestPayment = await Payment.findOne({ student: studentId })
      .sort({ createdAt: -1 }) // or _id: -1 if createdAt not available
      .lean();

    if (!latestPayment) {
      return res.json([]); // no payments found
    }

    //  Extract only fee heads with "Pending" status
    const pendingHeads = (latestPayment.feeDetails || [])
      .filter(fd => fd.paymentStatus?.toLowerCase() === "pending")
      .map(fd => ({
        feeHeadName: fd.feeHead,
        originalAmount: fd.originalAmount || 0,
        pendingAmount: fd.pendingAmount || 0,
      }));

    //  Return the pending fee head list
    res.json(pendingHeads);
  } catch (err) {
    console.error("Error fetching pending fee heads:", err);
    res.status(500).json({ message: "Error fetching latest pending fee heads" });
  }
};





// ================== Export All ==================
module.exports = {
  getAllPayments,
  getLatestPaymentId,
  createPayment,
  updatePayment,
  deletePayment,
  getAllStudents,
  getFeeAmount,
  getSectionsByClass,
  getStudentsByClassAndSection,
  getAllClasses,
  checkDuplicatePayment,
  getPreviousPending,
  getClassFeeStructure,
  getFeeStructureByClassAndSession,
  populateFeeAmounts,
  generateNextPaymentId,
  getPendingFeeHeads,
};
