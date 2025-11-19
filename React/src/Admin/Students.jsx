import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

export default function UsersPage() {

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); // user_id
  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    email: "",
    birth_date: "",     // ✅ เพิ่มวันเกิด (YYYY-MM-DD)
    role_id: "",
    faculty_id: "",
    department_id: "",
    password: ""
  });

  const [csvPreview, setCsvPreview] = useState([]);
  const token = localStorage.getItem('token');
  const fetchAll = async () => {
    const [u, r, f, d] = await Promise.all([
      axios.get("/users", {
        headers: {
          Authorization: token
        }
      }),
      axios.get("/roles"),
      axios.get("/faculties"),
      axios.get("/departments"),
    ]);
    setUsers(u.data.data || []);
    setRoles(r.data.data || []);
    setFaculties(f.data.data || []);
    setDepartments(d.data.data || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const isStudent = (role_id) => {
    const r = roles.find((x) => String(x.role_id) === String(role_id));
    return r?.role_name === "นักศึกษา";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ เช็ก client-side: นักศึกษา -> user_id ต้องเป็นเลข 12 หลัก
    if (isStudent(formData.role_id) && !/^\d{12}$/.test(String(formData.user_id).trim())) {
      Swal.fire({
        icon: "warning",
        title: "รูปแบบรหัสนักศึกษาไม่ถูกต้อง",
        text: "สำหรับนักศึกษา user_id ต้องเป็นตัวเลข 12 หลัก",
      });
      return;
    }

    // ต้องมีวันเกิดบน create
    if (!editId && !formData.birth_date) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกวันเกิด", text: "รูปแบบ YYYY-MM-DD" });
      return;
    }

    const payload = {
      ...formData,
      role_id: Number(formData.role_id) || null,
      faculty_id: formData.faculty_id ? Number(formData.faculty_id) : null,
      department_id: formData.department_id ? Number(formData.department_id) : null,
    };

    try {
      if (editId) {
        // อัปเดต (ห้ามแก้ user_id)
        const body = {
          full_name: payload.full_name,
          email: payload.email,
          role_id: payload.role_id,
          faculty_id: payload.faculty_id,
          department_id: payload.department_id,
          // ถ้าต้องการให้แก้วันเกิดได้ ให้เพิ่ม birth_date ลงไปด้วย และรองรับใน backend
          // birth_date: payload.birth_date,
        };

        // ถ้ามีกรอกรหัสผ่านใหม่ -> ส่งไปอัปเดตด้วย
        if (formData.password && formData.password.trim() !== "") {
          body.password = formData.password.trim();
        }

        const res = await axios.put(`users/${editId}`, body);
        setUsers(res.data.list || []);

        Swal.fire({
          icon: "success",
          title: "✅ แก้ไขผู้ใช้สำเร็จ",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        // เพิ่ม (backend จะตั้ง password = DDMMYY จากวันเกิด พ.ศ.)
        const res = await axios.post("users", payload);
        setUsers(res.data.list || []);

        Swal.fire({
          icon: "success",
          title: "✅ เพิ่มผู้ใช้สำเร็จ",
          text: "รหัสผ่านเริ่มต้นคือ วันเกิด (DDMMYY)",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }

      // เคลียร์ฟอร์ม
      setFormData({
        user_id: "",
        full_name: "",
        email: "",
        birth_date: "",
        role_id: "",
        faculty_id: "",
        department_id: "",
        password: "", // ✅ แก้จาก passowrd -> password
      });
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      if (error.response?.status === 409) {
        // ตาม backend ตอนนี้เช็กซ้ำด้วย user_id เป็นหลัก
        Swal.fire({ icon: "warning", title: "⚠️ รหัสนี้มีอยู่แล้ว", text: "กรุณาใช้ค่าอื่น" });
      } else {
        Swal.fire({
          icon: "error",
          title: "❌ บันทึกไม่สำเร็จ",
          text: error.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
        });
      }
    }
  };

  const handleEdit = (u) => {
    setEditId(u.user_id);
    setFormData({
      user_id: u.user_id, // locked
      full_name: u.full_name,
      email: u.email,
      // birth_date โชว์โดยแปลงเป็น YYYY-MM-DD ถ้าหาก backend ส่งเป็น ISO อยู่แล้วก็ใช้ได้เลย
      birth_date: u.birth_date ? String(u.birth_date).slice(0, 10) : "",
      role_id: String(u.role_id || ""),
      faculty_id: String(u.faculty_id || ""),
      department_id: String(u.department_id || ""),
      password: ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "ข้อมูลนี้จะถูกลบถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });
    if (!ok.isConfirmed) return;

    try {
      const res = await axios.delete(`users/${id}`);
      setUsers(res.data.list || []);
      Swal.fire({
        icon: "success",
        title: "🗑️ ลบผู้ใช้สำเร็จ",
        timer: 1200,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "❌ ลบไม่สำเร็จ",
        text: e.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
      });
    }
  };

  // CSV header รองรับ: user_id,full_name,email,birth_date,role_id,faculty_id,department_id
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const rows = text
        .split(/\r?\n/)
        .filter(Boolean)
        .map((r) => r.split(","));
      const headers = rows[0].map((h) => h.trim());
      const data = rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = row[i]?.trim() ?? ""));
        // แปลงตัวเลข
        ["role_id", "faculty_id", "department_id"].forEach((k) => {
          if (obj[k] === "") obj[k] = null;
          else obj[k] = Number(obj[k]);
        });
        // birth_date ควรเป็น YYYY-MM-DD ถ้าส่งรูปแบบอื่นให้แปลงก่อน
        return obj;
      });
      setCsvPreview(data);
    };
    reader.readAsText(file);
  };

  const importCSVData = async () => {
    try {
      const res = await axios.post("users/bulk", csvPreview);
      setUsers(res.data.list || []);
      console.log(res);

      setCsvPreview([]);
      Swal.fire({
        icon: "success",
        title: "✅ นำเข้าผู้ใช้สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "❌ นำเข้าไม่สำเร็จ",
        text: e.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
      });
    }
  };

  const columns = [
    {
      name: "#",
      width: "60px",
      center: true,
      selector: (row, index) => index + 1,
    },
    {
      name: "รหัส",
      selector: row => row.user_id,
      sortable: true,
    },
    {
      name: "ชื่อ - สกุล",
      selector: row => row.full_name,
      sortable: true,
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
    },
    {
      name: "วันเกิด",
      selector: row =>
        row.birth_date
          ? new Date(row.birth_date).toLocaleDateString("th-TH")
          : "-",
      sortable: true,
    },
    {
      name: "สิทธิ์",
      selector: row => row.role_name,
      sortable: true,
    },
    {
      name: "คณะ",
      selector: row => row.faculty_name || "-",
      sortable: true,
    },
    {
      name: "สาขา",
      selector: row => row.department_name || "-",
      sortable: true,
    },
    {
      name: "จัดการ",
      width: "160px",
      center: true,
      cell: row => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-warning px-3"
            onClick={() => handleEdit(row)}
          >
            <i className="bi bi-pencil-square"></i>
          </button>

          <button
            className="btn btn-sm btn-danger px-3"
            onClick={() => handleDelete(row.user_id)}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      ),
    },
  ];
  const customStyles = {
    headCells: {
      style: {
        background: "linear-gradient(135deg,#ffffff 0%,#ffffff 100%)",
        color: "black",
        fontWeight: "700",
        fontSize: "14px",
        paddingTop: "14px",
        paddingBottom: "14px",
      },
    },
    rows: {
      style: {
        fontSize: "15px",
        color: "#374151",
        minHeight: "56px",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        padding: "10px",
      },
    },
  };

  return (
    <div className="d-flex">
      <Navbar />

      <div
        className="flex-grow-1 p-4"
        style={{
          background: "linear-gradient(135deg, #f5f7fb 0%, #e8ecf4 100%)",
          minHeight: "100vh",
        }}
      >
        {/* ============================
              Header Card
        ============================= */}
        <div className="page-header mb-4">
          <h3>👥 จัดการผู้ใช้</h3>
          <p>เพิ่ม แก้ไข และจัดการข้อมูลผู้ใช้ในระบบ</p>
        </div>

        {/* ============================
              Main Container
        ============================= */}
        <div className="section-card">

          {/* Top Actions */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="form-control modern-input"
                style={{ width: 240 }}
              />

              <button
                className="btn btn-success btn-modern"
                disabled={csvPreview.length === 0}
                onClick={importCSVData}
              >
                📥 นำเข้าจาก CSV
              </button>
            </div>

            <button
              className={`btn btn-modern ${showForm ? "btn-outline-secondary" : "btn-primary"
                }`}
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditId(null);
                  setFormData({
                    user_id: "",
                    full_name: "",
                    email: "",
                    birth_date: "",
                    role_id: "",
                    faculty_id: "",
                    department_id: "",
                    password: "",
                  });
                }
              }}
            >
              {showForm ? "ปิดฟอร์ม" : "➕ เพิ่มผู้ใช้"}
            </button>
          </div>

          {/* ============================
                Form Add / Edit
          ============================= */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="card border-0 shadow-sm mb-4 rounded-4 p-3"
                style={{ background: "#ffffff" }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">รหัสผู้ใช้</label>
                      <input
                        type="text"
                        className="form-control modern-input"
                        disabled={!!editId}
                        value={formData.user_id}
                        onChange={(e) =>
                          setFormData({ ...formData, user_id: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">ชื่อ-สกุล</label>
                      <input
                        type="text"
                        className="form-control modern-input"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control modern-input"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">วันเกิด</label>
                      <input
                        type="date"
                        className="form-control modern-input"
                        value={formData.birth_date}
                        onChange={(e) =>
                          setFormData({ ...formData, birth_date: e.target.value })
                        }
                        required={!editId}
                      />
                    </div>
                  </div>

                  {editId && (
                    <div className="row mb-3">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">
                          เปลี่ยนรหัสผ่าน
                        </label>
                        <input
                          type="password"
                          className="form-control modern-input"
                          placeholder="เว้นว่าง = ไม่เปลี่ยน"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">สิทธิ์</label>
                      <select
                        className="form-select modern-input"
                        value={formData.role_id}
                        onChange={(e) =>
                          setFormData({ ...formData, role_id: e.target.value })
                        }
                        required
                      >
                        <option value="">-- เลือก --</option>
                        {roles.map((r) => (
                          <option key={r.role_id} value={r.role_id}>
                            {r.role_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">คณะ</label>
                      <select
                        className="form-select modern-input"
                        value={formData.faculty_id}
                        onChange={(e) =>
                          setFormData({ ...formData, faculty_id: e.target.value })
                        }
                      >
                        <option value="">-- เลือก --</option>
                        {faculties.map((f) => (
                          <option key={f.faculty_id} value={f.faculty_id}>
                            {f.faculty_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">สาขา</label>
                      <select
                        className="form-select modern-input"
                        value={formData.department_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department_id: e.target.value,
                          })
                        }
                      >
                        <option value="">-- เลือก --</option>
                        {departments
                          .filter(
                            (d) =>
                              !formData.faculty_id ||
                              String(d.faculty_id) ===
                              String(formData.faculty_id)
                          )
                          .map((d) => (
                            <option key={d.department_id} value={d.department_id}>
                              {d.department_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" className="btn btn-primary btn-modern">
                      {editId ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-modern"
                      onClick={() => {
                        setShowForm(false);
                        setEditId(null);
                        setFormData({
                          user_id: "",
                          full_name: "",
                          email: "",
                          birth_date: "",
                          role_id: "",
                          faculty_id: "",
                          department_id: "",
                          password: "",
                        });
                      }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================
                Data Table (Users)
          ============================= */}
          <DataTable
            columns={columns}
            data={users}
            pagination
            striped
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            responsive
            noDataComponent={
              <div className="text-muted py-5 text-center">
                <div style={{ fontSize: "42px" }}>📭</div>
                <p className="mt-2">ยังไม่มีข้อมูลผู้ใช้</p>
              </div>
            }
          />

          {/* CSV PREVIEW */}
          {csvPreview.length > 0 && (
            <div className="mt-4 p-4 rounded-4" style={{ background: "#f8fafc" }}>
              <h5 className="fw-bold mb-3">📄 Preview CSV</h5>

              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      {Object.keys(csvPreview[0]).map((k, i) => (
                        <th key={i}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(row).map((k, i) => (
                          <td key={i}>{String(row[k] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-muted mt-2">
                รองรับคอลัมน์: user_id, full_name, email, birth_date (YYYY-MM-DD), role_id, faculty_id, department_id
              </p>
            </div>
          )}
        </div>
      </div>

      {/* END MAIN */}
    </div>
  );
}

