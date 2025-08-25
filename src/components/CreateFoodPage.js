import React, { useEffect, useState } from "react";
import "./ChefPage.css";

// --- Utilities ---
const genId = () => Math.random().toString(36).slice(2, 6) + Date.now().toString(36);
const difficulties = ["Dễ", "Trung bình", "Khó"];

export default function CreateFoodPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:9999/tags");
        const data = await res.json();
        setAllTags(data || []);
      } catch (e) {
        console.error(e);
        setAllTags([]);
      }
    })();
  }, []);

  const [form, setForm] = useState({
    title: "",
    image: "",
    tags: [],
    prepTime: 0,
    cookTime: 0,
    difficulty: "Dễ",
    ingredients: [{ id: genId(), name: "", qty: "", unit: "" }],
    steps: [{ id: genId(), text: "", images: [""] }],
  });

  // --- Helpers ---
  const updateField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleTag = (key) =>
    setForm((p) => ({
      ...p,
      tags: p.tags.includes(key) ? p.tags.filter((t) => t !== key) : [...p.tags, key],
    }));

  const addIngredient = () =>
    setForm((p) => ({ ...p, ingredients: [...p.ingredients, { id: genId(), name: "", qty: "", unit: "" }] }));
  const removeIngredient = (id) =>
    setForm((p) => ({ ...p, ingredients: p.ingredients.filter((i) => i.id !== id) }));
  const updateIngredient = (id, key, value) =>
    setForm((p) => ({
      ...p,
      ingredients: p.ingredients.map((i) => (i.id === id ? { ...i, [key]: value } : i)),
    }));

  const addStep = () => setForm((p) => ({ ...p, steps: [...p.steps, { id: genId(), text: "", images: [""] }] }));
  const removeStep = (id) => setForm((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== id) }));
  const updateStep = (id, key, value) =>
    setForm((p) => ({ ...p, steps: p.steps.map((s) => (s.id === id ? { ...s, [key]: value } : s)) }));
  const addStepImage = (stepId) =>
    setForm((p) => ({ ...p, steps: p.steps.map((s) => (s.id === stepId ? { ...s, images: [...s.images, ""] } : s)) }));
  const updateStepImage = (stepId, index, value) =>
    setForm((p) => ({
      ...p,
      steps: p.steps.map((s) =>
        s.id === stepId ? { ...s, images: s.images.map((img, i) => (i === index ? value : img)) } : s
      ),
    }));
  const removeStepImage = (stepId, index) =>
    setForm((p) => ({
      ...p,
      steps: p.steps.map((s) => (s.id === stepId ? { ...s, images: s.images.filter((_, i) => i !== index) } : s)),
    }));

  const validate = () => {
    if (!form.title.trim()) return "Vui lòng nhập tiêu đề món ăn.";
    if (!form.image.trim()) return "Vui lòng nhập URL ảnh đại diện (image).";
    if (!form.tags.length) return "Chọn ít nhất 1 tag.";
    const pt = Number(form.prepTime), ct = Number(form.cookTime);
    if (Number.isNaN(pt) || pt < 0) return "prepTime phải là số ≥ 0";
    if (Number.isNaN(ct) || ct < 0) return "cookTime phải là số ≥ 0";
    if (!form.ingredients.length || form.ingredients.some((i) => !i.name.trim()))
      return "Cần ít nhất 1 nguyên liệu và tên không được rỗng.";
    if (!form.steps.length || form.steps.some((s) => !s.text.trim()))
      return "Cần ít nhất 1 bước và nội dung bước không được rỗng.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const err = validate();
    if (err) return setError(err);
    setError("");
    setLoading(true);

    const payload = {
      id: genId(),
      title: form.title.trim(),
      image: form.image.trim(),
      tags: form.tags,
      prepTime: Number(form.prepTime),
      cookTime: Number(form.cookTime),
      difficulty: form.difficulty,
      ingredients: form.ingredients.map(({ name, qty, unit }) => ({
        name: name.trim(),
        qty: qty === "" ? 0 : isNaN(Number(qty)) ? qty : Number(qty),
        unit: unit.trim(),
      })),
      steps: form.steps.map(({ text, images }) => ({ text: text.trim(), images: (images || []).map((u) => u.trim()).filter(Boolean) })),
    };

    try {
      const res = await fetch("http://localhost:9999/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("POST /food thất bại");
      setSuccess("Tạo món ăn thành công! Bạn có thể kiểm tra trong danh sách /food.");
      setForm((f) => ({
        ...f,
        title: "",
        image: "",
        prepTime: 0,
        cookTime: 0,
        ingredients: [{ id: genId(), name: "", qty: "", unit: "" }],
        steps: [{ id: genId(), text: "", images: [""] }],
      }));
    } catch (e) {
      console.error(e);
      setError("Không thể tạo món ăn. Hãy chắc chắn json-server đang chạy ở port 9999.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* --- Lightweight CSS for a cleaner look (keeps Bootstrap compatible) --- */}


      <div className="container py-4" style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div className="page-hero mb-4">
          <div className="d-flex align-items-start gap-3 flex-wrap">
            <div>
              <h2 className="m-0">Thêm món mới</h2>
              <div className="text-muted">Điền thông tin chi tiết và xem trước ở panel bên phải.</div>
            </div>
            {form.image && (
              <img src={form.image} alt="preview" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 14, border: "1px solid #e5e7eb" }} />
            )}
          </div>
        </div>

        {/* Layout: Form left / Preview right */}
        <div className="row g-4">
          {/* Left: Form */}
          <div className="col-lg-7">
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger soft-card p-3">{error}</div>}
              {success && <div className="alert alert-success soft-card p-3">{success}</div>}

              {/* Basic */}
              <div className="soft-card p-3 mb-3">
                <div className="section-title mb-1">Thông tin cơ bản</div>
                <div className="divider" />
                <div className="mb-3">
                  <label className="form-label">Tiêu đề *</label>
                  <input type="text" className="form-control form-control-lg" value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Ví dụ: Bún chả Hà Nội" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ảnh đại diện (URL) *</label>
                  <input type="url" className="form-control" value={form.image} onChange={(e) => updateField("image", e.target.value)} placeholder="/img/mon-ngon.jpg hoặc https://..." />
                </div>

                <div className="row g-3">
                  <div className="col-sm-4">
                    <label className="form-label">prepTime (phút) *</label>
                    <input type="number" min={0} className="form-control" value={form.prepTime} onChange={(e) => updateField("prepTime", e.target.value)} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">cookTime (phút) *</label>
                    <input type="number" min={0} className="form-control" value={form.cookTime} onChange={(e) => updateField("cookTime", e.target.value)} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Độ khó</label>
                    <select className="form-select" value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)}>{difficulties.map((d) => (<option key={d} value={d}>{d}</option>))}</select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label">Tags *</label>
                  <div className="tag-group">
                    {allTags.map((t) => (
                      <span key={t.id} className={`chip ${form.tags.includes(t.key) ? "active" : ""}`} onClick={() => toggleTag(t.key)}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  {!!form.tags.length && (
                    <div className="mt-2 small text-muted">
                      Đã chọn: {form.tags.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div className="soft-card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="section-title">Nguyên liệu *</div>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addIngredient}>+ Thêm</button>
                </div>
                <div className="divider" />

                {form.ingredients.map((ing) => (
                  <div className="row g-2 align-items-end mb-2" key={ing.id}>
                    <div className="col-md-6">
                      <label className="form-label">Tên</label>
                      <input className="form-control" value={ing.name} onChange={(e) => updateIngredient(ing.id, "name", e.target.value)} placeholder="VD: Thịt bò" />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">SL</label>
                      <input className="form-control" value={ing.qty} onChange={(e) => updateIngredient(ing.id, "qty", e.target.value)} placeholder="500" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Đơn vị</label>
                      <input className="form-control" value={ing.unit} onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)} placeholder="gram, ml..." />
                    </div>
                    <div className="col-md-1 d-grid">
                      <button type="button" className="btn btn-outline-danger" onClick={() => removeIngredient(ing.id)} disabled={form.ingredients.length === 1}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <div className="soft-card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="section-title">Các bước thực hiện *</div>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addStep}>+ Thêm bước</button>
                </div>
                <div className="divider" />

                {form.steps.map((step, idx) => (
                  <div className="border rounded-4 p-3 mb-3" key={step.id} style={{ borderColor: "#eef2f7" }}>
                    <div className="mb-2">
                      <label className="form-label">Mô tả bước #{idx + 1}</label>
                      <textarea className="form-control" rows={2} value={step.text} onChange={(e) => updateStep(step.id, "text", e.target.value)} placeholder="Mô tả chi tiết..." />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Ảnh minh họa (URL)</strong>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => addStepImage(step.id)}>+ Thêm ảnh</button>
                    </div>

                    {step.images.map((img, i) => (
                      <div className="row g-2 align-items-center mb-2" key={`${step.id}-${i}`}>
                        <div className="col-10">
                          <input className="form-control" placeholder="https://... hoặc /img/step-1.jpg" value={img} onChange={(e) => updateStepImage(step.id, i, e.target.value)} />
                        </div>
                        <div className="col-2 d-flex align-items-center gap-2">
                          {img ? <img src={img} alt="thumb" className="thumb" /> : <div className="thumb d-flex align-items-center justify-content-center text-muted">No img</div>}
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeStepImage(step.id, i)} disabled={step.images.length === 1}>Xóa</button>
                        </div>
                      </div>
                    ))}
                    <div className="text-end">
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeStep(step.id)} disabled={form.steps.length === 1}>Xóa bước</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="floating-actions">
                <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu món"}</button>
                <button className="btn btn-outline-secondary btn-lg" type="button" onClick={() => {
                  setForm({
                    title: "",
                    image: "",
                    tags: [],
                    prepTime: 0,
                    cookTime: 0,
                    difficulty: "Dễ",
                    ingredients: [{ id: genId(), name: "", qty: "", unit: "" }],
                    steps: [{ id: genId(), text: "", images: [""] }],
                  });
                  setError("");
                  setSuccess("");
                }}>Reset</button>
              </div>
            </form>
          </div>

          {/* Right: Live preview */}
          <div className="col-lg-5">
            <div className="preview-card">
              {form.image ? (
                <img src={form.image} className="preview-cover" alt="cover" />
              ) : (
                <div className="preview-cover d-flex align-items-center justify-content-center text-muted">Chưa có ảnh</div>
              )}
              <div className="p-3">
                <h4 className="mb-1">{form.title || "Tiêu đề món ăn"}</h4>
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <span className="stat" title="Chuẩn bị"><i className="bi bi-alarm" />{Number(form.prepTime) || 0} phút</span>
                  <span className="stat" title="Nấu"><i className="bi bi-fire" />{Number(form.cookTime) || 0} phút</span>
                  <span className="stat" title="Độ khó"><i className="bi bi-bar-chart" />{form.difficulty}</span>
                </div>
                {form.tags.length > 0 && (
                  <div className="mb-3 d-flex flex-wrap gap-2">
                    {form.tags.map((t) => (
                      <span key={t} className="badge text-bg-light border">{t}</span>
                    ))}
                  </div>
                )}

                <div className="mb-3">
                  <div className="fw-semibold mb-2">Nguyên liệu</div>
                  <ul className="mb-0 small">
                    {form.ingredients.filter((i) => i.name.trim()).map((i) => (
                      <li key={i.id}>{i.name} {i.qty !== "" ? `- ${i.qty}` : ""} {i.unit}</li>
                    ))}
                    {!form.ingredients.some((i) => i.name.trim()) && <li className="text-muted">(Chưa có)</li>}
                  </ul>
                </div>

                <div className="mb-2">
                  <div className="fw-semibold mb-2">Các bước</div>
                  <ol className="small">
                    {form.steps.filter((s) => s.text.trim()).map((s) => (
                      <li key={s.id} className="mb-2">{s.text}</li>
                    ))}
                    {!form.steps.some((s) => s.text.trim()) && <li className="text-muted">(Chưa có)</li>}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
