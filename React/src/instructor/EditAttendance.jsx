import React from "react";

export default function EditAttendance() {
  return (
    <div className="p-4">
      <div className="bg-white p-4 rounded-4 shadow-sm">
        <h3 className="fw-bold mb-3">แก้ไขเวลาเรียน</h3>

        <div className="mb-3">
          <label>เวลาเริ่มเรียน</label>
          <input type="time" className="form-control" defaultValue="08:00" />
        </div>

        <div className="mb-3">
          <label>เวลานับว่ามาสาย</label>
          <input type="time" className="form-control" defaultValue="08:10" />
        </div>

        <div className="mb-3">
          <label>เวลาปิดระบบเช็คชื่อ</label>
          <input type="time" className="form-control" defaultValue="09:00" />
        </div>

        <div className="mb-3">
          <label>แจ้งเตือนถ้าขาดเกิน</label>
          <input type="number" className="form-control" defaultValue="3" />
        </div>

        <button className="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
      </div>
    </div>
  );
}
