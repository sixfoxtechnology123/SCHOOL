// pages/FeeStructureMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const FeeStructureMaster = () => {
  const [feeData, setFeeData] = useState({
    _id: "",
    feeStructId: "",
    classId: "",
    feeHeadId: "",
    routeId: "",
    amount: "",
    academicSession: "",
    distance: "",
  });

  const [month, setMonth] = useState(""); // NEW
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const [academicSessions, setAcademicSessions] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const feeItem = location.state?.feeItem || null;

  const romanToNumber = (roman) => {
    const map = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };
    return map[roman] || 0;
  };

  const sortClasses = (clsArray) => {
    return clsArray.sort((a, b) => {
      const romanA = a.className.split("-")[1]?.trim();
      const romanB = b.className.split("-")[1]?.trim();
      return romanToNumber(romanA) - romanToNumber(romanB);
    });
  };

  const fetchDropdownData = async () => {
    try {
      const [clsRes, fhRes, acadRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes"),
        axios.get("http://localhost:5000/api/feeheads"),
        axios.get("http://localhost:5000/api/fees/academics")
      ]);

      const uniqueClasses = Array.from(new Map(clsRes.data.map(c => [c.className, c])).values());
      setClasses(sortClasses(uniqueClasses));
      setFeeHeads(fhRes.data || []);
      setAcademicSessions(acadRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/latest");
      setFeeData(prev => ({ ...prev, feeStructId: res.data?.feeStructId || "FEES001" }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoutesBySession = async (session) => {
    if (!session) return setRoutes([]);
    try {
      const res = await axios.get(`http://localhost:5000/api/fees/transport/by-session?academicSession=${session}`);
      setRoutes(res.data || []);
    } catch (err) {
      console.error(err);
      setRoutes([]);
    }
  };

  const fetchAmount = async (classId, feeHeadId) => {
    if (!classId || !feeHeadId) return;
    try {
      const className = classes.find(c => c.classId === classId)?.className;
      const feeHeadName = feeHeads.find(f => f.feeHeadId === feeHeadId)?.feeHeadName;
      const res = await axios.get("http://localhost:5000/api/fees/get-amount", {
        params: { className, feeHeadName }
      });
      setFeeData(prev => ({ ...prev, amount: res.data.amount || '' }));
    } catch (err) {
      console.error(err);
      setFeeData(prev => ({ ...prev, amount: 0 }));
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchDropdownData();

      const savedSession = localStorage.getItem("selectedAcademicSession");
      if (savedSession) {
        setFeeData(prev => ({ ...prev, academicSession: savedSession }));
        await fetchRoutesBySession(savedSession);
      }

      if (feeItem) {
        setIsEditMode(true);
        setFeeData({
          _id: feeItem._id,
          feeStructId: feeItem.feeStructId,
          classId: feeItem.classId,
          feeHeadId: feeItem.feeHeadId,
          routeId: feeItem.routeId || "",
          amount: feeItem.amount || 0,
          academicSession: savedSession || feeItem.academicSession || "",
          distance: feeItem.distance || "",
        });
        setMonth(feeItem.month || ""); // NEW
      } else {
        fetchNextId();
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (feeData.academicSession) {
      fetchRoutesBySession(feeData.academicSession);
      setFeeData(prev => ({ ...prev, routeId: "", distance: "" }));
      localStorage.setItem("selectedAcademicSession", feeData.academicSession);
    } else {
      setRoutes([]);
      setFeeData(prev => ({ ...prev, routeId: "", distance: "" }));
    }
  }, [feeData.academicSession]);

  const isTransportFee = feeHeads.find(fh => fh.feeHeadId === feeData.feeHeadId)?.feeHeadName.toLowerCase() === "transport";
  const isTuitionFee = feeHeads.find(fh => fh.feeHeadId === feeData.feeHeadId)?.feeHeadName.toLowerCase().includes("tuition"); // FIXED

  useEffect(() => {
    if (isTransportFee) {
      fetchRoutesBySession(feeData.academicSession);
    } else {
      setRoutes([]);
      setFeeData(prev => ({ ...prev, routeId: "", distance: "" }));
    }
  }, [feeData.feeHeadId, feeData.academicSession]);

useEffect(() => {
  if (!feeData.classId || !feeData.feeHeadId) return;

  const selectedFeeHead = feeHeads.find(fh => fh.feeHeadId === feeData.feeHeadId);
  const isTransportFee = selectedFeeHead?.feeHeadName.toLowerCase() === "transport";
  const isTuitionFee = selectedFeeHead?.feeHeadName.toLowerCase().includes("tuition");

  if (isTransportFee) {
    const selectedRoute = routes.find(r => r.routeId === feeData.routeId);
    setFeeData(prev => ({
      ...prev,
      amount: selectedRoute ? selectedRoute.vanCharge : '',
      distance: selectedRoute?.distance || ''
    }));
  } else if (!isTuitionFee) {
    fetchAmount(feeData.classId, feeData.feeHeadId);
  } else if (isTuitionFee && isEditMode) {
    // For Tuition Fee in edit mode, keep existing amount and month
    setFeeData(prev => ({
      ...prev,
      amount: feeItem.amount || '',
    }));
    setMonth(feeItem.month || '');
  } else {
    // New Tuition Fee entry → reset
    setFeeData(prev => ({ ...prev, amount: '' }));
    setMonth('');
  }
}, [feeData.classId, feeData.feeHeadId, feeData.routeId, routes]);



const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "feeHeadId") {
    const selectedFeeHead = feeHeads.find(fh => fh.feeHeadId === value);
    const isTuition = selectedFeeHead?.feeHeadName.toLowerCase().includes("tuition");

    setFeeData(prev => ({
      ...prev,
      [name]: value,
      amount: isTuition ? "" : prev.amount,
    }));

    if (isTuition) setMonth(""); // reset month
  } else {
    setFeeData(prev => ({ ...prev, [name]: value }));
  }

  if (name === "academicSession") localStorage.setItem("selectedAcademicSession", value);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...feeData, month: isTuitionFee ? month : undefined };

      const classObj = classes.find(c => c.classId === feeData.classId);
      const feeHeadObj = feeHeads.find(f => f.feeHeadId === feeData.feeHeadId);
      payload.className = classObj?.className || "";
      payload.feeHeadName = feeHeadObj?.feeHeadName || "";

      if (isTransportFee) {
        const selectedRoute = routes.find(r => r.routeId === feeData.routeId);
        payload.distance = selectedRoute ? `${selectedRoute.distance} KM` : "";
      }

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/fees/${feeData._id}`, payload);
        toast.success("Fee Structure updated!");
       
      } else {
        await axios.post("http://localhost:5000/api/fees", payload);
        toast.success("Fee Structure saved!");
        
      }

      navigate("/FeeStructureList", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error saving Fee Structure");
    }
  };

  // if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Fee Structure" : "Fee Structure"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          <div>
            <label className="block font-medium">Fee Struct ID</label>
            <input type="text" name="feeStructId" value={feeData.feeStructId} readOnly className="w-full border border-gray-300 p-1 rounded bg-gray-100" />
          </div>

          <div>
            <label className="block font-medium">Academic Session</label>
            <select name="academicSession" value={feeData.academicSession} onChange={handleChange} className="w-full border border-gray-300 p-1 rounded" required>
              <option value="">--Select Academic Session--</option>
              {academicSessions.map(session => <option key={session._id} value={session.year}>{session.year}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium">Class</label>
            <select name="classId" value={feeData.classId} onChange={handleChange} className="w-full border border-gray-300 p-1 rounded" required>
              <option value="">--Select--</option>
              {classes.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium">Fee Head</label>
            <select name="feeHeadId" value={feeData.feeHeadId} onChange={handleChange} className="w-full border border-gray-300 p-1 rounded" required>
              <option value="">--Select--</option>
              {feeHeads.map(fh => <option key={fh.feeHeadId} value={fh.feeHeadId}>{fh.feeHeadName}</option>)}
            </select>
          </div>

          {isTransportFee && (
            <div>
              <label className="block font-medium">Distance (KM)</label>
              <select name="routeId" value={feeData.routeId} onChange={handleChange} className="w-full border border-gray-300 p-1 rounded" required>
                <option value="">--Select Distance--</option>
                {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.distance}</option>)}
              </select>
            </div>
          )}

{/* {isTuitionFee && (
  <div>
    <label className="block font-medium">Month</label>
    <select
      name="month"
      value={month}
      onChange={(e)=>setMonth(e.target.value)}
      className="w-full border border-gray-300 p-1 rounded"
      required
    >
      <option value="">--Select Month--</option>
      {months.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  </div>
)} */}



          <div>
            <label className="block font-medium">Amount</label>
            <input type="number" name="amount" value={feeData.amount} onChange={handleChange} className="w-full border border-gray-300 p-1 rounded" required />
          </div>

          <div className="flex justify-between">
            <BackButton />
            <button type="submit" className={`px-4 py-1 rounded text-white ${isEditMode ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"}`}>
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeStructureMaster;
