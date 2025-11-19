import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import Papa from "papaparse";              // 👈 ใช้ parse CSV
import "./Style/manageStduents.css";

export default function ClassroomMembers() {
  const { id } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal เพิ่มนักศึกษาด้วยการค้นหา
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // CSV modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvRows, setCsvRows] = useState([]);        // [{ student_id, full_name, alreadyInClass }]
  const [csvSelectedIds, setCsvSelectedIds] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvInputRef = useRef(null);

  // โหลดสมาชิก
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/instructor/classroom/${id}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "โหลดข้อมูลสมาชิกไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Debounce search
  useEffect(() => {
    if (!isAddModalOpen) {
      setSearchText("");
      setSearchResults([]);
      setSelectedStudents([]);
      return;
    }

    if (!searchText || searchText.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const res = await axios.get(`/instructor/students/search`, {
          params: { q: searchText.trim() },
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = res.data?.data || []; // [{ user_id, full_name }, ...]
        const memberIds = new Set(members.map((m) => String(m.student_id)));

        const withFlag = raw.map((s) => ({
          student_id: String(s.user_id),
          full_name: s.full_name,
          alreadyInClass: memberIds.has(String(s.user_id)),
        }));

        setSearchResults(withFlag);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "ค้นหานักศึกษาไม่สำเร็จ", "error");
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchText, isAddModalOpen, members, token]);

  // toggle เลือกใน modal search
  const toggleSelectStudent = (student_id) => {
    setSelectedStudents((prev) =>
      prev.includes(student_id)
        ? prev.filter((id) => id !== student_id)
        : [...prev, student_id]
    );
  };

  // ยืนยันเพิ่มจาก modal search
  const handleAddSelectedStudents = async () => {
    if (!selectedStudents.length) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกนักศึกษาอย่างน้อย 1 คน", "warning");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/instructor/classroom/${id}/members/add`,
        {
          students: selectedStudents,
          instructor_id: userInfo?.user_id || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("สำเร็จ", "เพิ่มนักศึกษาเข้าชั้นเรียนแล้ว", "success");
      setIsAddModalOpen(false);
      setSearchText("");
      setSearchResults([]);
      setSelectedStudents([]);
      fetchMembers();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "เพิ่มนักศึกษาไม่สำเร็จ",
        "error"
      );
    }
  };

  const removeStudent = async (studentId) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "ลบนักศึกษาคนนี้ออกจากชั้นเรียน?",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${API_URL}/instructor/classroom/${id}/members/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("สำเร็จ", "ลบข้อมูลเรียบร้อย", "success");
      fetchMembers();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "ลบไม่สำเร็จ", "error");
    }
  };

  const openModal = () => {
    setIsAddModalOpen(true);
    setSelectedStudents([]);
    setSearchText("");
    setSearchResults([]);
  };

  // -----------------------------
  // CSV: อ่านไฟล์ + เปิด modal preview
  // -----------------------------
  const handleCsvFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const memberIds = new Set(members.map((m) => String(m.student_id)));

    // helper: set state และเปิด modal
    const openCsvPreview = (rows) => {
      const cleaned = rows
        .map((r) => ({
          student_id: String(r.student_id).trim(),
          full_name: (r.full_name || "").trim(),
        }))
        .filter((r) => r.student_id.length > 0);

      if (!cleaned.length) {
        Swal.fire(
          "แจ้งเตือน",
          "ไม่พบรหัสนักศึกษาในไฟล์ CSV",
          "warning"
        );
        event.target.value = "";
        return;
      }

      const withFlags = cleaned.map((r) => ({
        ...r,
        alreadyInClass: memberIds.has(r.student_id),
      }));

      setCsvRows(withFlags);
      setCsvSelectedIds(
        withFlags.filter((r) => !r.alreadyInClass).map((r) => r.student_id)
      );
      setIsCsvModalOpen(true);
      event.target.value = ""; // reset input
    };

    // ลอง parse แบบมี header ก่อน
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const fields = results.meta.fields || [];
          const lower = fields.map((f) => f.toLowerCase());

          // หา column id + name จาก header
          let idKey = null;
          let nameKey = null;

          lower.forEach((f, idx) => {
            if (!idKey && (f.includes("student_id") || f.includes("รหัส"))) {
              idKey = fields[idx];
            }
            if (
              !nameKey &&
              (f.includes("full_name") ||
                f.includes("name") ||
                f.includes("ชื่อ"))
            ) {
              nameKey = fields[idx];
            }
          });

          if (idKey) {
            const rows = results.data.map((row) => ({
              student_id: row[idKey],
              full_name: nameKey ? row[nameKey] : "",
            }));
            openCsvPreview(rows);
          } else {
            // ถ้าไม่มี header ที่ใช้ได้ → parse ใหม่แบบไม่มี header ใช้คอลัมน์แรก
            Papa.parse(file, {
              header: false,
              skipEmptyLines: true,
              complete: (res2) => {
                const rows = res2.data.map((cols) => ({
                  student_id: cols[0],
                  full_name: "",
                }));
                openCsvPreview(rows);
              },
              error: (err2) => {
                console.error(err2);
                Swal.fire("Error", "อ่านไฟล์ CSV ไม่สำเร็จ", "error");
              },
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "อ่านไฟล์ CSV ไม่สำเร็จ", "error");
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire("Error", "ไม่สามารถอ่านไฟล์ CSV ได้", "error");
      },
    });
  };

  // toggle เลือก / ยกเลิกเลือกใน CSV modal
  const toggleCsvSelect = (student_id) => {
    setCsvSelectedIds((prev) =>
      prev.includes(student_id)
        ? prev.filter((id) => id !== student_id)
        : [...prev, student_id]
    );
  };

  const toggleCsvSelectAll = () => {
    const selectable = csvRows
      .filter((r) => !r.alreadyInClass)
      .map((r) => r.student_id);

    if (csvSelectedIds.length === selectable.length) {
      setCsvSelectedIds([]);
    } else {
      setCsvSelectedIds(selectable);
    }
  };

  const handleConfirmCsvImport = async () => {
    if (!csvSelectedIds.length) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกรายชื่อนักศึกษาจาก CSV อย่างน้อย 1 คน", "warning");
      return;
    }

    try {
      setCsvLoading(true);
      await axios.post(
        `${API_URL}/instructor/classroom/${id}/members/add`,
        {
          students: csvSelectedIds,
          instructor_id: userInfo?.user_id || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("สำเร็จ", "นำเข้านักศึกษาจาก CSV เรียบร้อยแล้ว", "success");
      setIsCsvModalOpen(false);
      setCsvRows([]);
      setCsvSelectedIds([]);
      fetchMembers();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "นำเข้าจาก CSV ไม่สำเร็จ",
        "error"
      );
    } finally {
      setCsvLoading(false);
    }
  };

  const handleCloseCsvModal = () => {
    setIsCsvModalOpen(false);
    setCsvRows([]);
    setCsvSelectedIds([]);
  };

  // =================== JSX ===================
  return (
    <>
      <div className="d-flex layout-root">
        <Navbar />

        <div className="w-100 container-fluid members-page-wrapper">
          {/* Header */}
          <div className="header-card w-100">
            <div className="d-flex align-items-center justify-content-between flex-wrap header-inner">
              <div className="d-flex align-items-center header-left">
                <div className="header-icon m-2">
                👤
                </div>
                <div>
                  <h1 className="header-title mb-1">จัดการสมาชิกในชั้นเรียน</h1>
                  <p className="header-subtitle mb-0">
                   จำนวนนักศึกษาทั้งหมด{" "}
                    <span className="highlight-count">{members.length}</span> คน
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center header-actions">
                {/* CSV Upload */}
                <label className="btn-import-csv mb-0">
                  <i className="fas fa-file-csv me-2"></i>
                  เลือกไฟล์ CSV
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleCsvFileChange}
                  />
                </label>

                {/* Add via search */}
                <button
                  className="btn-add-student"
                  onClick={openModal}
                  type="button"
                >
                  <i
                    className="fas fa-user-plus"
                    style={{ marginRight: "8px" }}
                  ></i>
                  เพิ่มนักศึกษา
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content-card">
            {loading ? (
              <div className="empty-state">
                <div
                  className="spinner-border text-primary"
                  style={{ width: "40px", height: "40px" }}
                ></div>
                <p style={{ marginTop: "15px", color: "#718096" }}>
                  กำลังโหลดข้อมูล...
                </p>
              </div>
            ) : members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="empty-title">
                  ยังไม่มีนักศึกษาในชั้นเรียนนี้
                </h3>
                <p className="empty-text">
                  ใช้ปุ่ม "เพิ่มนักศึกษา" หรือ "เลือกไฟล์ CSV" เพื่อเพิ่มรายชื่อ
                </p>
              </div>
            ) : (
              <div className="students-list">
                {members.map((m, idx) => (
                  <div key={m.student_id} className="student-item">
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "15px" }}
                    >
                      <div className="student-number">{idx + 1}</div>
                      <div>
                        <p className="student-name mb-1">{m.full_name}</p>
                        <p className="student-id mb-0">
                          รหัส: <span>{m.student_id}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => removeStudent(m.student_id)}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Search เพิ่มนักศึกษาแบบเดิม */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog-custom">
            <div className="modal-header">
              <div>
                <h5 className="modal-title">เพิ่มนักศึกษาเข้าชั้นเรียน</h5>
                <p className="modal-subtitle">
                  ค้นหาด้วยรหัสหรือชื่อ จากนั้นเลือกนักศึกษาที่ต้องการเพิ่ม
                </p>
              </div>
              <button
                className="btn-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="search-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="ค้นหานักศึกษา..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {searchLoading && (
                  <div className="search-loading">
                    <div className="spinner-border"></div>
                  </div>
                )}
              </div>

              <div>
                {searchText.trim().length < 2 ? (
                  <div className="empty-search">
                    <i className="fas fa-search"></i>
                    <p>พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหา</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="empty-search">
                    <i className="fas fa-user-slash"></i>
                    <p>ไม่พบนักศึกษาตามคำค้นหา</p>
                  </div>
                ) : (
                  searchResults.map((s) => {
                    const checked = selectedStudents.includes(s.student_id);
                    return (
                      <div
                        key={s.student_id}
                        className={`search-result-item ${checked ? "selected" : ""
                          } ${s.alreadyInClass ? "disabled" : ""}`}
                        onClick={() =>
                          !s.alreadyInClass &&
                          toggleSelectStudent(s.student_id)
                        }
                      >
                        <div className="custom-checkbox">
                          {checked && <i className="fas fa-check"></i>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="d-flex align-items-center flex-wrap">
                            <p className="result-name mb-1">{s.full_name}</p>
                            {s.alreadyInClass && (
                              <span className="badge-in-class">
                                อยู่ในชั้นแล้ว
                              </span>
                            )}
                          </div>
                          <p className="result-id mb-0">
                            รหัส: {s.student_id}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="modal-footer">
              <p className="selected-count">
                เลือกแล้ว <span>{selectedStudents.length}</span> คน
              </p>
              <div className="d-flex">
                <button
                  className="btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  className="btn-confirm"
                  onClick={handleAddSelectedStudents}
                  disabled={selectedStudents.length === 0}
                >
                  เพิ่มนักศึกษา ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: CSV Preview */}
      {isCsvModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog-custom">
            <div className="modal-header">
              <div>
                <h5 className="modal-title">นำเข้านักศึกษาจากไฟล์ CSV</h5>
                <p className="modal-subtitle">
                  ตรวจสอบรายชื่อด้านล่าง เลือกเฉพาะคนที่ต้องการเพิ่ม จากนั้นกด "ยืนยันนำเข้า"
                </p>
              </div>
              <button className="btn-close" onClick={handleCloseCsvModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body csv-modal-body">
              {csvRows.length === 0 ? (
                <div className="empty-search">
                  <i className="fas fa-file-csv"></i>
                  <p>ไม่พบข้อมูลในไฟล์ CSV</p>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="csv-summary">
                      ทั้งหมด {csvRows.length} คน | เลือกอยู่ {csvSelectedIds.length} คน
                    </span>
                    <button
                      type="button"
                      className="btn-mini"
                      onClick={toggleCsvSelectAll}
                    >
                      {csvSelectedIds.length ===
                        csvRows.filter((r) => !r.alreadyInClass).length
                        ? "ยกเลิกเลือกทั้งหมด"
                        : "เลือกทั้งหมด"}
                    </button>
                  </div>

                  <div className="csv-list">
                    {csvRows.map((row, index) => {
                      const checked = csvSelectedIds.includes(row.student_id);
                      return (
                        <div
                          key={`${row.student_id}-${index}`}
                          className={`csv-row ${row.alreadyInClass ? "disabled" : ""
                            }`}
                        >
                          <div className="csv-row-left">
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              disabled={row.alreadyInClass}
                              checked={
                                row.alreadyInClass ? false : checked
                              }
                              onChange={() =>
                                !row.alreadyInClass &&
                                toggleCsvSelect(row.student_id)
                              }
                            />
                            <div>
                              <div className="csv-name">
                                {row.full_name || "(ไม่ระบุชื่อ)"}
                                {row.alreadyInClass && (
                                  <span className="badge-in-class ms-2">
                                    อยู่ในชั้นแล้ว
                                  </span>
                                )}
                              </div>
                              <div className="csv-id">
                                รหัส: {row.student_id}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <p className="selected-count">
                เลือกนำเข้า <span>{csvSelectedIds.length}</span> คน
              </p>
              <div className="d-flex">
                <button className="btn-cancel" onClick={handleCloseCsvModal}>
                  ยกเลิก
                </button>
                <button
                  className="btn-confirm"
                  onClick={handleConfirmCsvImport}
                  disabled={csvSelectedIds.length === 0 || csvLoading}
                >
                  {csvLoading
                    ? "กำลังนำเข้า..."
                    : `ยืนยันนำเข้า (${csvSelectedIds.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
