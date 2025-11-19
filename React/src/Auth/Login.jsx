import React, { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../axiosConfig"; // ✅ instance ที่เซ็ต baseURL + interceptors ไว้

export default function ModernLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const navigate = useNavigate();
 const API_URL = import.meta.env.VITE_API_URL
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบ",
        text: "กรุณากรอกทั้งรหัสผู้ใช้และรหัสผ่าน",
      });
      return;
    }

    try {
      setLoading(true);

      // 🔐 ยิงไปที่ backend /login
      const res = await axios.post("/login", {
        user_id: userId.trim(),
        password: password.trim(),
      });

      const { token, user } = res.data; // ✅ ปรับตาม response backend จริง

      if (!token || !user) {
        throw new Error("ข้อมูลตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง");
      }

      // ✅ เก็บ token + user ไว้ใน localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ ตั้ง header ให้ axios ใช้ token ทุกครั้ง
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 🎉 แจ้งเตือนสำเร็จ
      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: `ยินดีต้อนรับคุณ ${user.full_name || ""}`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      // 🎯 เปลี่ยนหน้า ตาม role
      // สมมุติ: 3 = แอดมิน, 2 = อาจารย์, 1 = นักศึกษา
      if (user.role_id === 3) {
        navigate("/admin/Dashboard", { replace: true });
      } else if (user.role_id === 2) {
        navigate("/instructor/Profile", { replace: true }); // ถ้ายังไม่มี route นี้ ค่อยเปลี่ยนทีหลัง
      } else {
        navigate("/student/Dashboard", { replace: true }); // เช่นกัน
      }
    } catch (err) {
      console.error(err);
      let msg = "เกิดข้อผิดพลาดในระบบ";

      if (err.response) {
        if (err.response.status === 401) {
          msg = "รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        } else if (err.response.data?.message) {
          msg = err.response.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Animated Background Elements */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
            top: "-100px",
            left: "-100px",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.1)",
            bottom: "-50px",
            right: "-50px",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "150px",
            height: "150px",
            background: "rgba(255, 255, 255, 0.05)",
            top: "50%",
            right: "10%",
            animation: "float 7s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-card {
          animation: slideIn 0.6s ease-out;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95) !important;
        }

        .logo-container {
          animation: pulse 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .logo-container:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .form-control {
          transition: all 0.3s ease;
          border: 2px solid #e0e0e0;
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          transform: translateY(-2px);
        }

        .input-icon {
          transition: all 0.3s ease;
        }

        .input-focused .input-icon {
          color: #667eea;
          transform: scale(1.1);
        }

        .btn-login {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .btn-login:hover::before {
          left: 100%;
        }

        .password-toggle {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #667eea;
          transform: scale(1.1);
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .info-badge {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-left: 3px solid #667eea;
          transition: all 0.3s ease;
        }

        .info-badge:hover {
          background: linear-gradient(135deg, #667eea25 0%, #764ba225 100%);
          transform: translateX(5px);
        }
      `}</style>

      <div
        className="login-card card shadow-lg border-0 position-relative"
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "24px",
          zIndex: 1,
        }}
      >
        <div className="card-body p-4 p-sm-5">
          {/* Logo Section */}
          <div className="text-center mb-4">
            <div
              className="logo-container mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
              }}
            >
              <User size={40} color="white" strokeWidth={2.5} />
            </div>
            <h3 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
              เข้าสู่ระบบผู้ดูแล
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* User ID Input */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{ color: "#4a5568" }}
              >
                รหัสผู้ใช้ / รหัสนักศึกษา
              </label>
              <div
                className={`position-relative ${
                  focusedInput === "userId" ? "input-focused" : ""
                }`}
              >
                <span
                  className="input-icon position-absolute top-50 start-0 translate-middle-y ms-3"
                  style={{ color: "#a0aec0", zIndex: 10 }}
                >
                  <User size={20} />
                </span>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="เช่น 660000123456"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onFocus={() => setFocusedInput("userId")}
                  onBlur={() => setFocusedInput("")}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                    fontSize: "15px",
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{ color: "#4a5568" }}
              >
                รหัสผ่าน
              </label>
              <div
                className={`position-relative ${
                  focusedInput === "password" ? "input-focused" : ""
                }`}
              >
                <span
                  className="input-icon position-absolute top-50 start-0 translate-middle-y ms-3"
                  style={{ color: "#a0aec0", zIndex: 10 }}
                >
                  <Lock size={20} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control ps-5 pe-5"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput("")}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                    fontSize: "15px",
                  }}
                />
                <span
                  className="password-toggle position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ color: "#a0aec0", zIndex: 10 }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* Info Badge */}
            <div
              className="info-badge p-3 rounded mb-4"
              style={{ fontSize: "13px" }}
            >
              <div className="d-flex align-items-start">
                <span className="me-2" style={{ color: "#667eea" }}>
                  ℹ️
                </span>
                <div style={{ color: "#4a5568" }}>
                  <strong>ผู้ใช้ใหม่:</strong> รหัสผ่านเริ่มต้นคือวันเกิด
                  (DDMMYY) ตามปี พ.ศ.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-login w-100 text-white fw-semibold position-relative"
              style={{
                height: "52px",
                borderRadius: "12px",
                fontSize: "16px",
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center">
                  <span
                    className="loading-spinner me-2"
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "3px solid rgba(255,255,255,0.3)",
                      borderTop: "3px solid white",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-4">
            <small className="text-muted">
              พบปัญหาในการเข้าสู่ระบบ?
              <a
                href="#"
                className="text-decoration-none ms-1"
                style={{ color: "#667eea" }}
              >
                ติดต่อเรา
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
