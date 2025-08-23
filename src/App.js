import { useState } from "react";
import Login from "./components/Login";
import AdminPage from "./components/AdminPage";
import ChefPage from "./components/ChefPage";
import UserPage from "./components/UserPage";

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
    <div style={{ padding: "20px" }}>
      {role === "admin" && <AdminPage />}
      {role === "chef" && <ChefPage />}
      {role === "user" && <UserPage />}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Đăng xuất
      </button>
    </div>
  );
}
