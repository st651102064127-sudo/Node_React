import React, { useState } from "react";
import Papa from "papaparse";

export default function AddStudents() {
    const [manual, setManual] = useState({
        student_id: "",
        name: "",
    });

    const [students, setStudents] = useState([]);
    const [csvError, setCsvError] = useState(null);

    // สมมติว่ามาจาก useParams หรือ props ก็ได้
    const classroom = {
        id: 15,
        subject_code: "CS101",
        subject_name: "Introduction to Programming",
        section: "01",
        year: 2567,
        semester: 1,
    };

    // เพิ่มจากการกรอกมือ
    const handleAddManual = () => {
        if (!manual.student_id.trim() || !manual.name.trim()) {
            alert("กรุณากรอกรหัสนักศึกษาและชื่อให้ครบ");
            return;
        }

        // กันรหัสซ้ำ
        if (
            students.some(
                (s) => s.student_id.trim() === manual.student_id.trim()
            )
        ) {
            alert("มีรหัสนักศึกษานี้อยู่ในรายการแล้ว");
            return;
        }

        setStudents((prev) => [...prev, { ...manual }]);
        setManual({ student_id: "", name: "" });
    };

    // จัดการไฟล์ CSV
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvError(null);

        Papa.parse(file, {
            header: true, // ใช้บรรทัดแรกเป็นชื่อ column
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;

                // ตรวจ column ขั้นต่ำ
                if (!rows.length) {
                    setCsvError("ไฟล์ไม่มีข้อมูล");
                    return;
                }

                const requiredCols = ["student_id", "name"];
                const hasAllCols = requiredCols.every((col) =>
                    Object.prototype.hasOwnProperty.call(rows[0], col)
                );

                if (!hasAllCols) {
                    setCsvError(
                        "รูปแบบไฟล์ไม่ถูกต้อง ต้องมีคอลัมน์ student_id และ name"
                    );
                    return;
                }

                // แปลงข้อมูล + กันแถวว่าง
                const parsed = rows
                    .map((r) => ({
                        student_id: String(r.student_id || "").trim(),
                        name: String(r.name || "").trim(),
                    }))
                    .filter((r) => r.student_id && r.name);

                if (!parsed.length) {
                    setCsvError("ไม่พบข้อมูลนักศึกษาที่ถูกต้องในไฟล์");
                    return;
                }

                // รวมกับของเดิม + กันรหัสซ้ำ
                setStudents((prev) => {
                    const map = new Map();
                    prev.forEach((s) => map.set(s.student_id, s));
                    parsed.forEach((s) => {
                        if (!map.has(s.student_id)) {
                            map.set(s.student_id, s);
                        }
                    });
                    return Array.from(map.values());
                });
            },
            error: (err) => {
                console.error(err);
                setCsvError("เกิดข้อผิดพลาดขณะอ่านไฟล์ CSV");
            },
        });

        // reset file input เพื่ออนุญาตให้เลือกไฟล์เดิมซ้ำได้ภายหลัง
        e.target.value = "";
    };

    // ลบนักศึกษาจากรายการ
    const handleRemoveStudent = (student_id) => {
        setStudents((prev) =>
            prev.filter((s) => s.student_id !== student_id)
        );
    };

    // แก้ไขข้อมูลในตารางแบบ inline
    const handleEditStudent = (student_id, field, value) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.student_id === student_id ? { ...s, [field]: value } : s
            )
        );
    };

    // บันทึกเข้าระบบ (ต่อ backend จากจุดนี้)
    const handleSaveAll = () => {
        if (!students.length) {
            alert("ยังไม่มีนักศึกษาในรายการ");
            return;
        }

        const payload = {
            classroom_id: classroom.id,
            students,
        };

        console.log("ส่งข้อมูลไป backend:", payload);
        alert("(จำลอง) บันทึกข้อมูลเรียบร้อย! สามารถต่อ API ที่ handleSaveAll ได้เลย");
        // ตัวอย่างต่อ API:
        // axios.post("/api/classrooms/add-students", payload)
    };

    return (
        <>
            <style>{`
        .dashboard-bg { background-color:#f1f5f9; min-height:100vh; }
        .sidebar-area { width:260px; background:#fff; border-right:1px solid #e5e7eb; }
        .card-soft {
          border-radius: 18px;
          border: none;
          box-shadow: 0 10px 25px rgba(15,23,42,0.08);
        }
        .card-soft-header {
          border-bottom: 1px solid #e5e7eb;
        }
      `}</style>

            <div className="d-flex">
                {/* SIDEBAR */}
                <div className="sidebar-area">
                    {/* ใส่ Sidebar / Navbar ของอาจารย์ตรงนี้ */}
                </div>

                <div className="flex-grow-1 p-4 dashboard-bg">
                    {/* Header วิชา */}
                    <div className="bg-white p-4 shadow-sm rounded-4 mb-4">
                        <h3 className="fw-bold mb-1">
                            เพิ่มนักศึกษาเข้าชั้นเรียน
                        </h3>
                        <p className="text-muted mb-1">
                            {classroom.subject_code} – {classroom.subject_name} | Section{" "}
                            {classroom.section}
                        </p>
                        <p className="text-muted mb-0">
                            ปีการศึกษา {classroom.year} ภาคเรียน {classroom.semester}
                        </p>
                    </div>

                    <div className="row g-4 mb-4">
                        {/* เพิ่มแบบกรอกมือ */}
                        <div className="col-lg-5">
                            <div className="card card-soft">
                                <div className="card-soft-header p-3">
                                    <h5 className="fw-bold mb-0">
                                        เพิ่มนักศึกษา (กรอกมือ)
                                    </h5>
                                </div>
                                <div className="card-body p-3">
                                    <div className="mb-3">
                                        <label className="form-label">รหัสนักศึกษา</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={manual.student_id}
                                            onChange={(e) =>
                                                setManual((prev) => ({
                                                    ...prev,
                                                    student_id: e.target.value,
                                                }))
                                            }
                                            placeholder="เช่น 660101001"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อ-สกุล</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={manual.name}
                                            onChange={(e) =>
                                                setManual((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder="เช่น นาย ก้องภพ สมยศ"
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={handleAddManual}
                                    >
                                        เพิ่มเข้ารายการ
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* นำเข้า CSV */}
                        <div className="col-lg-7">
                            <div className="card card-soft">
                                <div className="card-soft-header p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">
                                        นำเข้าจากไฟล์ CSV
                                    </h5>
                                    <small className="text-muted">
                                        รองรับหัวตาราง: <code>student_id, name</code>
                                    </small>
                                </div>
                                <div className="card-body p-3">
                                    <div className="mb-3">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            className="form-control"
                                            onChange={handleFileChange}
                                        />
                                        {csvError && (
                                            <div className="mt-2 text-danger" style={{ fontSize: "0.9rem" }}>
                                                {csvError}
                                            </div>
                                        )}
                                    </div>
                                    <div className="alert alert-light border" style={{ fontSize: "0.9rem" }}>
                                        <div className="fw-semibold mb-1">ตัวอย่างรูปแบบ CSV:</div>
                                        <pre className="mb-0">
                                            student_id,name
                                            660101001,นาย ก้องภพ สมยศ
                                            660101002,น.ส. จิราพร รักดี
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ตารางรายการนักศึกษาที่จะเพิ่ม */}
                    <div className="bg-white p-4 shadow-sm rounded-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">รายการนักศึกษาที่จะเพิ่ม</h5>
                            <button
                                className="btn btn-success"
                                onClick={handleSaveAll}
                                disabled={!students.length}
                            >
                                บันทึกเข้าระบบ ({students.length} คน)
                            </button>
                        </div>

                        {students.length === 0 ? (
                            <p className="text-muted mb-0">
                                ยังไม่มีนักศึกษาในรายการ กรุณาเพิ่มด้วยการกรอกมือหรือ import CSV
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "160px" }}>รหัสนักศึกษา</th>
                                            <th>ชื่อ-สกุล</th>
                                            <th style={{ width: "80px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => (
                                            <tr key={s.student_id}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={s.student_id}
                                                        onChange={(e) =>
                                                            handleEditStudent(
                                                                s.student_id,
                                                                "student_id",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={s.name}
                                                        onChange={(e) =>
                                                            handleEditStudent(
                                                                s.student_id,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleRemoveStudent(s.student_id)}
                                                    >
                                                        ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
