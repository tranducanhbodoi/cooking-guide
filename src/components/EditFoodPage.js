import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ChefPage.css"; // Reuse the same styles

// Utilities
const genId = () => Math.random().toString(36).slice(2, 6) + Date.now().toString(36);
const difficulties = ["Dễ", "Trung bình", "Khó"];

// Lấy chefId hiện tại từ localStorage (fallback)
const getCurrentChefId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u?.id) return String(u.id);
  } catch {}
  const fb = localStorage.getItem("userId");
  return fb ? String(fb) : null;
};

// ===== Reusable ImagePicker (drag & drop / paste / click-to-upload) =====
function ImagePicker({
  value,
  onChange,
  placeholder = "Kéo thả ảnh vào đây, bấm để chọn tệp hoặc dán (Ctrl/Cmd+V)...",
  height = 160,
  round = 14,
}) {
  const inputRef = useRef(null);
  const [isOver, setIsOver] = useState(false);

  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const pickFile = () => inputRef.current?.click();

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const url = await fileToDataURL(file);
    onChange?.(url);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      return handleFiles(e.dataTransfer.files);
    }
    const uri = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (uri) onChange?.(uri.trim());
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items || [];
    for (const it of items) {
      if (it.type?.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) {
          const url = await fileToDataURL(file);
          onChange?.(url);
          e.preventDefault();
          return;
        }
      }
    }
    const text = e.clipboardData?.getData("text");
    if (text && /^https?:\/\/|^data:image\//i.test(text.trim())) {
      onChange?.(text.trim());
      e.preventDefault();
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={pickFile}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        style={{
          border: `2px dashed ${isOver ? "#6fa8ff" : "#d6d9de"}`,
          borderRadius: round,
          height,
          background: isOver ? "#f2f7ff" : "#fafbfc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "border-color .15s, background .15s",
        }}
        title="Kéo thả / dán / click để chọn ảnh"
      >
        {value ? (
          <img
            src={value}
            alt="preview"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="text-muted text-center px-3" style={{ lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600 }}>Tải ảnh</div>
            <div className="small">{placeholder}</div>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.("");
            }}
            className="btn btn-sm btn-light"
            style={{ position: "absolute", top: 8, right: 8, border: "1px solid #e5e7eb" }}
            title="Xóa ảnh"
          >
            ×
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="d-none" onChange={(e) => handleFiles(e.target.files)} />
      <input
        type="text"
        spellCheck={false}
        placeholder="...hoặc dán/nhập URL ảnh (tùy chọn)"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="form-control mt-2"
      />
    </div>
  );
}

export default function EditFoodPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allTags, setAllTags] = useState([]);

  const [form, setForm] = useState({
    title: "",
    image: "",
    tags: [],
    prepTime: 0,
    cookTime: 0,
    difficulty: "Dễ",
    ingredients: [{ id: genId(), name: "", qty: "", unit: "" }],
    steps: [{ id: genId(), text: "", images: [""] }],
    chefId: "", // giữ chefId để PUT không mất
  });

  // --- Load tags & current food ---
  useEffect(() => {
    (async () => {
      try {
        const [tagsRes, foodRes] = await Promise.all([
          fetch("http://localhost:9999/tags"),
          fetch(`http://localhost:9999/food/${id}`),
        ]);
        const [tags, food] = await Promise.all([tagsRes.json(), foodRes.json()]);
        setAllTags(tags || []);

        if (!food || !food.id) {
          setError("Không tìm thấy món cần chỉnh sửa.");
          setFetching(false);
          return;
        }

        // Normalize data for editor (ensure local ids for list items)
        const normalizedIngredients = (food.ingredients || []).map((i) => ({
          id: genId(),
          name: i.name ?? "",
          qty: i.qty ?? "",
          unit: i.unit ?? "",
        }));
        const normalizedSteps = (food.steps || []).map((s) => ({
          id: genId(),
          text: s.text ?? "",
          images: Array.isArray(s.images) && s.images.length ? s.images : [""],
        }));

        setForm({
          title: food.title ?? "",
          image: food.image ?? "",
          tags: Array.isArray(food.tags) ? food.tags : [],
          prepTime: food.prepTime ?? 0,
          cookTime: food.cookTime ?? 0,
          difficulty: food.difficulty ?? "Dễ",
          ingredients: normalizedIngredients.length ? normalizedIngredients : [{ id: genId(), name: "", qty: "", unit: "" }],
          steps: normalizedSteps.length ? normalizedSteps : [{ id: genId(), text: "", images: [""] }],
          chefId: String(food.chefId ?? getCurrentChefId() ?? ""), // giữ/khôi phục chefId
        });
      } catch (e) {
        console.error(e);
        setError("Lỗi khi tải dữ liệu.");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  // --- Helpers ---
  const updateField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleTag = (key) =>
    setForm((p) => ({ ...p, tags: p.tags.includes(key) ? p.tags.filter((t) => t !== key) : [...p.tags, key] }));

  const addIngredient = () =>
    setForm((p) => ({ ...p, ingredients: [...p.ingredients, { id: genId(), name: "", qty: "", unit: "" }] }));
  const removeIngredient = (rid) =>
    setForm((p) => ({ ...p, ingredients: p.ingredients.filter((i) => i.id !== rid) }));
  const updateIngredient = (rid, key, value) =>
    setForm((p) => ({ ...p, ingredients: p.ingredients.map((i) => (i.id === rid ? { ...i, [key]: value } : i)) }));

  const addStep = () => setForm((p) => ({ ...p, steps: [...p.steps, { id: genId(), text: "", images: [""] }] }));
  const removeStep = (rid) => setForm((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== rid) }));
  const updateStep = (rid, key, value) =>
    setForm((p) => ({ ...p, steps: p.steps.map((s) => (s.id === rid ? { ...s, [key]: value } : s)) }));
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
    if (!form.image.trim()) return "Vui lòng chọn hoặc dán ảnh đại diện.";
    if (!form.tags.length) return "Chọn ít nhất 1 tag.";
    const pt = Number(form.prepTime), ct = Number(form.cookTime);
    if (Number.isNaN(pt) || pt < 0) return "prepTime phải là số ≥ 0";
    if (Number.isNaN(ct) || ct < 0) return "cookTime phải là số ≥ 0";
    if (!form.ingredients.length || form.ingredients.some((i) => !i.name.trim()))
      return "Cần ít nhất 1 nguyên liệu và tên không được rỗng.";
    if (!form.steps.length || form.steps.some((s) => !s.text.trim()))
      return "Cần ít nhất 1 bước và nội dung bước không được rỗng.";
    if (!form.chefId) return "Thiếu chefId. Hãy đăng nhập lại tài khoản CHEF.";
    return "";
  };

  const toPayload = () => ({
    id, // keep original id
    title: form.title.trim(),
    image: form.image.trim(), // có thể là dataURL hoặc URL
    tags: form.tags,
    prepTime: Number(form.prepTime),
    cookTime: Number(form.cookTime),
    difficulty: form.difficulty,
    ingredients: form.ingredients.map(({ name, qty, unit }) => ({
      name: name.trim(),
      qty: qty === "" ? 0 : isNaN(Number(qty)) ? qty : Number(qty),
      unit: unit.trim(),
    })),
    steps: form.steps.map(({ text, images }) => ({
      text: text.trim(),
      images: (images || []).map((u) => u.trim()).filter(Boolean),
    })),
    chefId: form.chefId, // <-- gửi lại chefId để không bị mất
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess("");
    const err = validate();
    if (err) return setError(err);
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:9999/food/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload()),
      });
      if (!res.ok) throw new Error("PUT /food/:id thất bại");
      setSuccess("Lưu thay đổi thành công!");
    } catch (e) {
      console.error(e);
      setError("Không thể lưu thay đổi. Kiểm tra json-server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Xóa món này? Thao tác không thể hoàn tác.")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:9999/food/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE /food/:id thất bại");
      nav("/food");
    } catch (e) {
      console.error(e);
      setError("Không thể xóa. Kiểm tra json-server.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container py-4" style={{ maxWidth: 900 }}>
        <div className="page-hero mb-3">
          <h4 className="m-0">Đang tải dữ liệu món #{id}...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="page-hero mb-4 d-flex align-items-start gap-3 flex-wrap">
        <div>
          <h2 className="m-0">Chỉnh sửa món</h2>
          <div className="text-muted">ID: {id} {form.chefId ? `• ChefID: ${form.chefId}` : ""}</div>
        </div>
        {form.image && (
          <img
            src={form.image}
            alt="preview"
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 14, border: "1px solid #e5e7eb" }}
          />
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <form onSubmit={handleSave}>
            {error && <div className="alert alert-danger soft-card p-3">{error}</div>}
            {success && <div className="alert alert-success soft-card p-3">{success}</div>}

            {/* Basic */}
            <div className="soft-card p-3 mb-3">
              <div className="section-title mb-1">Thông tin cơ bản</div>
              <div className="divider" />
              <div className="mb-3">
                <label className="form-label">Tiêu đề *</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Ảnh đại diện *</label>
                <ImagePicker value={form.image} onChange={(v) => updateField("image", v)} />
              </div>
              <div className="row g-3">
                <div className="col-sm-4">
                  <label className="form-label">prepTime *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.prepTime}
                    onChange={(e) => updateField("prepTime", e.target.value)}
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">cookTime *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.cookTime}
                    onChange={(e) => updateField("cookTime", e.target.value)}
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Độ khó</label>
                  <select
                    className="form-select"
                    value={form.difficulty}
                    onChange={(e) => updateField("difficulty", e.target.value)}
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="form-label">Tags *</label>
                <div className="tag-group">
                  {allTags.map((t) => (
                    <span
                      key={t.id}
                      className={`chip ${form.tags.includes(t.key) ? "active" : ""}`}
                      onClick={() => toggleTag(t.key)}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
                {!!form.tags.length && (
                  <div className="mt-2 small text-muted">Đã chọn: {form.tags.join(", ")}</div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div className="soft-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="section-title">Nguyên liệu *</div>
                <button type="button" className="btn btn-sm btn-primary" onClick={addIngredient}>
                  + Thêm
                </button>
              </div>
              <div className="divider" />
              {form.ingredients.map((ing) => (
                <div className="row g-2 align-items-end mb-2" key={ing.id}>
                  <div className="col-md-6">
                    <label className="form-label">Tên</label>
                    <input
                      className="form-control"
                      value={ing.name}
                      onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">SL</label>
                    <input
                      className="form-control"
                      value={ing.qty}
                      onChange={(e) => updateIngredient(ing.id, "qty", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Đơn vị</label>
                    <input
                      className="form-control"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)}
                    />
                  </div>
                  <div className="col-md-1 d-grid">
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeIngredient(ing.id)}
                      disabled={form.ingredients.length === 1}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="soft-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="section-title">Các bước thực hiện *</div>
                <button type="button" className="btn btn-sm btn-primary" onClick={addStep}>
                  + Thêm bước
                </button>
              </div>
              <div className="divider" />

              {form.steps.map((step, idx) => (
                <div className="border rounded-4 p-3 mb-3" key={step.id} style={{ borderColor: "#eef2f7" }}>
                  <div className="mb-2">
                    <label className="form-label">Mô tả bước #{idx + 1}</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={step.text}
                      onChange={(e) => updateStep(step.id, "text", e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Ảnh minh họa</strong>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => addStepImage(step.id)}
                    >
                      + Thêm ảnh
                    </button>
                  </div>

                  {step.images.map((img, i) => (
                    <div className="row g-2 align-items-center mb-2" key={`${step.id}-${i}`}>
                      <div className="col-10">
                        <ImagePicker
                          value={img}
                          onChange={(v) => updateStepImage(step.id, i, v)}
                          height={120}
                          placeholder="Kéo thả/dán/chọn ảnh hoặc dán URL..."
                        />
                      </div>
                      <div className="col-2 d-flex align-items-center gap-2">
                        {img ? (
                          <img src={img} alt="thumb" className="thumb" />
                        ) : (
                          <div className="thumb d-flex align-items-center justify-content-center text-muted">
                            No img
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeStepImage(step.id, i)}
                          disabled={step.images.length === 1}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeStep(step.id)}
                      disabled={form.steps.length === 1}
                    >
                      Xóa bước
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button className="btn btn-outline-danger btn-lg" type="button" onClick={handleDelete} disabled={loading}>
                Xóa món
              </button>
              <button className="btn btn-outline-secondary btn-lg" type="button" onClick={() => nav(-1)}>
                Quay lại
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="col-lg-5">
          <div className="preview-card">
            {form.image ? (
              <img src={form.image} className="preview-cover" alt="cover" />
            ) : (
              <div className="preview-cover d-flex align-items-center justify-content-center text-muted">
                Chưa có ảnh
              </div>
            )}
            <div className="p-3">
              <h4 className="mb-1">{form.title || "Tiêu đề món ăn"}</h4>
              <div className="d-flex gap-2 flex-wrap mb-2">
                <span className="stat" title="Chuẩn bị">
                  <i className="bi bi-alarm" />
                  {Number(form.prepTime) || 0} phút
                </span>
                <span className="stat" title="Nấu">
                  <i className="bi bi-fire" />
                  {Number(form.cookTime) || 0} phút
                </span>
                <span className="stat" title="Độ khó">
                  <i className="bi bi-bar-chart" />
                  {form.difficulty}
                </span>
              </div>
              {form.tags.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {form.tags.map((t) => (
                    <span key={t} className="badge text-bg-light border">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-3">
                <div className="fw-semibold mb-2">Nguyên liệu</div>
                <ul className="mb-0 small">
                  {form.ingredients
                    .filter((i) => i.name.trim())
                    .map((i) => (
                      <li key={i.id}>
                        {i.name} {i.qty !== "" ? `- ${i.qty}` : ""} {i.unit}
                      </li>
                    ))}
                  {!form.ingredients.some((i) => i.name.trim()) && (
                    <li className="text-muted">(Chưa có)</li>
                  )}
                </ul>
              </div>

              <div className="mb-2">
                <div className="fw-semibold mb-2">Các bước</div>
                <ol className="small">
                  {form.steps
                    .filter((s) => s.text.trim())
                    .map((s) => (
                      <li key={s.id} className="mb-2">
                        {s.text}
                      </li>
                    ))}
                  {!form.steps.some((s) => s.text.trim()) && (
                    <li className="text-muted">(Chưa có)</li>
                  )}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
