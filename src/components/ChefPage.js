import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
// Dùng lại css có class .chip .chip.active .tag-group .preview-card .preview-cover ...
import "./ChefPage.css"; // hoặc "./ChefPage.css" nếu bạn đã có các class tương tự

export default function ChefPage({ onLogout }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // NEW: tag state
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

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

  // NEW: load tags từ API (nếu lỗi thì sẽ fallback)
  const loadTags = async () => {
    try {
      const res = await fetch("http://localhost:9999/tags");
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        setAllTags(data.map(t => ({ key: t.key, label: t.label })));
        return;
      }
    } catch (_) { /* ignore */ }
    // fallback từ foods (khi foods đã có)
    // gọi sau khi foods có data
  };

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    loadTags();
  }, []);

  // Fallback khi API /tags không có: suy ra từ foods
  useEffect(() => {
    if (!allTags.length && foods.length) {
      const keys = new Set();
      foods.forEach(f => (f.tags || []).forEach(k => keys.add(k)));
      const fromFoods = Array.from(keys).map(k => ({ key: k, label: k }));
      setAllTags(fromFoods);
    }
  }, [foods, allTags.length]);

  // helpers
  const toggleTag = (key) => {
    setSelectedTags(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setQ("");
  };

  // Filter theo text + tag (AND: phải chứa TẤT CẢ tag đã chọn)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return foods.filter(f => {
      const byText = !s
        || (f.title || "").toLowerCase().includes(s)
        || (Array.isArray(f.tags) && f.tags.join(" ").toLowerCase().includes(s));

      const tags = Array.isArray(f.tags) ? f.tags : [];
      const byTags = selectedTags.length === 0
        ? true
        : selectedTags.every(t => tags.includes(t));

      return byText && byTags;
    });
  }, [q, foods, selectedTags]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    try {
      const res = await fetch(`http://localhost:9999/food/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFoods(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      alert("Không thể xóa.");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="page-hero mb-4 d-flex align-items-center justify-content-between flex-wrap">
        <div>
          <h2 className="m-0">Quản lý món ăn (Chef)</h2>
          <div className="text-muted">Tạo, sửa, xóa, lọc theo tag</div>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to="/chef/food/create">+ Tạo món mới</Link>
          {onLogout && (
            <button onClick={onLogout} className="btn btn-outline-secondary">Đăng xuất</button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="soft-card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-5">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc tag..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-lg-7">
            <div className="d-flex align-items-center justify-content-between">
              <div className="tag-group">
                {allTags.map(t => (
                  <span
                    key={t.key}
                    className={`chip ${selectedTags.includes(t.key) ? "active" : ""}`}
                    onClick={() => toggleTag(t.key)}
                    title={t.label}
                  >
                    {t.label} {/* hoặc `${t.label} (${t.key})` */}
                  </span>
                ))}
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                Clear
              </button>
            </div>
            {!!selectedTags.length && (
              <div className="small text-muted mt-2">
                Đang lọc theo: {selectedTags.join(", ")}
              </div>
            )}
          </div>
        </div>
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
                  {Array.isArray(f.tags) && f.tags.map((t) => (
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
