// pages/TransportRoutesList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import BackButton from "../component/BackButton";
import Sidebar from '../component/Sidebar';
import Header from "./Header";

const TransportRoutesList = () => {
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transportroutes");
      setRoutes(res.data || []);
    } catch (e) {
      console.error("Failed to fetch routes:", e);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [location.key]);

  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/transportroutes/${id}`);
      setRoutes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete route:", err);
    }
  };

  return (
  <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar/>
     <div className="flex-1 overflow-y-auto p-3">
        {/*  Added Header */}
      <Header/>
    <div className="p-2 bg-white shadow-md rounded-md">
      <div className="bg-green-50 border border-green-300 rounded-lg shadow-md p-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">Transport Routes</h2>
          <div className="flex gap-4">
            <BackButton />
            <button
              onClick={() => navigate("/TransportRoutesMaster")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold whitespace-nowrap"
            >
              Add Route
            </button>
          </div>
        </div>
      </div>

      <table className="w-full table-auto border border-green-500">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="border border-green-500 px-2 py-1">Route ID</th>
            <th className="border border-green-500 px-2 py-1">Route Name</th>
            <th className="border border-green-500 px-2 py-1">Van Charge</th>
            <th className="border border-green-500 px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-center">
          {routes.length > 0 ? (
            routes.map((r) => (
              <tr key={r._id} className="hover:bg-gray-100 transition">
                <td className="border border-green-500 px-2 py-1">{r.routeId}</td>
                <td className="border border-green-500 px-2 py-1">{r.routeName}</td>
                <td className="border border-green-500 px-2 py-1">{r.vanCharge}</td>
                <td className="border border-green-500 px-2 py-1 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() =>
                        navigate("/TransportRoutesMaster", { state: { routeItem: r } })
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteRoute(r._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No routes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  </div>
  );
};

export default TransportRoutesList;
