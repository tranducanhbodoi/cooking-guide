import { NavLink } from "react-router-dom";
import { Box, Heart, Collection } from "react-bootstrap-icons";
import "./Sidebar.css";

const items = [
  { to: "/user/all", label: "Sản phẩm", icon: <Box size={20} /> },
  { to: "/user/favorite", label: "Yêu thích", icon: <Heart size={20} /> },
  // { to: "/user/collections", label: "Bộ sưu tập", icon: <Collection size={20} /> },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <span className="icon">{it.icon}</span>
          <span className="label">{it.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
