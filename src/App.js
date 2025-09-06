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
import Layout from "./component/Layout";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import DailyCollection from "./reports/DailyCollection";
import DailyCollectionUser from "./reports/DailyCollectionUser";
import ClassSummary from "./reports/ClassSummary";
import StudentHistory from "./reports/StudentHistory";
import OutstandingFees from "./reports/OutstandingFees";
import FeeHeadSummary from "./reports/FeeHeadSummary";
import TransportReport from "./reports/TransportReport";





function App() {
  return (
    <Routes>
   
      <Route path="/HomePage" element={<HomePage/>} />
      <Route path="/" element={<Layout/>} />
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
      <Route path="/Layout" element={<Layout/>} />
      <Route path="/Header" element={<Header/>} />
      <Route path="/DailyCollection" element={<DailyCollection/>} />
      <Route path="/DailyCollectionUser" element={<DailyCollectionUser/>} />
      <Route path="/ClassSummary" element={<ClassSummary/>} />
      <Route path="/StudentHistory" element={<StudentHistory/>} />
      <Route path="/OutstandingFees" element={<OutstandingFees/>} />
      <Route path="/FeeHeadSummary" element={<FeeHeadSummary/>} />
      <Route path="/TransportReport" element={<TransportReport/>} />

    </Routes>
  );
}

export default App;
