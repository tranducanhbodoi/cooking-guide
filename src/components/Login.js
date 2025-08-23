import { useState } from "react";
import "./Login.css"; 
export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      const res = await fetch("http://localhost:9999/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: "USER",
        }),
      });
      if (res.ok) {
        alert("Đăng ký thành công! Hãy đăng nhập.");
        setIsRegister(false);
      }
    } else {
      const res = await fetch(
        `http://localhost:9999/users?email=${form.email}&password=${form.password}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const user = data[0];
        localStorage.setItem("role", user.role);
        localStorage.setItem("userId", user.id);
        onLogin(user.role);
      } else {
        alert("Sai email hoặc mật khẩu");
      }
    }
  };

  return (
    <div className="auth-container">
      <h3>{isRegister ? "Đăng ký" : "Đăng nhập"}</h3>
      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <div className="form-group">
            <label>Tên:</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="auth-btn">
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </button>
      </form>
      <p className="toggle-text">
        {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Đăng nhập" : "Đăng ký"}
        </button>
      </p>
    </div>
  );
}
