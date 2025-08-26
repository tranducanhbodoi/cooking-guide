import React, { useState } from "react";
import { Button } from "react-bootstrap";

const defaultAvatar = "https://i.pravatar.cc/80?img=1";

export default function AvatarMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  const name = user?.name || "Guest";
  const email = user?.email || "guest@example.com";
  
  return (
    <div className="avatar-wrapper">
      <button className="avatar-btn" onClick={() => setOpen((o) => !o)}>
        <img className="avatar-img" src={defaultAvatar} alt="avatar" />
      </button>

      {open && (
        <div className="avatar-dropdown">
          <div className="d-flex align-items-center mb-3">
            <img className="avatar-img me-2" src={defaultAvatar} alt="avatar" />
            <div>
              <div className="fw-semibold">{name}</div>
              <div className="text-muted small">{email}</div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline-secondary"
            className="w-100"
            onClick={onLogout}
          >
            Đăng xuất
          </Button>
        </div>
      )}
    </div>
  );
}
