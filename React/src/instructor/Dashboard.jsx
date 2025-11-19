import React, { useState } from "react";
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
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";

export default function TeacherDashboard() {
  const [stats] = useState({
    students: 1248,
    attendanceToday: 842,
    absentToday: 61,
    averageRate: 92.4,
  });

  const lineData = [
    { day: "จันทร์", rate: 91 },
    { day: "อังคาร", rate: 94 },
    { day: "พุธ", rate: 89 },
    { day: "พฤหัสฯ", rate: 96 },
    { day: "ศุกร์", rate: 93 },
  ];

  const pieData = [
    { name: "มาเรียน", value: stats.attendanceToday },
    { name: "ขาดเรียน", value: stats.absentToday },
  ];

  const studentRate = [
    { name: "A101", percent: 98 },
    { name: "A102", percent: 87 },
    { name: "A103", percent: 92 },
    { name: "A104", percent: 78 },
    { name: "A105", percent: 84 },
  ];

  
  const COLORS = ["#16a34a", "#dc2626"]; // green / red

  return (
    <>
      <style>{`
        .dashboard-bg { background-color: #f1f5f9; min-height: 100vh; }
        .stat-card { transition: 0.3s; border-left: 4px solid; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .chart-card { transition: 0.3s; }
        .chart-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .sidebar-placeholder { background:#fff; border-right:1px solid #e5e7eb; }
      `}</style>

      <div className="d-flex">

         <Navbar />
       

        <div className="flex-grow-1 dashboard-bg p-4">
          {/* Header */}
          <div className="bg-white shadow-sm border rounded-4 p-4 mb-4">
            <h3 className="fw-bold mb-1">แดชบอร์ดอาจารย์</h3>
            <p className="text-muted" style={{ fontSize: "14px" }}>ภาพรวมการเข้าเรียนของนักศึกษา</p>
          </div>

          {/* Stats */}
          <div className="row g-4 mb-4">
            <div className="col-lg-4 col-md-6">
              <div className="card stat-card border-0 shadow-sm p-3 rounded-4" style={{ borderLeftColor: "#3b82f6", backgroundColor: "#eff6ff" }}>
                <p className="text-muted mb-1">จำนวนนักศึกษาทั้งหมด</p>
                <h2 className="fw-bold text-primary">{stats.students}</h2>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card stat-card border-0 shadow-sm p-3 rounded-4" style={{ borderLeftColor: "#16a34a", backgroundColor: "#f0fdf4" }}>
                <p className="text-muted mb-1">มาเรียนวันนี้</p>
                <h2 className="fw-bold text-success">{stats.attendanceToday}</h2>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card stat-card border-0 shadow-sm p-3 rounded-4" style={{ borderLeftColor: "#dc2626", backgroundColor: "#fef2f2" }}>
                <p className="text-muted mb-1">ขาดเรียนวันนี้</p>
                <h2 className="fw-bold text-danger">{stats.absentToday}</h2>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4">
            {/* Line Chart */}
            <div className="col-lg-8">
              <div className="card chart-card border-0 shadow-sm p-4 rounded-4">
                <h5 className="fw-bold mb-2">อัตราการเข้าเรียนรายสัปดาห์</h5>
                <p className="text-muted" style={{ fontSize: "13px" }}>การมาเรียนของนักศึกษาตลอดสัปดาห์</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="col-lg-4">
              <div className="card chart-card border-0 shadow-sm p-4 rounded-4 h-100">
                <h5 className="fw-bold mb-2">สัดส่วนการมาเรียนวันนี้</h5>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="col-12">
              <div className="card chart-card border-0 shadow-sm p-4 rounded-4">
                <h5 className="fw-bold mb-2">เปอร์เซ็นต์การเข้าเรียนของนักศึกษา</h5>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={studentRate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="percent" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}