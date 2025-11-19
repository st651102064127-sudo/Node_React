

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import "./Style/Courses.css";

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "" });
  const emojiList = ["📘"];
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classroomForm, setClassroomForm] = useState({
    year: "",
    semester: "",
    section: "",
  });

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  // โหลดรายวิชาที่อาจารย์เป็นคนสอน
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/instructor/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses(res.data.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text: err.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // Filter ค้นหา
  const filteredCourses = courses.filter((c) =>
    (c.code + c.name).toLowerCase().includes(filters.search.toLowerCase())
  );

  // เปิด modal
  const openCreateModal = (course) => {
    const currentYear = new Date().getFullYear() + 543;

    setSelectedCourse(course);
    setClassroomForm({
      year: currentYear.toString(),
      semester: "",
      section: "",
    });

    setShowModal(true);
  };

  // ปิด modal
  const closeCreateModal = () => setShowModal(false);

  // Submit สร้างชั้นเรียน
  const submitCreateClassroom = async () => {
    const { year, semester, section } = classroomForm;

    if (!year || !semester || !section) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกข้อมูลให้ครบ" });
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/instructor/classroom/create`,
        {
          course_id: selectedCourse.code,
          year,
          semester,
          section,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newId = res.data.data.classroom_id;

      Swal.fire({
        icon: "success",
        title: "สร้างชั้นเรียนสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });

      closeCreateModal();

      window.location.href = `/instructor/classroom/${newId}/add-students`;

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "สร้างชั้นเรียนไม่สำเร็จ",
        text: err.response?.data?.message || "เกิดข้อผิดพลาด",
      });
    }
  };

  return (
    <>
      <div className="d-flex">
        <Navbar />

        <div className="flex-grow-1 dashboard-bg">
          <div className="dashboard-content p-4">

            {/* Header */}
            <div className="header-card rounded-4 p-4 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: '40px' }}>📘</div>
                <div>
                  <h3 className="fw-bold mb-1" style={{ color: '#1e293b' }}>รายวิชาที่สอน</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '15px' }}>
                    จัดการรายวิชา สร้างชั้นเรียน และดูแลนักศึกษาของคุณ
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control search-box"
                  placeholder="🔍 ค้นหารายวิชา..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  style={{ 
                    padding: '16px 24px', 
                    fontSize: '16px',
                    borderRadius: '16px'
                  }}
                />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border"></div>
                <p className="loading-text">กำลังโหลดข้อมูล...</p>
              </div>
            )}

            {/* Courses */}
            {!loading && (
              <div className="row g-4">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => (
                    <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={c.code}>
                      <div className="course-card border shadow">
                        <div>
                          <div className="course-emoji text-center">{c.emoji}</div>
                          <div className="text-center mb-3">
                            <span className="course-tag">{c.code}</span>
                          </div>
                          <h5 className="course-title text-center">{c.name}</h5>
                        </div>

                        <button
                          className="btn btn-create w-100 mt-3"
                          onClick={() => openCreateModal(c)}
                        >
                          <span style={{ position: 'relative', zIndex: 1 }}>
                            ➕ สร้างชั้นเรียน
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="empty-state text-center">
                      <div className="empty-icon">📭</div>
                      <h5 className="empty-title">ไม่พบรายวิชาที่ตรงกับการค้นหา</h5>
                      <p className="text-muted mt-2">ลองค้นหาด้วยคำอื่นหรือเคลียร์การค้นหา</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            
            <h5 className="modal-title">สร้างชั้นเรียนใหม่</h5>
            <p className="modal-subtitle">
              {selectedCourse?.code} – {selectedCourse?.name}
            </p>

            <div className="mb-3">
              <label className="form-label">ปีการศึกษา</label>
              <input
              disabled
                type="number"
                className="form-control"
                placeholder="เช่น 2568"
                value={classroomForm.year}
                onChange={(e) =>
                  setClassroomForm({ ...classroomForm, year: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">ภาคเรียน</label>
              <select
                className="form-select"
                value={classroomForm.semester}
                onChange={(e) =>
                  setClassroomForm({ ...classroomForm, semester: e.target.value })
                }
              >
                <option value="">เลือกภาคเรียน</option>
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="3">ภาคพิเศษ</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">Section</label>
              <input
                className="form-control"
                placeholder="เช่น 01, 02, 03"
                value={classroomForm.section}
                onChange={(e) =>
                  setClassroomForm({ ...classroomForm, section: e.target.value })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button 
                className="btn btn-modal-secondary" 
                onClick={closeCreateModal}
              >
                ยกเลิก
              </button>
              <button 
                className="btn btn-modal-primary" 
                onClick={submitCreateClassroom}
              >
                ✓ สร้างชั้นเรียน
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}