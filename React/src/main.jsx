import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FacultiesPage from "./Admin/FacultiesPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Navbar from "./Admin/Navbar"
import DepartmentsPage from "./Admin/DepartmentsPage";
import Dashboard from "./Admin/Dashboard";
import UsersPage from "./Admin/Students";
import ProfilePage from "./Admin/Profile";
import Courses from "./Admin/CoursesPage";
import Login from "./Auth/Login"
import { RequireRole } from "./Auth/RequireAuth";
//instructor
import InsProfile from "./instructor/Profile";
import InsDasboard from "./instructor/Dashboard"
import InsCourses from "./instructor/Courses"
import InsClassroomDetail from "./instructor/ClassroomDetail"
import InsAddStudents from "./instructor/AddStudents";
import InsClassroom from "./instructor/Classrooms"
import ClassroomMembers from "./instructor/manageStduents"
const router = createBrowserRouter([
  {
    path: "Admin/faculty",
    element: <FacultiesPage />,
  },
  {
    path: "Admin/Departments",
    element: <DepartmentsPage />
  },
  {
    path: "Admin/Dashboard",
    element: (
      <RequireRole allowRoles={["3"]}>
        <Dashboard />
      </RequireRole>
    ),
  },
  {
    path: "Admin/UsersPage",
    element: (
      <RequireRole allowRoles={["3"]}>
        <UsersPage />
      </RequireRole>
    )
  },
  {
    path: "Admin/Profile",
    element: (
      <RequireRole allowRoles={["3"]}>
        <ProfilePage />
      </RequireRole>
    )
  },
  {
    path: "Admin/Courses",
    element: (
      <RequireRole allowRoles={["3"]}>
        <Courses />
      </RequireRole>
    )
  },

  {
    path: "/login",
    element: <Login />
  },

  // instructor
  {
    path: "instructor/Profile",
    element: (
      <RequireRole allowRoles={["2"]}>
        <InsProfile />
      </RequireRole>
    )
  },
  {
    path: "instructor/Dashboard",
    element: (
      <RequireRole allowRoles={["2"]}>
        <InsDasboard />
      </RequireRole>
    )
  },
  {
    path: "/instructor/classroom/:id",
    element: (
      <RequireRole allowRoles={["2"]}>
        <InsClassroomDetail />
      </RequireRole>
    ),
  }, {
    path: "/instructor/Addstudents",
    element: (
      <RequireRole allowRoles={["2"]}>
        <InsAddStudents />
      </RequireRole>
    ),
  }, {
    path: "/instructor/courses",
    element: (
      <RequireRole allowRoles={["2"]}>
        <InsCourses />
      </RequireRole>
    ),
  }, {
    path: "/instructor/classroom",
    element: (
      <RequireRole allowRoles={["2"]}>
        <InsClassroom />
      </RequireRole>
    )
  },
  {
    path: "/instructor/classroom/:id/students",
    element: (
      <RequireRole allowRoles={["2"]}>
        <ClassroomMembers />
      </RequireRole>
    )
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
