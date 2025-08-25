import { useState } from "react";
import Login from "./components/Login";
import AdminPage from "./components/AdminPage";
import ChefPage from "./components/ChefPage";
import UserPage from "./components/UserPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EditFoodPage from "./components/EditFoodPage";
import CreateFoodPage from "./components/CreateFoodPage";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role")?.toLowerCase());

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
  };

  if (!role) {
    return <Login onLogin={(r) => setRole(r.toLowerCase())} />;
  }

  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        {role === "admin" && <AdminPage />}
        {role === "chef" && (
          <Routes>
            <Route path="/chef" element={<ChefPage />} />
            <Route path="/chef/food/create" element={<CreateFoodPage />} />
            <Route path="/chef/food/edit/:id" element={<EditFoodPage />} />
            <Route path="*" element={<Navigate to="/chef" replace />} />
          </Routes>
        )}
        {role === "user" && <UserPage />}

        <button onClick={handleLogout} style={{ marginTop: "20px" }}>
          Đăng xuất
        </button>
      </div>
    </BrowserRouter>

  );
}
