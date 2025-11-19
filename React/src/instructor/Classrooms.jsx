import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import "./Style/Courses.css"; // ใช้สไตล์เดียวกัน

export default function InstructorClassroomList() {
  const [classrooms, setClassrooms] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // ================================
  // โหลดห้องเรียนของอาจารย์
  // ================================
  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/instructor/classrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClassrooms(res.data.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text: err.response?.data?.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // ค้นหาแบบ realtime
  const filtered = classrooms.filter((c) =>
    (c.code + c.name + c.section)
      .toLowerCase()
      .includes(filters.search.toLowerCase())
  );

  return (
    <>
      <div className="d-flex">
        <Navbar />

        <div className="flex-grow-1 p-4 dashboard-bg dashboard-content">

          {/* Header */}
          <div className="header-card rounded-4 p-4 mb-4">
            <h3 className="fw-bold mb-1">ชั้นเรียนของฉัน</h3>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              ดูห้องเรียนที่คุณสร้าง และจัดการรายชื่อนักศึกษาได้ทันที
            </p>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
            <input
              className="form-control search-box"
              placeholder="ค้นหาชั้นเรียน / รหัสวิชา / Section..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="text-muted mt-2">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Classroom Cards */}
          {!loading && (
            <div className="row g-4">
              {filtered.length > 0 ? (
                filtered.map((cls) => (
                  <div className="col-12 col-md-6 col-xl-4 col-xxl-3" key={cls.classroom_id}>
                    <div className="course-card shadow-sm">

                      {/* Emoji */}
                      <div className="course-emoji">📘</div>

                      {/* Title */}
                      <span className="course-tag">
                        {cls.code}
                      </span>

                      <h5 className="course-title">{cls.name}</h5>

                      <p className="text-muted mb-1">
                        ปีการศึกษา: <b>{cls.year}</b>
                      </p>
                      <p className="text-muted mb-3">
                        ภาคเรียน: <b>{cls.semester}</b> | Section: <b>{cls.section}</b>
                      </p>

                      {/* Student Count */}
                      <div className="d-flex align-items-center mb-3">
                        <span style={{ fontSize: "20px", marginRight: "8px" }}>👥</span>
                        <span className="text-dark fw-semibold">
                          {cls.student_count} นักศึกษา
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        className="btn-create w-100"
                        onClick={() =>
                          (window.location.href = `/instructor/classroom/${cls.classroom_id}`)
                        }
                      >
                        จัดการชั้นเรียน
                      </button>

                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state text-center col-12">
                  <div className="empty-icon">📭</div>
                  <h5 className="empty-title">ยังไม่มีชั้นเรียนที่สร้างไว้</h5>
                  <p className="text-muted">ลองกลับไปสร้างชั้นเรียนจากรายวิชาที่คุณสอน</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
