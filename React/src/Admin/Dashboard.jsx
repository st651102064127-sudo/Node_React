import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";




export default function Dashboard() {
  const [stats] = useState({
    students: 1248,
    teachers: 67,
    classrooms: 42,
    users: 1315,
    attendance: 94.2,
  });

  const [lineData] = useState([
    { day: "จันทร์", users: 820 },
    { day: "อังคาร", users: 950 },
    { day: "พุธ", users: 1100 },
    { day: "พฤหัสฯ", users: 1050 },
    { day: "ศุกร์", users: 890 },
    { day: "เสาร์", users: 420 },
    { day: "อาทิตย์", users: 150 },
  ]);

  const [pieData] = useState([
    { name: "นักศึกษา", value: 1248 },
    { name: "อาจารย์", value: 67 },
  ]);

  const [attendanceData] = useState([
    { subject: "คณิตศาสตร์", rate: 96 },
    { subject: "วิทยาศาสตร์", rate: 92 },
    { subject: "ภาษาไทย", rate: 94 },
    { subject: "ภาษาอังกฤษ", rate: 89 },
    { subject: "สังคมศึกษา", rate: 91 },
  ]);

  const COLORS = ["#3b82f6", "#8b5cf6"];

  return (
    <>
      <style>{`
        .dashboard-bg {
          background-color: #f1f5f9;
          min-height: 100vh;
        }
        .stat-card {
          transition: all 0.3s ease;
          border-left: 4px solid;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .chart-card {
          transition: all 0.3s ease;
        }
        .chart-card:hover {
          box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
        }
        .badge-custom {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }
      `}</style>

      <div className="d-flex">
        <Navbar />

        <div className="flex-grow-1 dashboard-bg">
          {/* Header Section */}
          <div className="bg-white shadow-sm border-bottom">
            <div className="container-fluid p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>แดชบอร์ดผู้ดูแลระบบ</h3>
                  <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                    ภาพรวมข้อมูลและสtatistics ของระบบ
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <span className="badge bg-success badge-custom">
                    <i className="bi bi-clock"></i> ระบบทำงานปกติ
                  </span>
                  <span className="badge bg-primary badge-custom">
                    วันนี้: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="container-fluid p-4">
            {/* สถิติหลัก */}
            <div className="row g-4 mb-4">
              {[
                { label: "ผู้ใช้งานทั้งหมด", value: stats.users.toLocaleString(), icon: "👥", color: "#3b82f6", trend: "+12%", bg: "#eff6ff" },
                { label: "นักศึกษา", value: stats.students.toLocaleString(), icon: "🎓", color: "#8b5cf6", trend: "+8%", bg: "#f5f3ff" },
                { label: "อาจารย์", value: stats.teachers, icon: "🧑‍🏫", color: "#10b981", trend: "+3", bg: "#f0fdf4" },
                { label: "ห้องเรียน", value: stats.classrooms, icon: "🏫", color: "#f59e0b", trend: "+2", bg: "#fffbeb" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="col-lg-3 col-md-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <div className="card stat-card border-0 shadow-sm h-100" style={{ borderLeftColor: item.color, backgroundColor: item.bg }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="p-2 rounded-3" style={{ backgroundColor: 'white' }}>
                          <span style={{ fontSize: "1.8rem" }}>{item.icon}</span>
                        </div>
                        <span className="badge bg-white text-success fw-semibold">
                          {item.trend}
                        </span>
                      </div>
                      <h6 className="text-muted mb-2" style={{ fontSize: "13px", fontWeight: "600" }}>
                        {item.label}
                      </h6>
                      <h2 className="fw-bold mb-0" style={{ color: item.color }}>
                        {item.value}
                      </h2>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* กราฟและสถิติเพิ่มเติม */}
            <div className="row g-4">
              {/* Line Chart */}
              <div className="col-lg-8">
                <div className="card chart-card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="fw-bold mb-1">การเข้าใช้งานรายวัน</h5>
                        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>จำนวนผู้เข้าใช้งานระบบในแต่ละวัน</p>
                      </div>
                      <select className="form-select form-select-sm" style={{ width: "150px" }}>
                        <option>สัปดาห์นี้</option>
                        <option>เดือนนี้</option>
                        <option>ปีนี้</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: "#3b82f6" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="col-lg-4">
                <div className="card chart-card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-1">สัดส่วนผู้ใช้งาน</h5>
                    <p className="text-muted mb-4" style={{ fontSize: "13px" }}>แบ่งตามประเภทผู้ใช้</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelStyle={{ fontSize: '12px', fontWeight: '600' }}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: '13px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bar Chart - อัตราการเข้าเรียน */}
              <div className="col-12">
                <div className="card chart-card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="fw-bold mb-1">อัตราการเข้าเรียนตามวิชา</h5>
                        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>เปอร์เซ็นต์การเข้าเรียนในแต่ละรายวิชา</p>
                      </div>
                      <span className="badge bg-success badge-custom">
                        อัตราเฉลี่ย: {stats.attendance}%
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => `${value}%`}
                        />
                        <Bar dataKey="rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}