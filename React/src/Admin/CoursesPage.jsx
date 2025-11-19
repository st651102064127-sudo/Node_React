import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import axios from "../axiosConfig";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import * as bootstrap from 'bootstrap';
import "./styles/CoursesPage.css"
import DataTable from "react-data-table-component";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
export default function AddCourse() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course_id: "", course_name: "", instructor_id: "" });
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [searchInstructor, setSearchInstructor] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectMode, setSelectMode] = useState("add");
  const [searchText, setSearchText] = useState("");

  const openInstructorModal = (mode = "add") => {
    setSelectMode(mode);
    fetchInstructors("");
    const modal = new bootstrap.Modal(document.getElementById("instructorModal"));
    modal.show();
  };
  const [editData, setEditData] = useState({
    course_id: "",
    course_name: "",
    instructor_id: ""
  });
  const fetchCourses = async () => {
    try {
      const res = await axios.get("/admin/courses");


      const list = res.data?.data;
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      setCourses([]);
    }
  };
  const filteredCourses = courses.filter(c =>
    c.course_id.toLowerCase().includes(searchText.toLowerCase()) ||
    c.course_name.toLowerCase().includes(searchText.toLowerCase()) ||
    (c.instructor_name || "").toLowerCase().includes(searchText.toLowerCase())
  );
  const onDeleteCourse = async (course_id) => {
    const confirm = await Swal.fire({
      title: "ต้องการลบวิชานี้หรือไม่?",
      text: "การลบจะไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/admin/courses/${course_id}`);

      Swal.fire("ลบสำเร็จ", "ข้อมูลถูกลบออกจากระบบแล้ว", "success");

      // 🔥 ลบออกจาก state โดยตรง
      setCourses((prev) => prev.filter((c) => c.course_id !== course_id));

    } catch (e) {
      console.error(e);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้", "error");
    }
  };

  const fetchInstructors = async (keyword = "") => {
    try {
      const res = await axios.get(`/admin/getInstructor`, {
        params: { search: keyword }
      });

      setInstructors(res.data.data); // state เก็บรายชื่ออาจารย์
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };
  const onEditCourse = (course) => {
    setEditData(course);

    const modal = new bootstrap.Modal(document.getElementById("editCourseModal"));
    modal.show();
  };
  const submitUpdateCourse = async () => {
    try {
      await axios.put(`/admin/courses/${editData.course_id}`, {
        course_name: editData.course_name,
        instructor_id: editData.instructor_id
      });
     
      
      
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 1500,
        showConfirmButton: false
      });

      // โหลดใหม่
      await fetchCourses();

      // ปิด modal แบบไม่พัง
      const modalEl = document.getElementById("editCourseModal");
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();

    } catch (err) {
      console.error(err);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };


  useEffect(() => {
    fetchCourses();
  }, []);


  const handleAddCourse = async () => {
    if (!form.course_id || !form.course_name) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "กรุณากรอกรหัสและชื่อวิชา",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!selectedInstructor) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกอาจารย์ผู้สอน",
        text: "วิชาต้องมีอาจารย์ผู้รับผิดชอบ",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {

      const payload = {
        course_id: form.course_id.trim(),
        course_name: form.course_name.trim(),
        instructor_id: selectedInstructor.user_id,   // ⭐ ส่งอาจารย์เข้า backend
      };

      const res = await axios.post("/admin/courses", payload);
      const created = res.data?.data;

      // อัปเดต state ทันที
      if (created) {
        setCourses((prev) => [...prev, created]);
      }

      // รีเซ็ตฟอร์ม
      setForm({ course_id: "", course_name: "", instructor_id: "" });
      setSelectedInstructor(null);

      Swal.fire({
        icon: "success",
        title: "เพิ่มสำเร็จ!",
        text: "เพิ่มวิชาเรียนพร้อมอาจารย์สำเร็จ",
        confirmButtonColor: "#10b981",
        timer: 1500,
        showConfirmButton: false
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถเพิ่มวิชาได้",
        text: err.response?.data?.message || "รหัสวิชานี้มีอยู่แล้วในระบบ",
        confirmButtonColor: "#ef4444",
      });
    }
  };


  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    setCsvRows([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;

        if (!rows.length) {
          setCsvError("ไฟล์ไม่มีข้อมูล");
          return;
        }

        if (!("code" in rows[0]) || !("name" in rows[0])) {
          setCsvError("รูปแบบไฟล์ไม่ถูกต้อง ต้องมีคอลัมน์ code และ name");
          return;
        }

        const existingCodes = new Set(
          courses.map((c) => c.course_id.toLowerCase().trim())
        );

        const parsed = rows
          .map((r) => ({
            code: String(r.code || "").trim(),
            name: String(r.name || "").trim(),
          }))
          .filter((r) => r.code !== "" && r.name !== "");

        const preview = parsed.map((r) => ({
          ...r,
          status: existingCodes.has(r.code.toLowerCase()) ? "exists" : "new",
          selected: !existingCodes.has(r.code.toLowerCase()),
        }));

        setCsvRows(preview);
      },
      error: () => setCsvError("อ่านไฟล์ CSV ไม่สำเร็จ"),
    });

    e.target.value = "";
  };
  const handleImportNewCourses = async () => {
    // เลือกเฉพาะวิชาใหม่ที่ติ๊กถูก
    const selected = Array.isArray(csvRows)
      ? csvRows.filter((r) => r.status === "new" && r.selected)
      : [];

    if (selected.length === 0) {
      Swal.fire({
        icon: "info",
        title: "ไม่มีวิชาที่เลือก",
        text: "ไม่มีวิชาใหม่ที่เลือกสำหรับการนำเข้า",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      // ส่งข้อมูลไป backend
      const res = await axios.post("/admin/courses/bulk", {
        courses: selected.map((r) => ({
          course_id: r.code,
          course_name: r.name,
        })),
      });

      const inserted = res.data?.inserted || [];

      Swal.fire({
        icon: "success",
        title: "นำเข้าสำเร็จ!",
        text: `เพิ่มแล้ว ${inserted.length} วิชาใหม่เข้าระบบ`,
        confirmButtonColor: "#10b981",
      });

      // โหลดข้อมูลรายวิชาใหม่ทั้งหมด
      const coursesRes = await axios.get("/admin/courses");
      const list = coursesRes.data?.data;
      setCourses(Array.isArray(list) ? list : []);

      // เคลียร์ข้อมูล CSV preview
      setCsvRows([]);
    } catch (err) {
      console.error("Bulk import error:", err);

      Swal.fire({
        icon: "error",
        title: "นำเข้าไม่สำเร็จ",
        text: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
        confirmButtonColor: "#ef4444",
      });
    }
  };
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "70px",
      center: true,
      style: { fontWeight: "600", color: "#4b5563" },
    },
    {
      name: "รหัสวิชา",
      selector: row => row.course_id,
      sortable: true,
      width: "180px",
      style: { fontWeight: "600", color: "#111827" }
    },
    {
      name: "ชื่อวิชา",
      selector: row => row.course_name,
      sortable: true,
      grow: 2,
      style: { color: "#6b7280" }
    },

    // ⭐⭐⭐ เพิ่มคอลัมน์ใหม่ที่นี่
    {
      name: "อาจารย์ผู้สอน",
      selector: row => row.instructor_name || "-",
      sortable: true,
      grow: 1,
      style: { color: "#374151", fontWeight: 500 }
    },

    {
      name: "การจัดการ",
      center: true,
      width: "160px",
      cell: (row) => (
        <>
          <button
            className="btn btn-sm btn-warning px-3 me-2"
            onClick={() => onEditCourse(row)}
          >
            <i className="bi bi-pencil-square"></i>
          </button>

          <button
            className="btn btn-sm btn-danger px-3"
            onClick={() => onDeleteCourse(row.course_id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </>
      ),
    },
  ];


  return (
    <div className="d-flex">
      <Navbar />

      <div
        className="flex-grow-1 p-4"
        style={{ background: "linear-gradient(135deg, #f5f7fb 0%, #e8ecf4 100%)", minHeight: "100vh" }}
      >


        {/* Header Card */}
        <div className="page-header">
          <h3>📚 เพิ่มวิชาเรียน</h3>
          <p>จัดการและเพิ่มข้อมูลวิชาเรียน</p>
        </div>

        <div className="row g-4">
          {/* Manual Add */}
          <div className="col-lg-5">
            <div className="section-card">
              <div className="section-header">
                <span className="icon-badge icon-badge-purple">➕</span>
                <h5 className="header-title mb-0">เพิ่มวิชาด้วยตนเอง</h5>
              </div>

              <label className="form-label fw-semibold mb-2" style={{ color: "#374151" }}>
                รหัสวิชา
              </label>
              <input
                type="text"
                className="form-control modern-input mb-3"
                placeholder="เช่น CS101, MATH201"
                value={form.course_id}
                onChange={(e) =>
                  setForm({ ...form, course_id: e.target.value })
                }
              />

              <label className="form-label fw-semibold mb-2" style={{ color: "#374151" }}>
                ชื่อวิชา
              </label>
              <input
                type="text"
                className="form-control modern-input mb-4"
                placeholder="เช่น Programming Fundamentals"
                value={form.course_name}
                onChange={(e) =>
                  setForm({ ...form, course_name: e.target.value })
                }
              />
              <label className="form-label fw-semibold mb-2" style={{ color: "#374151" }}>
                อาจารย์ผู้สอน
              </label>

              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control modern-input"
                  placeholder="คลิกปุ่มเลือกอาจารย์ →"
                  value={selectedInstructor?.full_name || ""}
                  disabled
                />
                <button
                  className="btn btn-primary"
                  onClick={() => openInstructorModal()}
                >
                  เลือกอาจารย์
                </button>
              </div>

              <button
                className="btn btn-primary btn-modern w-100"
                onClick={handleAddCourse}
              >
                <span style={{ fontSize: "16px", marginRight: "8px" }}>✓</span>
                บันทึกวิชาเรียน
              </button>
            </div>
          </div>

          {/* CSV Import */}
          <div className="col-lg-7">
            <div className="section-card">
              <div className="section-header">
                <span className="icon-badge icon-badge-green">📥</span>
                <h5 className="header-title mb-0">นำเข้าจากไฟล์ CSV</h5>
              </div>

              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept=".csv"
                  className="form-control modern-input"
                  onChange={handleCsvFileChange}
                />
              </div>

              <p className="sub-text mt-3 mb-0">
                <span style={{ fontSize: "16px", marginRight: "6px" }}>ℹ️</span>
                ไฟล์ CSV ต้องมีคอลัมน์: <span className="badge bg-secondary">code</span> และ <span className="badge bg-secondary">name</span>
              </p>

              {csvError && (
                <div className="alert alert-danger mt-3 mb-0">
                  <strong>⚠️ เกิดข้อผิดพลาด:</strong> {csvError}
                </div>
              )}

              {csvRows.length > 0 && (
                <>
                  <div className="section-header mt-4">
                    <h6 className="fw-bold mb-0" style={{ color: "#374151" }}>
                      <span style={{ marginRight: "8px" }}>🔍</span>
                      ตรวจสอบข้อมูล ({csvRows.filter(r => r.status === "new").length} วิชาใหม่)
                    </h6>
                  </div>

                  <div className="table-wrapper">
                    <table className="table csv-table align-middle table-sm mb-0">
                      <thead>
                        <tr>
                          <th width="80" className="text-center">เลือก</th>
                          <th width="140">รหัสวิชา</th>
                          <th>ชื่อวิชา</th>
                          <th width="120" className="text-center">สถานะ</th>
                        </tr>
                      </thead>

                      <tbody>
                        {csvRows.map((row, i) => (
                          <tr >
                            <td className="text-center">
                              <input
                                type="checkbox"
                                disabled={row.status === "exists"}
                                checked={row.selected}
                                onChange={(e) =>
                                  setCsvRows((prev) =>
                                    prev.map((r, idx) =>
                                      idx === i
                                        ? {
                                          ...r,
                                          selected: e.target.checked,
                                        }
                                        : r
                                    )
                                  )
                                }
                              />
                            </td>

                            <td className="fw-semibold" style={{ color: "#374151" }}>{row.code}</td>
                            <td style={{ color: "#6b7280" }}>{row.name}</td>

                            <td className="text-center">
                              {row.status === "exists" ? (
                                <span className="badge badge-exists">
                                  มีอยู่แล้ว
                                </span>
                              ) : (
                                <span className="badge badge-new">ใหม่</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    className="btn btn-success btn-modern w-100 mt-3"
                    onClick={handleImportNewCourses}
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>⬆️</span>
                    นำเข้า {csvRows.filter(r => r.status === "new" && r.selected).length} วิชาใหม่
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table All Courses */}
        <div className="section-card mt-4">
          <div className="section-header">
            <span className="icon-badge icon-badge-blue">📋</span>
            <h5 className="header-title mb-0">รายวิชาทั้งหมดในระบบ</h5>
            <span className="badge bg-primary ms-auto" style={{ fontSize: "14px", padding: "8px 16px" }}>
              {courses.length} วิชา
            </span>
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="ค้นหารายวิชา / รหัสวิชา / อาจารย์ผู้สอน"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <DataTable

            columns={columns}
            data={filteredCourses}

            pagination
            highlightOnHover
            striped
            responsive
            noDataComponent={
              <div className="text-center py-5">
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📚</div>
                <h5 className="fw-bold text-secondary">ยังไม่มีข้อมูลวิชาในระบบ</h5>
                <p className="text-muted">เริ่มต้นโดยการเพิ่มวิชาใหม่</p>
              </div>
            }
            customStyles={{
              headCells: {
                style: {
                  background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                  fontWeight: "700",
                  fontSize: "14px",
                }
              },
              rows: {
                style: {
                  paddingTop: "14px",
                  paddingBottom: "14px",
                }
              }
            }}
          />

        </div>

      </div>
      {/* ===========================
    EDIT COURSE MODAL
=========================== */}
      <div className="modal fade" id="editCourseModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 rounded-3">

            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-pencil-square me-2"></i> แก้ไขรายวิชา
              </h5>
              <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body p-4">

              {/* รหัสวิชา */}
              <div className="mb-3">
                <label className="form-label fw-semibold">รหัสวิชา</label>
                <input
                  type="text"
                  className="form-control modern-input"
                  value={editData.course_id}
                  disabled
                />
              </div>

              {/* ชื่อวิชา */}
              <div className="mb-3">
                <label className="form-label fw-semibold">ชื่อวิชา</label>
                <input
                  type="text"
                  className="form-control modern-input"
                  value={editData.course_name}
                  onChange={(e) =>
                    setEditData({ ...editData, course_name: e.target.value })
                  }
                />
              </div>

              {/* อาจารย์ผู้สอน */}
              <div className="mb-3">
                <label className="form-label fw-semibold">อาจารย์ผู้สอน</label>

                <div className="input-group">
                  <input
                    type="text"
                    className="form-control modern-input"
                    placeholder="คลิกปุ่มเพื่อเลือกอาจารย์"
                    value={editData.instructor_name || ""}
                    disabled
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => openInstructorModal("edit")}
                  >
                    เลือกอาจารย์
                  </button>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                ปิด
              </button>

              <button className="btn btn-primary" onClick={submitUpdateCourse}>
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ======================
   SELECT INSTRUCTOR MODAL
======================= */}
      <div className="modal fade" id="instructorModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-person-check me-2"></i> เลือกอาจารย์ผู้สอน
              </h5>
              <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body p-3">

              {/* Search box */}
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ค้นหาชื่อ หรือ รหัสอาจารย์"

                  onChange={(e) => {
                    setSearchInstructor(e.target.value);
                    fetchInstructors(e.target.value);
                  }}
                />

              </div>

              {/* List of instructors */}
              <div className="list-group">

                {instructors
                  .filter((ins) =>
                    (ins.full_name + ins.user_id)
                      .toLowerCase()
                      .includes(searchInstructor.toLowerCase())

                  ).filter((ins) =>
                    searchInstructor.trim() === "" ||
                    ins.full_name.toLowerCase().includes(searchInstructor.toLowerCase()) ||
                    String(ins.user_id).includes(searchInstructor)
                  )
                  .map((ins) => (
                    <button
                      key={ins.user_id}
                      type="button"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => {
                        if (selectMode === "add") {
                          setSelectedInstructor(ins);
                          setForm({ ...form, instructor_id: ins.user_id });
                        } else {
                          setEditData({
                            ...editData,
                            instructor_id: ins.user_id,
                            instructor_name: ins.full_name
                          });
                        }

                        const modalEl = document.getElementById("instructorModal");
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.hide();

                      }}
                    >
                      <div>
                        <div className="fw-bold">{ins.full_name}</div>
                        <div className="text-muted" style={{ fontSize: "14px" }}>
                          รหัส: {ins.user_id}
                        </div>
                      </div>

                      <span className="badge bg-primary rounded-pill px-3">
                        เลือก
                      </span>
                    </button>
                  ))}

                {instructors.length === 0 && (
                  <div className="text-center text-muted py-4">
                    ไม่มีอาจารย์ในระบบ
                  </div>
                )}
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                ปิด
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>


  );
}