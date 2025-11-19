import React, { useState, useEffect } from "react";
import Logo_pcru from "../Image/Logo_pcru.png";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../axiosConfig"; // ✅ ใช้ instance เดิมที่มี token
// ถ้าอยากใช้ฟังก์ชัน logout แยกก็ import ตรงนี้ได้
// import { logout } from "../Auth/auth";

export default function Navbar() {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // ✅ เก็บข้อมูล user ปัจจุบัน
    const raw = localStorage.getItem("user");
    const API_URL = import.meta.env.VITE_API_URL;

    const rawUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");



    if (!rawUser || !token) {
        window.location.href = "/login";
        return;
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        window.addEventListener("resize", handleResize);

        // ✅ โหลด user จาก localStorage


        if (raw) {
            try {
                const u = JSON.parse(raw);
                setCurrentUser(u);

            } catch (e) {
                console.error("parse user error", e);
            }
        }

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuData = [
        { icon: "🏠", label: "หน้าหลัก", href: "/admin/Dashboard" },
        { icon: "📚", label: "จัดการคณะ", href: "/admin/faculty" },
        { icon: "👥", label: "จัดการสาขา", href: "/admin/Departments" },
        { icon: "🙍🏻‍♂️", label: "จัดการผู้ใช้", href: "/admin/UsersPage" },
        { icon: "🙍🏻‍♂️", label: "จัดการรายวิชา", href: "/admin/Courses" },
        { icon: "🙍🏻", label: "โปรไฟล์ของฉัน", href: "/admin/profile" },
        { icon: "🚪", label: "ออกจากระบบ", href: "#", isLogout: true },
    ];

    const handleLogout = async () => {
        const confirm = await Swal.fire({
            title: "ต้องการออกจากระบบหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ออกจากระบบ",
            cancelButtonText: "ยกเลิก",
        });

        if (!confirm.isConfirmed) return;

        // ถ้ามีฟังก์ชัน logout แยกไว้ก็เรียกได้ เช่น logout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];

        window.location.href = "/login"; // ✅ กลับหน้า login
    };

    // =======================
    // MOBILE NAVBAR
    // =======================

    if (isMobile) {
        return (
            <>
                <style>{`
          .navbar-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .mobile-menu-item {
            transition: all 0.3s ease;
          }
          .mobile-menu-item:hover {
            transform: translateX(5px);
            background-color: rgba(255, 255, 255, 0.15) !important;
          }
          .logo-circle {
            transition: transform 0.3s ease;
          }
          .logo-circle:hover {
            transform: rotate(360deg) scale(1.1);
          }
          .navbar-toggler:focus {
            box-shadow: none;
          }
        `}</style>

                <nav className="navbar navbar-dark navbar-gradient shadow-lg fixed-top">
                    <div className="container-fluid px-3 py-2">
                        <a
                            href="#"
                            className="navbar-brand d-flex align-items-center fw-bold text-white mb-0"
                        >
                            <div
                                className="logo-circle me-2 bg-white rounded-3 d-flex justify-content-center align-items-center shadow"
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    fontSize: "20px",
                                }}
                            >
                                <span style={{ color: "#667eea" }}>📝</span>
                            </div>
                            <span className="fs-6">ระบบเช็คชื่อเข้าห้องเรียน</span>
                        </a>

                        <button
                            className="navbar-toggler border-0"
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>

                    <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
                        <div className="container-fluid px-3 pb-3">
                            {/* ✅ กล่องโปรไฟล์ด้านบนใน mobile */}
                            {
                                currentUser && (
                                    <div className="card-body d-flex align-items-center">
                                        <div
                                            className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center me-3 avatar-wrapper"
                                            style={{
                                                width: "46px",
                                                height: "46px",
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                                border: "2px solid rgba(255,255,255,0.25)",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                                backdropFilter: "blur(3px)",
                                                transition: "0.25s",
                                            }}
                                        >
                                            {currentUser?.profileImage ? (
                                                <img
                                                    src={API_URL + currentUser.profileImage}
                                                    alt="Profile"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    style={{
                                                        fontSize: "18px",
                                                        fontWeight: "bold",
                                                        color: "white",
                                                    }}
                                                >
                                                    {currentUser?.full_name
                                                        ? currentUser.full_name.charAt(0).toUpperCase()
                                                        : "U"}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <div className="fw-semibold text-white" style={{ fontSize: "14px" }}>
                                                {currentUser?.full_name || "ผู้ใช้ระบบ"}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "white", opacity: 0.85 }}>
                                                {currentUser?.role_name || "ไม่ระบุสิทธิ์"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            <hr />
                            <ul className="navbar-nav">
                                {menuData.map((item, index) => (
                                    <li key={index} className="nav-item mb-2">
                                        {item.isLogout ? (
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="nav-link mobile-menu-item rounded-3 px-3 py-2 d-flex align-items-center bg-danger bg-opacity-25 text-white border border-danger border-opacity-50 w-100 text-start"
                                            >
                                                <span className="fs-5 me-2">{item.icon}</span>
                                                <span className="fw-semibold">{item.label}</span>
                                            </button>
                                        ) : (
                                            <a
                                                href={item.href}
                                                className={`nav-link mobile-menu-item rounded-3 px-3 py-2 d-flex align-items-center text-white`}
                                                style={{
                                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                }}
                                            >
                                                <span className="fs-5 me-2">{item.icon}</span>
                                                <span className="fw-semibold">{item.label}</span>
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </nav>
                {/* กันไม่ให้ content ด้านหลังโดนทับ */}
                <div style={{ height: "70px" }}></div>
            </>
        );
    }

    // =======================
    // DESKTOP SIDEBAR
    // =======================
    return (
        <>
            <style>{`
        .sidebar-professional {
          background-color: #1e293b;
          border-right: 1px solid #334155;
        }
        .sidebar-item {
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }
        .sidebar-item:hover {
          background-color: #334155 !important;
          border-left-color: #667eea;
        }
        .sidebar-item.active {
          background-color: #334155 !important;
          border-left-color: #667eea;
        }
        .sidebar-header {
          background-color: #0f172a;
          border-bottom: 1px solid #334155;
        }
        .logout-btn {
          transition: all 0.2s ease;
        }
        .logout-btn:hover {
          background-color: #dc2626 !important;
        }
      `}</style>

            <div
                className="sidebar-professional d-flex flex-column"
                style={{ width: "280px", minHeight: "100vh" }}
            >
                {/* Header */}
                <div className="sidebar-header p-4">
                    <a
                        href="#"
                        className="d-flex align-items-center text-white text-decoration-none"
                    >
                        <div
                            className="me-3 rounded-2 d-flex justify-content-center align-items-center"
                            style={{ width: "45px", height: "45px", fontSize: "22px" }}
                        >
                            <img
                                src={Logo_pcru}
                                alt="Logo PCRU"
                                style={{ width: "50px", height: "50px", marginRight: "10px" }}
                            />
                        </div>
                        <div>
                            <div
                                className="fw-bold"
                                style={{ fontSize: "15px", lineHeight: "1.3" }}
                            >
                                ระบบเช็คชื่อเข้าห้องเรียน
                            </div>
                            <div style={{ fontSize: "12px", color: "white" }}>
                                Attendance System
                            </div>
                        </div>
                    </a>
                </div>

                {/* ✅ กล่องโปรไฟล์ผู้ใช้ (desktop) */}
                <div className="px-3 pt-3">
                    <div
                        className="card bg-slate-800 border-0 text-white mb-3"
                        style={{ backgroundColor: "#111827" }}
                    >
                        <div className="card-body d-flex align-items-center p-3">
                            <div
                                className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center me-3"
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    backgroundColor: "#4b5563",
                                }}
                            >
                                {currentUser?.profileImage ? (
                                    <img
                                        src={API_URL + currentUser.profileImage}
                                        alt="Profile"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <span
                                        style={{
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                            color: "white",
                                        }}
                                    >
                                        {currentUser?.full_name
                                            ? currentUser.full_name.charAt(0).toUpperCase()
                                            : "U"}
                                    </span>
                                )}
                            </div>
                            <div>
                                <div
                                    className="fw-semibold"
                                    style={{ fontSize: "14px", lineHeight: "1.2" }}
                                >
                                    {currentUser?.full_name || "ผู้ใช้ระบบ"}
                                </div>
                                <div
                                    className=""
                                    style={{ fontSize: "12px", marginTop: "2px" }}
                                >
                                    {currentUser?.role_name || "ไม่ระบุสิทธิ์"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-grow-1 py-2">
                    <div className="px-3 mb-2 text-white">
                        <small
                            className=" text-uppercase fw-semibold text-white"
                            style={{ fontSize: "11px" }}
                        >
                            เมนูหลัก
                        </small>
                    </div>
                    <ul className="nav flex-column px-2">
                        {menuData.slice(0, -1).map((item, index) => (
                            <li key={index} className="nav-item mb-1">
                                <a
                                    href={item.href}
                                    className={`nav-link sidebar-item text-white px-3 py-3 d-flex align-items-center ${location.pathname === item.href ? "active" : ""
                                        }`}
                                    style={{
                                        backgroundColor:
                                            location.pathname === item.href ? "#334155" : "transparent",
                                        fontSize: "14px",
                                    }}
                                >
                                    <span className="me-3" style={{ fontSize: "18px" }}>
                                        {item.icon}
                                    </span>
                                    <span className="fw-medium">{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logout Section */}
                <div
                    className="p-3 border-top"
                    style={{ borderColor: "#334155 !important" }}
                >
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn btn-outline-danger logout-btn w-100 d-flex align-items-center justify-content-center py-2"
                        style={{ fontSize: "14px" }}
                    >
                        <span className="me-2" style={{ fontSize: "18px" }}>
                            🚪
                        </span>
                        <span className="fw-medium">ออกจากระบบ</span>
                    </button>
                </div>
            </div>
        </>
    );
}
