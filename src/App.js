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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
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
     
    </Routes>
  );
}

export default App;
