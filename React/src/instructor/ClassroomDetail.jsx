import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "../axiosConfig";
import Swal from "sweetalert2";
import "./Style/Courses.css"; // ใช้สไตล์เดียวกับหน้าอื่น

const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export default function ClassroomDetail() {
  const { id } = useParams();

  // ============= STATE =============

  // วันที่ที่เคยเช็คชื่อ + วันที่ที่เลือกปัจจุบัน
  const [dates, setDates] = useState([todayStr]);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [loadingClassroom, setLoadingClassroom] = useState(true);

  const [classroom, setClassroom] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [students, setStudents] = useState([]);

  const [showSettings, setShowSettings] = useState(false);

  // modal ชั้นที่สอง: ตั้งค่าเวลาเช็คชื่อ
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    startTime: "",
    endTime: "",
    lateAfter: "",
  });

  // ============= SUMMARY (ต่อวันตาม selectedDate) =============
  const summary = useMemo(() => {
    let present = 0,
      late = 0,
      absent = 0,
      total = 0;

    students.forEach((std) => {
      const a = std.attendance[selectedDate];
      if (!a) return;
      total++;
      if (a.status === "present") present++;
      else if (a.status === "late") late++;
      else absent++;
    });

    return total
      ? {
        presentPercent: Math.round((present / total) * 100),
        latePercent: Math.round((late / total) * 100),
        absentPercent: Math.round((absent / total) * 100),
      }
      : { presentPercent: 0, latePercent: 0, absentPercent: 0 };
  }, [students, selectedDate]);

  // ============= UPDATE ATTENDANCE (local state) =============
  const updateAttendanceStatus = (sid, date, newStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === sid
          ? {
            ...s,
            attendance: {
              ...s.attendance,
              [date]: { ...(s.attendance[date] || {}), status: newStatus },
            },
          }
          : s
      )
    );
  };

  const updateAttendanceTime = (sid, date, newTime) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === sid
          ? {
            ...s,
            attendance: {
              ...s.attendance,
              [date]: { ...(s.attendance[date] || {}), time: newTime },
            },
          }
          : s
      )
    );
  };

  // ============= SCHEDULE MODAL HANDLER =============
  const openScheduleModal = () => {
    const schedule = classroom?.schedule || {};
    setScheduleConfig({
      startTime: schedule.start_time || "",
      endTime: schedule.end_time || "",
      lateAfter: schedule.late_after || "",
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSave = async () => {
    try {
      setSavingSchedule(true);

      const payload = {
        start_time: scheduleConfig.startTime,
        end_time: scheduleConfig.endTime,
        late_after: scheduleConfig.lateAfter,
      };

      const res = await axios.put(`/instructor/${id}/schedule`, payload);
      const data = res.data;

      setClassroom((prev) => ({
        ...prev,
        schedule: {
          ...(prev?.schedule || {}),
          start_time: data.schedule.start_time,
          end_time: data.schedule.end_time,
          late_after: data.schedule.late_after,
        },
      }));

      setShowScheduleModal(false);
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "อัปเดตเวลาเรียนเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("handleScheduleSave error:", err);
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text:
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการบันทึกเวลา โปรดลองใหม่อีกครั้ง",
      });
    } finally {
      setSavingSchedule(false);
    }
  };

  // ============= บันทึกการเช็คชื่อเข้าฐานข้อมูล =============
  const handleSaveAttendance = async () => {
    try {
      const payload = {
        date: selectedDate,
        items: students.map((s) => ({
          enrollment_id: s.enrollment_id,
          status: s.attendance[selectedDate]?.status || "absent",
          time: s.attendance[selectedDate]?.time || null,
        })),
      };

      await axios.put(`/instructor/classroom/${id}/attendance`, payload);

      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกการเข้าเรียนเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("handleSaveAttendance error:", err);
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text:
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการบันทึกการเข้าเรียน โปรดลองใหม่อีกครั้ง",
      });
    }
  };

  // ============= Format Date =============
  const formatThaiDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // ============= EFFECT: โหลดข้อมูลห้องเรียน =============
  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        setLoadingClassroom(true);

        const res = await axios.get(`/classrooms/${id}`);
        console.log("CLASSROOM RAW =", res.data);

        const c = res.data.data || res.data;

        setClassroom({
          classroom_id: c.classroom_id || id,
          subject_code: c.subject_code || c.course_id || "N/A",
          subject_name: c.subject_name || c.course_name || "N/A",
          section: c.section,
          year: c.year,
          semester: c.semester,
          credit: c.credit ?? 0,
          teacher_name: c.teacher_name || c.instructor_name || "",
          student_count: c.student_count ?? 0,
          room: c.room || "-",
          schedule: {
            start_time:
              c.schedule?.start_time || c.start_time || c.Start || "",
            end_time: c.schedule?.end_time || c.end_time || c.End || "",
            late_after:
              c.schedule?.late_after || c.late_after || c.Late || "",
            // ถ้า backend มี day / check_end ก็ map ตรงนี้ได้
            day: c.schedule?.day || c.day || "",
            check_end: c.schedule?.check_end || c.check_end || "",
          },
        });
      } catch (err) {
        console.error("fetchClassroom error:", err);
        Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลชั้นเรียนไม่สำเร็จ",
          text:
            err.response?.data?.message ||
            "ไม่สามารถดึงข้อมูลชั้นเรียนได้ โปรดลองใหม่อีกครั้ง",
        });
        setClassroom(null);
      } finally {
        setLoadingClassroom(false);
      }
    };

    if (id) {
      fetchClassroom();
    }
  }, [id]);
  const normalizeDate = (value) => {
    if (!value) return null;

    // ถ้าเดิมเป็น "YYYY-MM-DD" อยู่แล้ว ก็ใช้เลย
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return null;
    }

    // ใช้ locale ที่ให้ format YYYY-MM-DD เช่น sv-SE
    // จะได้ string แบบ "2025-11-18"
    return d.toLocaleDateString("sv-SE"); // หรือ "en-CA" ก็ได้เหมือนกัน
  };

  // ============= EFFECT: โหลด "วันที่ที่เคยเช็คชื่อแล้ว" =============
  useEffect(() => {
    if (!id) return;

    const fetchDates = async () => {
      try {
        const res = await axios.get(
          `/instructor/classroom/${id}/attendance/dates`
        );
        const dbDates = res.data.data || []; // ["2025-11-15", "2025-11-18"]

        const setAll = new Set(dbDates);
        setAll.add(todayStr); // กันกรณีวันนี้ยังไม่เคยเช็ค

        const merged = Array.from(setAll).sort((a, b) => a.localeCompare(b));
        setDates(merged);

        console.log("merged dates =", merged);
      } catch (err) {
        console.error("fetchDates error:", err);
        setDates([todayStr]);
      }
    };

    fetchDates();
  }, [id]);


  // ============= EFFECT: โหลด attendance manual ตาม selectedDate =============
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchManualAttendance = async () => {
      try {
        const res = await axios.get(
          `/instructor/classroom/${id}/attendance`,
          { params: { date: selectedDate } }
        );

        const items = res.data.data || [];

        // รวม attendance ของวันที่ใหม่เข้าไปใน state เดิม (เพื่อให้ matrix ใช้ได้หลายวัน)
        setStudents((prev) => {
          const prevMap = new Map(prev.map((s) => [s.student_id, s]));

          const next = items.map((s) => {
            const existed = prevMap.get(s.student_id);
            const prevAttendance = existed?.attendance || {};

            return {
              enrollment_id: s.enrollment_id,
              student_id: s.student_id,
              name: s.student_name,
              attendance: {
                ...prevAttendance,
                [selectedDate]: {
                  status: s.status || "absent",
                  time: s.time || "",
                },
              },
            };
          });

          return next;
        });
      } catch (err) {
        console.error("fetchManualAttendance error:", err);
        Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลการเข้าเรียนไม่สำเร็จ",
          text:
            err.response?.data?.message ||
            "ไม่สามารถดึงข้อมูลการเข้าเรียนได้ โปรดลองใหม่อีกครั้ง",
        });
      }
    };

    fetchManualAttendance();
  }, [id, selectedDate]);

  // ============= RENDER =============

  if (loadingClassroom) {
    return (
      <div className="d-flex">
        <Navbar />
        <div className="flex-grow-1 p-4">
          <div className="bg-white p-4 shadow-sm rounded-4">
            กำลังโหลดข้อมูลชั้นเรียน...
          </div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="d-flex">
        <Navbar />
        <div className="flex-grow-1 p-4">
          <div className="bg-white p-4 shadow-sm rounded-4 text-danger">
            ไม่พบข้อมูลชั้นเรียน
          </div>
        </div>
      </div>
    );
  }

  const schedule = classroom.schedule || {};

  return (
    <>
      <style>{`
        .setting-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: .2s;
        }
        .setting-btn:hover {
          background: #e2e8ff;
          transform: rotate(10deg);
        }
        .matrix-cell {
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
        }
      `}</style>

      <div className="d-flex">
        <Navbar />

        <div className="flex-grow-1 p-4 ">
          {/* HEADER INFO */}
          <div className="bg-white p-4 shadow-sm rounded-4 mb-4 d-flex justify-content-between">
            <div>
              <h3 className="fw-bold">
                {classroom.subject_code} – {classroom.subject_name}
              </h3>
              <p className="text-muted mb-1">
                Section {classroom.section} | ปี {classroom.year} เทอม{" "}
                {classroom.semester}
              </p>

              <p className="mb-0">
                ⏰ {schedule.day || "-"} —{" "}
                {schedule.start_time || "--:--"} -{" "}
                {schedule.end_time || "--:--"}
                <br />
                <small className="text-muted">
                  เข้าสายหลังเวลา {schedule.late_after || "--:--"}
                </small>
              </p>
            </div>

            <button
              className="setting-btn"
              onClick={() => setShowSettings(true)}
            >
              <i className="bi bi-gear-fill fs-4"></i>
            </button>
          </div>

          {/* Summary */}
          <div className="bg-white p-4 shadow-sm rounded-4 mb-4">
            <h5 className="fw-bold mb-3">สรุปการเข้าเรียน ({formatThaiDate(selectedDate)})</h5>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 bg-success bg-opacity-10 rounded-4">
                  <div className="text-muted">มาเรียน</div>
                  <div className="fs-3 fw-bold text-success">
                    {summary.presentPercent}%
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 bg-warning bg-opacity-10 rounded-4">
                  <div className="text-muted">มาสาย</div>
                  <div className="fs-3 fw-bold text-warning">
                    {summary.latePercent}%
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 bg-danger bg-opacity-10 rounded-4">
                  <div className="text-muted">ขาดเรียน</div>
                  <div className="fs-3 fw-bold text-danger">
                    {summary.absentPercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DAILY EDIT */}
          <div className="bg-white p-4 shadow-sm rounded-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">แก้ไขการเข้าเรียนรายวัน</h5>

              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {dates.map((d) => (
                    <option value={d} key={d}>
                      {formatThaiDate(d)}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-primary"
                  onClick={handleSaveAttendance}
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>

            <table className="table align-middle">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ</th>
                  <th>เวลาเข้า</th>
                  <th>สถานะ</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => {
                  const att = s.attendance[selectedDate] || {
                    status: "absent",
                    time: "",
                  };

                  return (
                    <tr key={s.student_id}>
                      <td>{s.student_id}</td>
                      <td>{s.name}</td>

                      <td>
                        <input
                          type="time"
                          className="form-control"
                          value={att.time || ""}
                          onChange={(e) =>
                            updateAttendanceTime(
                              s.student_id,
                              selectedDate,
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <select
                          className="form-select"
                          value={att.status}
                          onChange={(e) =>
                            updateAttendanceStatus(
                              s.student_id,
                              selectedDate,
                              e.target.value
                            )
                          }
                        >
                          <option value="present">มาเรียน</option>
                          <option value="late">มาสาย</option>
                          <option value="absent">ขาดเรียน</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SUMMARY MATRIX (สะสมหลายวันจาก fetchManualAttendance ที่ merge state เอาไว้) */}
          <div className="bg-white p-4 shadow-sm rounded-4 mb-4">
            <h5 className="fw-bold mb-3">ตารางการเข้าเรียน</h5>

            <table className="table text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-start">ชื่อ</th>
                  {dates.map((d) => (
                    <th key={d}>{formatThaiDate(d)}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id}>
                    <td className="text-start fw-semibold">{s.name}</td>

                    {dates.map((d) => {
                      const att = s.attendance[d]?.status || "absent";
                      const type =
                        att === "present"
                          ? "success"
                          : att === "late"
                            ? "warning"
                            : "danger";

                      return (
                        <td key={d}>
                          <div
                            className={`matrix-cell bg-${type} bg-opacity-10 text-${type}`}
                          >
                            {att === "present"
                              ? "P"
                              : att === "late"
                                ? "L"
                                : "A"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <Modal
        show={showSettings}
        centered
        onHide={() => setShowSettings(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>ตั้งค่าชั้นเรียน</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-grid gap-3">
            <Button
              variant="primary"
              className="d-flex justify-content-between align-items-center py-3"
              onClick={() => {
                setShowSettings(false);
                window.location.href = `/instructor/classroom/${id}/students`;
              }}
            >
              <span>
                <i className="bi bi-people-fill me-2"></i>
                จัดการสมาชิกในชั้น
              </span>
              <i className="bi bi-chevron-right"></i>
            </Button>

            <Button
              variant="outline-secondary"
              className="d-flex justify-content-between align-items-center py-3"
              onClick={openScheduleModal}
            >
              <span>
                <i className="bi bi-clock-history me-2"></i>
                จัดการเวลาของชั้นเรียน / เวลาเช็คชื่อ
              </span>
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSettings(false)}
            disabled={savingSchedule}
          >
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SCHEDULE CONFIG MODAL (ชั้นที่สอง) */}
      <Modal
        show={showScheduleModal}
        centered
        onHide={() => setShowScheduleModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>กำหนดเวลาเรียนและเวลาเช็คชื่อ</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">เวลาเริ่มเรียน</label>
              <input
                type="time"
                className="form-control"
                value={scheduleConfig.startTime}
                onChange={(e) =>
                  setScheduleConfig((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">เวลาเลิกเรียน</label>
              <input
                type="time"
                className="form-control"
                value={scheduleConfig.endTime}
                onChange={(e) =>
                  setScheduleConfig((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <hr className="my-4" />

          <h6 className="fw-bold mb-3">ตั้งกติกาเวลาเช็คชื่อ</h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">ถือว่า "มาสาย" หลังเวลา</label>
              <input
                type="time"
                className="form-control"
                value={scheduleConfig.lateAfter}
                onChange={(e) =>
                  setScheduleConfig((prev) => ({
                    ...prev,
                    lateAfter: e.target.value,
                  }))
                }
              />
              <div className="form-text">
                เช่น 08:10 หมายถึง เวลาเข้า &gt; 08:10 = มาสาย
              </div>
            </div>

            <div className="col-md-6"></div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowScheduleModal(false)}
          >
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleScheduleSave}>
            บันทึกเวลา
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
