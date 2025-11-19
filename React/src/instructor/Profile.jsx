import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "./Navbar";

export default function InsProfile() {
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    email: "",
    birth_date: "",
    role_id: "",
    role_name: "",
    faculty_id: "",
    faculty_name: "",
    department_id: "",
    department_name: "",
    profile_photo: "", // ✅ path / URL รูปโปรไฟล์
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ====== state สำหรับรูปโปรไฟล์ ======
  const [previewImage, setPreviewImage] = useState(null); // URL preview
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const userInfo = localStorage.getItem("user");


  // helper: resize รูปก่อนส่ง
  const resizeImage = (file, maxWidth = 512, maxHeight = 512) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        let { width, height } = img;

        const scale = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Resize failed"));
            const resizedFile = new File([blob], file.name, {
              type: blob.type,
            });
            resolve(resizedFile);
          },
          "image/jpeg",
          0.9
        );
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  };

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const init = async () => {
      try {
        const rawUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");


        if (!rawUser || !token) {
          window.location.href = "/login";
          return;
        }

        const storedUser = JSON.parse(rawUser);
        const userId = storedUser.user_id;

        const [userRes, facRes, depRes] = await Promise.all([
          axios.get(`${API_URL}/getUserProfile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/faculties`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/departments`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);



        const u = userRes.data.data;


        // เซตข้อมูลลง form
        setFormData({
          user_id: u.user_id,
          full_name: u.full_name,
          email: u.email,
          birth_date: u.birth_date?.slice(0, 10) ?? "",
          role_id: u.role_id,
          role_name: u.role_name,
          faculty_id: u.faculty_id ?? "",
          faculty_name: u.faculty_name ?? "",
          department_id: u.department_id ?? "",
          department_name: u.department_name ?? "",
          profile_photo: u.profile_photo ?? "",

        });

        if (u.profile_photo) {
          setPreviewImage(API_URL+u.profile_photo);
        }

        setFaculties(facRes.data.data || []);
        setDepartments(depRes.data.data || []);
      } catch (err) {
        console.log(err);

        Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: err.response?.data?.message || "เกิดข้อผิดพลาด",
        });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    // ตรวจสอบรหัสผ่านใหม่
    if (passwords.newPassword || passwords.confirmPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        Swal.fire({
          icon: "warning",
          title: "รหัสผ่านไม่ตรงกัน",
          text: "กรุณายืนยันรหัสผ่านให้ตรงกัน",
        });
        return;
      }
    }

    // payload หลังลบ faculty / department แล้ว
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
    };

    if (passwords.newPassword.trim() !== "") {
      payload.password = passwords.newPassword.trim();
    }

    try {
      const res = await axios.put(
        `${API_URL}/profile_update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const updated = res.data.data;

      // sync localStorage
      localStorage.setItem("user", JSON.stringify(updated));

      // อัปเดตข้อมูลใน state
      setFormData((prev) => ({
        ...prev,
        full_name: updated.full_name,
        email: updated.email,
        birth_date: updated.birth_date
          ? String(updated.birth_date).slice(0, 10)
          : prev.birth_date,
        role_id: updated.role_id,
        role_name: updated.role_name,
        profile_photo: updated.profile_photo || prev.profile_photo, // โปรไฟล์
      }));

      if (updated.profile_photo) {
        setPreviewImage(updated.profile_photo);
      }

      // clear password field
      setPasswords({ newPassword: "", confirmPassword: "" });

      Swal.fire({
        icon: "success",
        title: "บันทึกโปรไฟล์สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: err.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
      });
    }
  };


  // จัดการเวลาเลือกไฟล์จาก input
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadImage(file);
  };

  // Drag & Drop
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processAndUploadImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // resize + upload ไป server
 const processAndUploadImage = async (file) => {
  try {
    // -------------------------------------
    // 1) Validation ชนิดไฟล์
    // -------------------------------------
    if (!file?.type?.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์ไม่ถูกต้อง",
        text: "กรุณาเลือกรูปภาพเท่านั้น",
      });
      return;
    }

    setUploading(true);

    // -------------------------------------
    // 2) Resize ก่อนอัปโหลด
    // -------------------------------------
    const resized = await resizeImage(file, 512, 512);

    // Preview local ทันที
    const localURL = URL.createObjectURL(resized);
    setPreviewImage(localURL);

    // -------------------------------------
    // 3) Upload to Backend
    // -------------------------------------
    const form = new FormData();
    form.append("photo", resized);

    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API_URL}/profile/upload_profile_photo`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("UPLOAD RESPONSE:", res.data);

    // -------------------------------------
    // 4) ตรวจ response จาก backend
    // -------------------------------------
    const updated = res.data.data || {};
    const serverPath = updated.file_path  || null;
    console.log(serverPath);
    
    if (!serverPath) {
      Swal.fire({
        icon: "warning",
        title: "อัปโหลดสำเร็จ แต่ไม่ได้รับ path รูปกลับมา",
      });
      return;
    }

    const fullImageURL = API_URL + serverPath;

    // -------------------------------------
    // 5) อัปเดต State
    // -------------------------------------
    setFormData((prev) => ({
      ...prev,
      profile_photo: fullImageURL,
    }));

    setPreviewImage(fullImageURL);

    // -------------------------------------
    // 6) sync localStorage
    // -------------------------------------
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const old = JSON.parse(rawUser);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...old, profile_photo: fullImageURL })
      );
    }

    Swal.fire({
      icon: "success",
      title: "อัปโหลดรูปโปรไฟล์สำเร็จ",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "อัปโหลดรูปไม่สำเร็จ",
      text: err.response?.data?.message || "เกิดข้อผิดพลาดในระบบ",
    });
  } finally {
    setUploading(false);
  }
};


  if (loading) {
    return (
      <div className="d-flex">
        <Navbar />
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Navbar />
      <div
        className="flex-grow-1"
        style={{ background: "linear-gradient(135deg,#f8f5ff 0%,#fff 100%)" }}
      >
        {/* Header */}
        <div className="bg-white shadow-sm border-bottom">
          <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                  โปรไฟล์ของฉัน
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                  แก้ไขข้อมูลส่วนตัวและรหัสผ่านของผู้ใช้ปัจจุบัน
                </p>
              </div>
              <div className="d-flex gap-2">
                <span className="badge bg-primary badge-custom">
                  วันนี้:{" "}
                  {new Date().toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container bg-white rounded-4 shadow-lg p-4 mt-5 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="row"
          >
            {/* ด้านซ้าย: Avatar + Upload */}
            <div className="col-md-4 d-flex flex-column align-items-center mb-4 mb-md-0">
              {/* วงกลมแสดงรูปโปรไฟล์ */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3 overflow-hidden"
                style={{
                  width: 170,
                  height: 170,
                  border: "2px solid #7b2ff7",
                  background:
                    "linear-gradient(135deg, rgba(123,47,247,0.12), rgba(255,255,255,1))",
                }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 48,
                      color: "#7b2ff7",
                      fontWeight: "bold",
                    }}
                  >
                    {formData.full_name
                      ? formData.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                )}
              </div>
              <h4 className="fw-bold mb-1">{formData.full_name}</h4>
              <p className="text-muted mb-1">{formData.email}</p>
              <span className="badge bg-secondary mb-3">
                {formData.role_name || "User"}
              </span>

              {/* Dropzone อัปโหลดรูป */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border rounded-3 p-3 text-center"
                style={{
                  width: "100%",
                  cursor: "pointer",
                  borderStyle: "dashed",
                  borderColor: "#7b2ff7",
                  backgroundColor: "#faf5ff",
                  fontSize: 13,
                }}
              >
                <p className="mb-1 fw-semibold" style={{ color: "#6d28d9" }}>
                  ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือก
                </p>
                <p className="mb-0 text-muted">
                  รองรับไฟล์ภาพ JPG/PNG จะถูกย่อขนาดอัตโนมัติ
                </p>
                {uploading && (
                  <div className="mt-2 text-primary">กำลังอัปโหลด...</div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* ด้านขวา: Form ข้อมูลทั่วไป + รหัสผ่าน */}
            <div className="col-md-8">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label">รหัสผู้ใช้</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.user_id}
                      disabled
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label">ชื่อ-สกุล</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          full_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label">วันเกิด</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.birth_date}
                      disabled
                    />
                    <small className="text-muted">
                      แก้ไขวันเกิดได้จากระบบทะเบียนกลาง (ถ้ามี)
                    </small>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label">คณะ</label>
                    <select
                      className="form-select"
                      value={formData.faculty_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          faculty_id: e.target.value,
                          department_id: "",
                        })
                      }
                    >
                      <option value="">-- เลือกคณะ --</option>
                      {faculties.map((f) => (
                        <option key={f.faculty_id} value={f.faculty_id}>
                          {f.faculty_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label">สาขา</label>
                    <select
                      className="form-select"
                      value={formData.department_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department_id: e.target.value,
                        })
                      }

                    >
                      <option value="">-- เลือกสาขา --</option>
                      {departments
                        .filter(
                          (d) =>
                            !formData.faculty_id ||
                            String(d.faculty_id) ===
                            String(formData.faculty_id)
                        )
                        .map((d) => (
                          <option
                            key={d.department_id}
                            value={d.department_id}
                          >
                            {d.department_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* เปลี่ยนรหัสผ่าน */}
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <label className="form-label">รหัสผ่านใหม่</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="กรอกรหัสใหม่ถ้าต้องการเปลี่ยน"
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="กรอกซ้ำให้ตรงกัน"
                    />
                  </div>
                  <div className="col-12">
                    <small className="text-muted">
                      * ถ้าเว้นว่าง จะยังใช้รหัสผ่านเดิม
                    </small>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="submit" className="btn btn-primary">
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
