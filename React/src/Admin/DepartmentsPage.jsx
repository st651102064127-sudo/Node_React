import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [departmentName, setDepartmentName] = useState("");
  const [facultyId, setFacultyId] = useState(""); // ใช้ id จริง
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchFaculties = async () => {
    try {
      const res = await axios.get(`${API_URL}/faculties`);
      setFaculties(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`);
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaculties();
    fetchDepartments();
  }, []);

  // เพิ่ม / แก้ไข
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentName.trim() || !facultyId) return;

    try {
      if (editId) {
        const res = await axios.put(`${API_URL}/departments/${editId}`, {
          department_name: departmentName,
          faculty_id: Number(facultyId),
        });
        setDepartments(res.data.list || []);
        Swal.fire({
          icon: "success",
          title: "✅ แก้ไขข้อมูลเรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        const res = await axios.post(`${API_URL}/departments`, {
          department_name: departmentName,
          faculty_id: Number(facultyId),
        });
        setDepartments(res.data.list || []);
        Swal.fire({
          icon: "success",
          title: "✅ เพิ่มข้อมูลสาขาสำเร็จ",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }

      setDepartmentName("");
      setFacultyId("");
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 409) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ มีสาขานี้ในคณะนี้อยู่แล้ว",
          text: "กรุณาใช้ชื่ออื่น",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "❌ บันทึกไม่สำเร็จ",
          text: error.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
        });
      }
    }
  };

  // ลบ
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
      const res = await axios.delete(`${API_URL}/departments/${id}`);
      setDepartments(res.data.list || []);
      Swal.fire({
        icon: "success",
        title: "🗑️ ลบข้อมูลสำเร็จ",
        timer: 1200,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "❌ ลบไม่สำเร็จ",
        text: error.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
      });
    }
  };

  // แก้ไข (โหลดค่าเดิม)
  const handleEdit = (dept) => {
    setEditId(dept.department_id);
    setDepartmentName(dept.department_name);
    setFacultyId(String(dept.faculty_id));
    setShowForm(true);
  };
  const columns = [
    {
      name: "#",
      width: "70px",
      center: true,
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "ชื่อสาขา",
      selector: (row) => row.department_name,
      sortable: true,
    },
    {
      name: "คณะ",
      selector: (row) => row.faculty_name,
      sortable: true,
    },
    {
      name: "การจัดการ",
      width: "180px",
      center: true,
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm btn-warning px-3 me-2"
            onClick={() => handleEdit(row)}
          >
            <i className="bi bi-pencil-square"></i>
          </button>

          <button
            className="btn btn-sm btn-danger px-3"
            onClick={() => handleDelete(row.department_id)}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      ),
    },
  ];
  const customStyles = {
    headCells: {

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
        {/* =======================
          PAGE HEADER (เหมือน AddCourse)
      ======================== */}
        <div className="page-header">
          <h3>🎓 จัดการข้อมูลสาขา</h3>
          <p>เพิ่ม / แก้ไข / ลบข้อมูลสาขาวิชาในระบบได้อย่างง่ายดาย</p>
        </div>

        {/* =======================
          SECTION MAIN CARD
      ======================== */}
        <div className="section-card">

          {/* HEADER + BUTTON */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <span className="icon-badge icon-badge-purple me-2">🏫</span>
              <h5 className="header-title mb-0">ข้อมูลสาขาทั้งหมด</h5>
            </div>

            <button
              className={`btn btn-modern ${showForm ? "btn-outline-secondary" : "btn-primary"
                } px-4`}
              style={{
                borderRadius: "12px",
                background: showForm
                  ? "#fff"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: showForm ? "#667eea" : "#fff",
                borderColor: "#667eea",
              }}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "ปิดฟอร์ม" : "➕ เพิ่มสาขา"}
            </button>
          </div>

          {/* =======================
            FORM SECTION
        ======================== */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card border-0 shadow-sm mb-4 rounded-4"
              >
                <div className="card-body p-4">

                  <form onSubmit={handleSubmit}>
                    {/* NAME */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ color: "#4b5563" }}>
                        ชื่อสาขา
                      </label>
                      <input
                        type="text"
                        className="form-control modern-input"
                        placeholder="เช่น วิทยาการคอมพิวเตอร์"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        required
                      />
                    </div>

                    {/* FACULTY */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ color: "#4b5563" }}>
                        คณะ
                      </label>

                      <select
                        className="form-select modern-input"
                        value={facultyId}
                        onChange={(e) => setFacultyId(e.target.value)}
                        required
                      >
                        <option value="">-- เลือกคณะ --</option>
                        {faculties.map((f) => (
                          <option key={f.faculty_id} value={f.faculty_id}>
                            {f.faculty_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* BUTTONS */}
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button
                        type="submit"
                        className="btn btn-modern btn-primary px-4"
                        style={{ borderRadius: "12px" }}
                      >
                        {editId ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-modern btn-outline-secondary px-4"
                        style={{ borderRadius: "12px" }}
                        onClick={() => {
                          setDepartmentName("");
                          setFacultyId("");
                          setEditId(null);
                          setShowForm(false);
                        }}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =======================
            TABLE SECTION
        ======================== */}
      <div className="table-wrapper mt-3">
  <DataTable
    columns={columns}
    data={departments}
    customStyles={customStyles}
    pagination
    highlightOnHover
    striped
    responsive
  />
</div>


        </div>
      </div>
    </div>
  );

}
