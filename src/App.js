import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminPage from "./components/AdminPage";
import ChefPage from "./components/ChefPage";
import UserPage from "./components/UserPage";
import EditFoodPage from "./components/EditFoodPage";
import CreateFoodPage from "./components/CreateFoodPage";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role")?.toLowerCase());

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
  };

  return (
    <BrowserRouter>
      <div>
        <Routes>
          
          <Route
            path="/login"
            element={
              !role ? (
                <Login onLogin={(r) => setRole(r.toLowerCase())} />
              ) : (
                <Navigate to={`/${role}`} replace />
              )
            }
          />

          
          <Route
            path="/admin"
            element={
              role === "admin" ? (
                <AdminPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          
          <Route
            path="/chef"
            element={
              role === "chef" ? <ChefPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/chef/food/create"
            element={
              role === "chef" ? (
                <CreateFoodPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/chef/food/edit/:id"
            element={
              role === "chef" ? (
                <EditFoodPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* User */}
          <Route
            path="/user/*"
            element={
              role === "user" ? <UserPage onLogout={handleLogout}/> : <Navigate to="/login" replace />
            }
          />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Nút đăng xuất (chỉ hiện khi đã login) */}
        {role === "chef" && (
          <button onClick={handleLogout} style={{ marginTop: "20px" }}>
            Đăng xuất
          </button>
        )}
      </div>
    </BrowserRouter>
  );
}
