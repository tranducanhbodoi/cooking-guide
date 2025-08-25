import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChefPage.css"; // reuse styles

export default function ChefPage({ onLogout }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const nav = useNavigate();

  const loadFoods = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:9999/food");
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Không tải được danh sách món. Kiểm tra json-server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return foods;
    return foods.filter(
      (f) => f.title.toLowerCase().includes(s) || (Array.isArray(f.tags) && f.tags.join(" ").toLowerCase().includes(s))
    );
  }, [q, foods]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    try {
      const res = await fetch(`http://localhost:9999/food/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      alert("Không thể xóa.");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="page-hero mb-4 d-flex align-items-center justify-content-between flex-wrap">
        <div>
          <h2 className="m-0">Quản lý món ăn (Chef)</h2>
          <div className="text-muted">Tạo, sửa, xóa món ăn</div>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to="/chef/food/create">+ Tạo món mới</Link>
          {onLogout && (
            <button onClick={onLogout} className="btn btn-outline-secondary">Đăng xuất</button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc tag..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="form-control"
        />
      </div>

      {loading && <div>Đang tải...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !filtered.length && <div className="alert alert-info">Không có món nào.</div>}

      <div className="row g-3">
        {filtered.map((f) => (
          <div className="col-md-6 col-lg-4" key={f.id}>
            <div className="preview-card h-100 d-flex flex-column">
              {f.image ? (
                <img src={f.image} alt={f.title} className="preview-cover" />
              ) : (
                <div className="preview-cover d-flex align-items-center justify-content-center text-muted">No image</div>
              )}
              <div className="p-3 d-flex flex-column flex-grow-1">
                <h5 className="mb-1">{f.title}</h5>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {f.tags && f.tags.map((t) => (
                    <span key={t} className="badge text-bg-light border">{t}</span>
                  ))}
                </div>
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => nav(`/chef/food/edit/${f.id}`)}>Sửa</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(f.id)}>Xóa</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
