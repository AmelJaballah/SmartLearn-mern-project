import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Profile from "./pages/Profile";
import ExerciseGenerator from "./pages/ExerciseGenerator";
import Chatbot from "./pages/Chatbot";
import ProfessorCourses from "./pages/ProfessorCourses";
import MyEnrollments from "./pages/MyEnrollments";
import StudentSubmissions from "./pages/StudentSubmissions";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercise-generator"
            element={
              <ProtectedRoute>
                <ExerciseGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor-courses"
            element={
              <ProtectedRoute>
                <ProfessorCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-submissions"
            element={
              <ProtectedRoute>
                <StudentSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-enrollments"
            element={
              <ProtectedRoute>
                <MyEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
