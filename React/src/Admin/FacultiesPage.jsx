import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultiesPage() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [faculties, setFaculties] = useState([]);
    const [facultyName, setFacultyName] = useState("");
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // ================================
    //  Fetch Faculties
    // ================================
    const fetchFaculties = async () => {
        try {
            const res = await axios.get(`/faculties`);
            setFaculties(res.data.data || []);
        } catch (error) {
            console.error("Error fetching faculties:", error);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    // ================================
    //  Create / Update
    // ================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!facultyName.trim()) {
            Swal.fire("กรุณากรอกชื่อคณะ", "", "warning");
            return;
        }

        try {
            if (editId) {
                // UPDATE
                const res = await axios.put(`/faculties/${editId}`, {
                    faculty_name: facultyName
                });

                const updated = res.data.data;

                setFaculties((prev) =>
                    prev.map((f) =>
                        f.faculty_id === editId
                            ? { ...f, faculty_name: updated.faculty_name }
                            : f
                    )
                );

                Swal.fire({
                    icon: "success",
                    title: "แก้ไขข้อมูลสำเร็จ",
                    timer: 1200,
                    showConfirmButton: false,
                    position : "top-end",
                    toast : true
                });
            } else {
                // CREATE
                const res = await axios.post(`/faculties_store`, {
                    faculty_name: facultyName,
                });

                setFaculties((prev) => [...prev, res.data.data]);

                Swal.fire({
                    icon: "success",
                    title: "เพิ่มข้อมูลสำเร็จ",
                    timer: 1200,
                    showConfirmButton: false,
                    toast : true,
                    position : "top-end"
                });
            }

            resetForm();
        } catch (err) {
            console.error(err);

            if (err.response?.status === 409) {
                Swal.fire("ชื่อคณะนี้มีอยู่แล้ว", "", "warning");
            } else {
                Swal.fire("เกิดข้อผิดพลาด", "โปรดลองใหม่อีกครั้ง", "error");
            }
        }
    };

    const resetForm = () => {
        setFacultyName("");
        setEditId(null);
        setShowForm(false);
    };

    // ================================
    //  DELETE
    // ================================
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "ต้องการลบหรือไม่?",
            text: "การลบจะไม่สามารถกู้คืนได้",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบเลย",
            cancelButtonText: "ยกเลิก",
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(`/faculties/${id}`);

            setFaculties((prev) => prev.filter((f) => f.faculty_id !== id));

            Swal.fire({
                icon: "success",
                title: "ลบข้อมูลสำเร็จ",
                timer: 1200,
                showConfirmButton: false,
                position : "top-end",
                toast: true
            });
        } catch (err) {
            Swal.fire("เกิดข้อผิดพลาด", "", "error");
        }
    };

    // ================================
    //  EDIT (เปิดฟอร์ม)
    // ================================
    const handleEdit = (faculty) => {
        setEditId(faculty.faculty_id);
        setFacultyName(faculty.faculty_name);
        setShowForm(true);
    };

    // ================================
    //  DataTable Columns
    // ================================
    const columns = [
        {
            name: "#",
            width: "70px",
            center: true,
            selector: (row, index) => index + 1,
        },
        {
            name: "ชื่อคณะ",
            selector: row => row.faculty_name,
            sortable: true,
        },
        {
            name: "การจัดการ",
            width: "200px",
            center: true,
            cell: (row) => (
                <div>
                    <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(row)}
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row.faculty_id)}
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
                backgroundColor: "#7b2ff7",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "14px",
            },
        },
    };

    // ================================
    //  UI
    // ================================
    return (
        <div className="d-flex w-100">
            <Navbar />

            <style>{`
                .text-purple { color: #7b2ff7; }
                .page-header {
                    background: linear-gradient(135deg,#7b2ff7 0%,#a855f7 100%);
                    border-radius: 20px;
                    padding: 32px;
                    color: white;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                }
                .page-header h3 { font-weight: 800; margin-bottom: 8px; font-size: 32px; }
                .page-header p { opacity: 0.95; font-size: 16px; margin: 0; }
                .section-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                }
            `}</style>

            <div className="flex-grow-1 p-4" style={{
                background: "linear-gradient(135deg,#f5f7fb 0%,#e8ecf4 100%)",
                minHeight: "100vh"
            }}>

                {/* Header กล่องม่วงเหมือนหน้าอื่น */}
                <div className="page-header">
                    <h3>🏫 จัดการข้อมูลคณะ</h3>
                    <p>เพิ่ม แก้ไข และลบข้อมูลคณะในระบบ</p>
                </div>

                {/* ปุ่ม เพิ่มคณะ */}
                <div className="section-card mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold text-purple mb-0">รายชื่อคณะทั้งหมด</h4>

                        <button
                            className="btn btn-primary px-4 rounded-pill fw-semibold"
                            style={{
                                backgroundColor: "#7b2ff7",
                                borderColor: "#7b2ff7",
                            }}
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                        >
                            + เพิ่มคณะ
                        </button>
                    </div>
                </div>

                {/* FORM เพิ่ม / แก้ไข */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="section-card mb-4"
                        >
                            <form onSubmit={handleSubmit}>
                                <label className="form-label text-purple fw-semibold">ชื่อคณะ</label>
                                <input
                                    className="form-control border-2 mb-3"
                                    style={{ borderColor: "#b085f5" }}
                                    value={facultyName}
                                    placeholder="เช่น คณะวิทยาศาสตร์"
                                    onChange={(e) => setFacultyName(e.target.value)}
                                />

                                <div className="d-flex justify-content-end mt-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 me-2"
                                        style={{
                                            backgroundColor: "#7b2ff7",
                                            borderColor: "#7b2ff7",
                                        }}
                                    >
                                        {editId ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4"
                                        onClick={resetForm}
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* DataTable */}
                <div className="section-card">
                    <DataTable
                        columns={columns}
                        data={faculties}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        customStyles={customStyles}
                        noDataComponent={
                            <div className="text-muted py-5 text-center">
                                <div style={{ fontSize: "48px" }}>📭</div>
                                <p>ยังไม่มีข้อมูลคณะ</p>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
