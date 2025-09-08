// pages/TransportRoutesMaster.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../component/BackButton";
import { useLocation, useNavigate } from "react-router-dom";

const TransportRoutesMaster = () => {
  const [routeData, setRouteData] = useState({
    routeId: "",
    distance: "",
    vanCharge: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-generate next Route ID
  const fetchNextRouteId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transportroutes/latest");
      const nextId = res.data?.routeId || "TRANSPORT001";
      setRouteData((prev) => ({ ...prev, routeId: nextId }));
    } catch (err) {
      console.error("Error getting Route ID:", err);
    }
  };

  useEffect(() => {
    if (location.state?.routeItem) {
      const r = location.state.routeItem;
      setIsEditMode(true);
      setRouteData({
        _id: r._id,
        routeId: r.routeId || "",
        distance: r.distance || "",
        vanCharge: r.vanCharge || "",
      });
    } else {
      fetchNextRouteId();
      setIsEditMode(false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRouteData({ ...routeData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/transportroutes/${routeData._id}`,
          routeData
        );
        alert("Route updated successfully!");
        navigate("/TransportRoutesList", { replace: true });
      } else {
        await axios.post("http://localhost:5000/api/transportroutes", routeData);
        alert("Route saved successfully!");
        const res = await axios.get("http://localhost:5000/api/transportroutes/latest");
        setRouteData({
          routeId: res.data?.routeId || "TRANSPORT001",
          distance: "",
          vanCharge: "",
        });
        navigate("/TransportRoutesList", { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving route");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isEditMode ? "Update Route" : "Transport Routes"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          {/* Route ID */}
          <div>
            <label className="block font-medium">Route ID</label>
            <input
              type="text"
              name="routeId"
              value={routeData.routeId}
              readOnly
              className="w-full border border-gray-300 p-1 rounded bg-gray-100"
            />
          </div>

          {/* Distance (Dropdown) */}
          <div>
            <label className="block font-medium">Distance (KM)</label>
            <select
              name="distance"
              value={routeData.distance}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            >
              <option value="">-- Select Range --</option>
              <option value="0-5">0-5 KM</option>
              <option value="6-10">6-10 KM</option>
              <option value="11-15">11-15 KM</option>
              <option value="16-20">16-20 KM</option>
              <option value="21-25">21-25 KM</option>
              <option value="26-30">26-30 KM</option>
              <option value="31-35">31-35 KM</option>
              <option value="36-40">36-40 KM</option>
            </select>
          </div>

          {/* Van Charge */}
          <div>
            <label className="block font-medium">Van Charge</label>
            <input
              type="number"
              name="vanCharge"
              value={routeData.vanCharge}
              onChange={handleChange}
              className="w-full border border-gray-300 p-1 rounded"
              required
            />
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

export default TransportRoutesMaster;
