import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usage from "./pages/Usage";
import Keys from "./pages/Keys";
import APIs from "./pages/APIs"; // 🔥 ADD THIS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/keys" element={<Keys />} />

        {/* 🔥 ADD THIS ROUTE */}
        <Route path="/apis" element={<APIs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;