import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { checkAuth } from "./authSlice";
import Homepage from "./pages/Homepage";
import ProblemsCatalog from "./pages/ProblemsCatalog";
import ProblemWorkspace from "./pages/ProblemWorkspace";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminCreateProblem from "./pages/AdminCreateProblem";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-sky-500"></span>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161824",
            color: "#f8fafc",
            border: "1px solid #282d44",
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: "500",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/problems" element={<ProblemsCatalog />} />
        <Route path="/problem/:id" element={<ProblemWorkspace />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminCreateProblem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminCreateProblem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-problem"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminCreateProblem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
