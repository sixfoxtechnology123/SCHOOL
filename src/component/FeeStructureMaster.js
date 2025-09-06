import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate, useLocation } from "react-router-dom";

const FeeStructureMaster = () => {
  const [feeData, setFeeData] = useState({
    _id: "",             // <-- Add _id to state
    feeStructId: "",
    classId: "",
    feeHeadId: "",
    routeId: "",
    amount: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const feeItem = location.state?.feeItem || null;

  // Fetch classes and fee heads
  const fetchDropdownData = async () => {
    try {
      const [clsRes, fhRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes"),
        axios.get("http://localhost:5000/api/feeheads")
      ]);
      setClasses(clsRes.data || []);
      setFeeHeads(fhRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch next FeeStructID
  const fetchNextId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/latest");
      setFeeData(prev => ({ ...prev, feeStructId: res.data?.feeStructId || "FEES001" }));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch transport routes
  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/transport/routes");
      const routeList = res.data.map(r => ({
        routeId: r.routeId,
        routeName: r.routeName,
        vanCharge: r.vanCharge
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

  // Fetch amount dynamically from backend
  const fetchAmount = async (classId, feeHeadId, routeId) => {
    if (!classId || !feeHeadId) return;
    try {
      const res = await axios.get("http://localhost:5000/api/fees/get-amount", {
        params: { classId, feeHeadId, routeId: routeId || undefined }
      });
      setFeeData(prev => ({ ...prev, amount: res.data.amount || 0 }));
    } catch (err) {
      console.error(err);
      setFeeData(prev => ({ ...prev, amount: 0 }));
    }
  };

  // Initialize everything
  useEffect(() => {
    const init = async () => {
      await fetchDropdownData();

      if (feeItem) {
        setIsEditMode(true);

        // Check if fee head is transport
        const selectedFeeHead = feeItem.feeHeadId
          ? (await axios.get("http://localhost:5000/api/feeheads")).data.find(fh => fh.feeHeadId === feeItem.feeHeadId)
          : null;

        let routeList = [];
        if (selectedFeeHead && selectedFeeHead.feeHeadName.toLowerCase() === "transport") {
          routeList = await fetchRoutes();
        }

        setFeeData({
          _id: feeItem._id, // <-- Important: include _id for update
          feeStructId: feeItem.feeStructId,
          classId: feeItem.classId,
          feeHeadId: feeItem.feeHeadId,
          routeId: feeItem.routeId || "",
          amount: feeItem.amount || (selectedFeeHead && selectedFeeHead.feeHeadName.toLowerCase() === "transport" ? (routeList.find(r => r.routeId === feeItem.routeId)?.vanCharge || 0) : 0)
        });
      } else {
        fetchNextId();
      }

      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show/hide route dropdown when feeHead changes
  useEffect(() => {
    const selectedFeeHead = feeHeads.find(fh => fh.feeHeadId === feeData.feeHeadId);
    if (selectedFeeHead && selectedFeeHead.feeHeadName.toLowerCase() === "transport") {
      fetchRoutes();
    } else {
      setRoutes([]);
      setShowRouteDropdown(false);
      setFeeData(prev => ({ ...prev, routeId: "", amount: prev.amount || 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeData.feeHeadId]);

  // Update amount whenever class, feeHead, or route changes
  useEffect(() => {
    const selectedFeeHead = feeHeads.find(fh => fh.feeHeadId === feeData.feeHeadId);
    if (!selectedFeeHead) return;

    if (selectedFeeHead.feeHeadName.toLowerCase() === "transport") {
      const selectedRoute = routes.find(r => r.routeId === feeData.routeId);
      setFeeData(prev => ({ ...prev, amount: selectedRoute ? selectedRoute.vanCharge : 0 }));
    } else {
      fetchAmount(feeData.classId, feeData.feeHeadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeData.classId, feeData.feeHeadId, feeData.routeId, routes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/fees/${feeData._id}`, feeData);
        alert("Fee Structure updated!");
      } else {
        await axios.post("http://localhost:5000/api/fees", feeData);
        alert("Fee Structure saved!");
      }
      navigate("/FeeStructureList", { replace: true });
    } catch (err) {
      alert("Error saving Fee Structure");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

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

          {showRouteDropdown && (
            <div>
              <label className="block font-medium">Route</label>
              <select name="routeId" value={feeData.routeId} onChange={handleChange} className="w-full border border-gray-300 p-1 rounded">
                <option value="">--Select Route--</option>
                {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.routeName}</option>)}
              </select>
            </div>
          )}

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
