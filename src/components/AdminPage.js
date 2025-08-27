import { useState } from "react";
import { Button, Nav } from "react-bootstrap";
import "./AdminPage.css";

import UserManagement from "./UserManagement";
import DashboardPage from "./DashBoardPage";

export default function AdminPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin-wrapper">
      <div className="topbar">
        <h4 className="brand">RecipeBook Admin</h4>
        <Button variant="danger" size="sm" onClick={onLogout}>
          Đăng xuất
        </Button>
      </div>

      <div className="main-layout">
        <div className="sidebar">
          <Nav className="flex-column">
            <Nav.Link
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              List User
            </Nav.Link>
          </Nav>
        </div>

        <div className="content p-4">
          {activeTab === "dashboard" && <DashboardPage />}
          {activeTab === "users" && <UserManagement />}
        </div>
      </div>
    </div>
  );
}
