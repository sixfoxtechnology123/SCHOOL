import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useNavigate, useLocation } from "react-router-dom";

const FeeStructureMaster = () => {
  const [feeData, setFeeData] = useState({
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

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch next FeeStructID
  const fetchNextId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fees/latest");
      setFeeData(prev => ({ ...prev, feeStructId: res.data?.feeStructId || "FEES001" }));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch classes and fee heads
  const fetchDropdownData = async () => {
    try {
      const cls = await axios.get("http://localhost:5000/api/classes");
      const fh = await axios.get("http://localhost:5000/api/feeheads");
      setClasses(cls.data || []);
      setFeeHeads(fh.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch routes dynamically if Transport is selected
  const fetchRoutes = async (feeHeadId, selectedRouteId = "") => {
    const selectedFeeHead = feeHeads.find(fh => fh.feeHeadId === feeHeadId);
    if (!selectedFeeHead || selectedFeeHead.feeHeadName.toLowerCase() !== "transport") {
      setRoutes([]);
      setFeeData(prev => ({ ...prev, routeId: "" }));
      setShowRouteDropdown(false);
      return;
    }

    setShowRouteDropdown(true);

    try {
      const res = await axios.get("http://localhost:5000/api/fees/transport/routes");
      const routeList = res.data.map(r => ({
        routeId: r.routeId,
        routeName: r.routeName,
        vanCharge: r.vanCharge
      }));
      setRoutes(routeList);

      // If editing, keep the current route selected
      if (selectedRouteId) {
        setFeeData(prev => ({ ...prev, routeId: selectedRouteId }));
      }
    } catch (err) {
      console.error(err);
      setRoutes([]);
    }
  };

  // Fetch amount dynamically
  const fetchAmount = async (classId, feeHeadId, routeId) => {
    if (!classId || !feeHeadId) return;

    try {
      let amount = 0;
      const selectedFeeHead = feeHeads.find(fh => fh.feeHeadId === feeHeadId);

      if (selectedFeeHead && selectedFeeHead.feeHeadName.toLowerCase() === "transport" && routeId) {
        const route = routes.find(r => r.routeId === routeId);
        amount = route ? route.vanCharge : 0;
      } else {
        const url = `http://localhost:5000/api/fees/get-amount?classId=${classId}&feeHeadId=${feeHeadId}`;
        const res = await axios.get(url);
        amount = res.data.amount || 0;
      }

      setFeeData(prev => ({ ...prev, amount }));
    } catch (err) {
      console.error(err);
      setFeeData(prev => ({ ...prev, amount: "" }));
    }
  };

  // Load initial data
  useEffect(() => {
    fetchDropdownData().then(() => {
      if (location.state?.feeItem) {
        const f = location.state.feeItem;
        setFeeData(f);
        setIsEditMode(true);
        fetchRoutes(f.feeHeadId, f.routeId); // Ensure route dropdown shows correct value
      } else {
        fetchNextId();
        setIsEditMode(false);
      }
    });
  }, [location.state]);

  // Update routes when feeHeadId changes
  useEffect(() => {
    if (feeData.feeHeadId) {
      fetchRoutes(feeData.feeHeadId);
    }
  }, [feeData.feeHeadId, feeHeads]);

  // Update amount when classId, feeHeadId, or routeId changes
  useEffect(() => {
    fetchAmount(feeData.classId, feeData.feeHeadId, feeData.routeId);
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
    }
  };

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
