import React from "react";
import { Routes, Route } from "react-router-dom";
import ClassesMaster from "./component/ClassesMaster";
import ClassesList from "./component/ClassesList";
import HomePage from "./component/HomePage";
import FeeHeadsMaster from "./component/FeeHeadsMaster";
import FeeHeadsList from "./component/FeeHeadsList";
import AcademicSessionMaster from "./component/AcademicSessionMaster";
import AcademicSessionList from "./component/AcademicSessionList";
import FeeStructureMaster from "./component/FeeStructureMaster";
import FeeStructureList from "./component/FeeStructureList";
import TransportRoutesMaster from "./component/TransportRoutesMaster";
import TransportRoutesList from "./component/TransportRoutesList";
import UsersList from "./component/UsersList";
import UsersMaster from "./component/UsersMaster";
import StudentList from "./component/StudentList";
import StudentMaster from "./component/StudentMaster";
import PaymentsMaster from "./component/PaymentsMaster";
import PaymentsList from "./component/PaymentsList";
import Dashboard from "./component/Dashboard";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import DailyCollection from "./reports/DailyCollection";
import DailyCollectionUser from "./reports/DailyCollectionUser";
import ClassSummary from "./reports/ClassSummary";
import StudentPaymentHistory from "./reports/StudentPaymentHistory";
import OutstandingFees from "./reports/OutstandingFees";
import FeeHeadsReport from "./reports/FeeHeadsReport";
import TransportReport from "./reports/TransportReport";
import ReportsDashboard from "./reports/ReportsDashboard";
import IdCardForm from "./component/IdCardForm";
import UdiseForm from "./component/UdiseForm";
import { Toaster } from "react-hot-toast";
import AdminManagement from "./rollebased/AdminManagement";
import AdminLogin from "./rollebased/AdminLogin";
import EditProfile from "./rollebased/EditProfile";
import ChangePassword from "./rollebased/ChangePassword";




function App() {
  return (
    <>
    <Routes>
   
      <Route path="/HomePage" element={<HomePage/>} />
      <Route path="/ClassesMaster" element={<ClassesMaster />} />
      <Route path="/ClassesList" element={<ClassesList />} />
      <Route path="/FeeHeadsMaster" element={<FeeHeadsMaster/>} />
      <Route path="/FeeHeadsList" element={<FeeHeadsList/>} />
      <Route path="/AcademicSessionMaster" element={<AcademicSessionMaster/>} />
      <Route path="/AcademicSessionList" element={<AcademicSessionList/>} />
      <Route path="/FeeStructureMaster" element={<FeeStructureMaster/>} />
      <Route path="/FeeStructureList" element={<FeeStructureList/>} />
      <Route path="/TransportRoutesMaster" element={<TransportRoutesMaster/>} />
      <Route path="/TransportRoutesList" element={<TransportRoutesList/>} />
      <Route path="/UsersMaster" element={<UsersMaster/>} />
      <Route path="/UserList" element={<UsersList/>} />
      <Route path="/StudentList" element={<StudentList/>} />
      <Route path="/StudentMaster" element={<StudentMaster/>} />
      <Route path="/PaymentsMaster" element={<PaymentsMaster/>} />
      <Route path="/PaymentsList" element={<PaymentsList/>} />
      <Route path="/Sidebar" element={<Sidebar/>} />
      <Route path="/Dashboard" element={<Dashboard/>} />
      <Route path="/Header" element={<Header/>} />
      <Route path="/DailyCollection" element={<DailyCollection/>} />
      <Route path="/DailyCollectionUser" element={<DailyCollectionUser/>} />
      <Route path="/ClassSummary" element={<ClassSummary/>} />
      <Route path="/StudentPaymentHistory" element={<StudentPaymentHistory/>} />
      <Route path="/OutstandingFees" element={<OutstandingFees/>} />
      <Route path="/FeeHeadsReport" element={<FeeHeadsReport/>} />
      <Route path="/TransportReport" element={<TransportReport/>} />
      <Route path="/ReportsDashboard" element={<ReportsDashboard/>} />
      <Route path="/AdminManagement" element={<AdminManagement/>} />
      <Route path="/IdCardForm" element={<IdCardForm/>} />
      <Route path="/UdiseForm" element={<UdiseForm/>} />
      <Route path="/" element={<AdminLogin/>} />
      <Route path="/EditProfile" element={<EditProfile/>} />
      <Route path="/ChangePassword" element={<ChangePassword/>} />

    </Routes>
        <Toaster
          reverseOrder={false}
          toastOptions={{
            style: { fontWeight: 600 },
            success: {
              icon: "✅",
              style: { background: "#d1fae5", color: "#065f46" }, // green background
            },
            error: {
              icon: "❌",
              style: { background: "#fee2e2", color: "#991b1b" }, // red background
            },
          }}
        />


   </>
    );
}

export default App;
