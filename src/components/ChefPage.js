import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChefPage.css";

export default function ChefPage({ onLogout }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // tag state
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // info chef đang đăng nhập 
  const [me, setMe] = useState(null); // { id, name, email, role }

  const nav = useNavigate();

  //Helpers lấy current user từ localStorage / API
  const resolveCurrentUser = async () => {
    
    const storedUserId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("email");
    const storedUserJSON = localStorage.getItem("user");

    if (storedUserJSON) {
      try {
        const u = JSON.parse(storedUserJSON);
        if (u?.id) return u; // { id, name, email, role }
      } catch {}
    }
    if (storedUserId) {
      
      try {
        const res = await fetch(`http://localhost:9999/users/${storedUserId}`);
        if (res.ok) {
          const u = await res.json();
          if (u?.id) return u;
        }
      } catch {}
    }
    if (storedEmail) {
      // fallback: tìm theo email
      try {
        const res = await fetch(`http://localhost:9999/users?email=${encodeURIComponent(storedEmail)}`);
        const arr = await res.json();
        if (Array.isArray(arr) && arr[0]?.id) return arr[0];
      } catch {}
    }
    
    return null;
  };

  // ---- Load foods cho đúng chef ----
  const loadFoods = async (chefId) => {
    setLoading(true);
    try {
      // json-server hỗ trợ filter theo query param
      const res = await fetch(`http://localhost:9999/food?chefId=${encodeURIComponent(chefId)}`);
      if (res.ok) {
        const data = await res.json();
        setFoods(Array.isArray(data) ? data : []);
      } else {
        // fallback: lấy tất cả rồi filter
        const resAll = await fetch("http://localhost:9999/food");
        const all = await resAll.json();
        setFoods((Array.isArray(all) ? all : []).filter(f => String(f.chefId) === String(chefId)));
      }
    } catch (e) {
      console.error(e);
      setError("Không tải được danh sách món của bạn.");
    } finally {
      setLoading(false);
    }
  };

  //Load tags
  const loadTags = async () => {
    try {
      const res = await fetch("http://localhost:9999/tags");
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        setAllTags(data.map(t => ({ key: t.key, label: t.label })));
      }
    } catch {
    }
  };

  // Khởi tạo: xác định user rồi load foods theo chefId
  useEffect(() => {
    (async () => {
      const u = await resolveCurrentUser();
      setMe(u);
      if (!u?.id) {
        setError("Không xác định được tài khoản CHEF. Hãy đảm bảo Login đang lưu userId/email vào localStorage.");
        setLoading(false);
        return;
      }
      await Promise.all([loadFoods(u.id), loadTags()]);
    })();
  }, []);

  // Fallback tags từ foods
  useEffect(() => {
    if (!allTags.length && foods.length) {
      const keys = new Set();
      foods.forEach(f => (f.tags || []).forEach(k => keys.add(k)));
      setAllTags(Array.from(keys).map(k => ({ key: k, label: k })));
    }
  }, [foods]);

  // Toggle tag + clear
  const toggleTag = (key) => {
    setSelectedTags(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };
  const clearFilters = () => {
    setSelectedTags([]);
    setQ("");
  };

  // Filter theo text + tag 
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return foods.filter(f => {
      const byText =
        !s ||
        (f.title || "").toLowerCase().includes(s) ||
        (Array.isArray(f.tags) && f.tags.join(" ").toLowerCase().includes(s));
      const tags = Array.isArray(f.tags) ? f.tags : [];
      const byTags = selectedTags.length === 0 || selectedTags.every(t => tags.includes(t));
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
          <div className="text-muted">
            {me ? <>Đang xem món của: <strong>{me.name}</strong> ({me.email})</> : "Đang xác định tài khoản..."}
          </div>
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
                    {t.label}
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

      {/* the */}
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
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => nav(`/chef/food/edit/${f.id}`)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(f.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
