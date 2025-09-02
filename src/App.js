import React from "react";
import { Routes, Route } from "react-router-dom";
import ClassesMaster from "./component/ClassesMaster";
import ClassesList from "./component/ClassesList";
import HomePage from "./component/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/ClassesMaster" element={<ClassesMaster />} />
      <Route path="/ClassesList" element={<ClassesList />} />
     
    </Routes>
  );
}

export default App;
