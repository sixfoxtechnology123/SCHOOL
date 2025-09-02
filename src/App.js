import React from "react";
import { Routes, Route } from "react-router-dom";
import ClassesMaster from "./component/ClassesMaster";
import ClassesList from "./component/ClassesList";
import HomePage from "./component/HomePage";
import FeeHeadsMaster from "./component/FeeHeadsMaster";
import FeeHeadsList from "./component/FeeHeadsList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/ClassesMaster" element={<ClassesMaster />} />
      <Route path="/ClassesList" element={<ClassesList />} />
      <Route path="/FeeHeadsMaster" element={<FeeHeadsMaster/>} />
      <Route path="/FeeHeadsList" element={<FeeHeadsList/>} />
     
    </Routes>
  );
}

export default App;
