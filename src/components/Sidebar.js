import { ListGroup } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/user/all", label: "All" },
  { to: "/user/mon-chinh", label: "Món chính" },
  { to: "/user/mon-phu", label: "Món phụ" },
  { to: "/user/do-uong", label: "Đồ uống" },
  { to: "/user/favorite", label: "Yêu thích" },
  { to: "/user/collections", label: "Collections" },
];

export default function Sidebar() {
  return (
    <ListGroup>
      {items.map((it) => (
        <ListGroup.Item key={it.to} className="p-0">
          <NavLink
            to={it.to}
            className={({ isActive }) =>
              `d-block px-3 py-2 text-decoration-none ${
                isActive ? "active-link" : ""
              }`
            }
          >
            {it.label}
          </NavLink>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
