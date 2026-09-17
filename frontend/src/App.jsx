import { Routes, Route, Navigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { checkAuth } from "./authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";
import { useTheme } from "./context/ThemeContext";

// route-level code splitting keeps the initial bundle small (monaco lives in the workspace chunk)
const Homepage = lazy(() => import("./pages/Homepage"));
const ProblemsCatalog = lazy(() => import("./pages/ProblemsCatalog"));
const ProblemWorkspace = lazy(() => import("./pages/ProblemWorkspace"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminCreateProblem = lazy(() => import("./pages/AdminCreateProblem"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));

// scroll to the top on route changes (except in-page hash links)
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // the browser would otherwise restore the previous scroll offset of the history entry
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const raf = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!initialized) {
    return <PageLoader message="Preparing your workspace..." />;
  }

  const isDark = theme === "dark";

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 3500,
          style: {
            background: isDark ? "#1c1c1c" : "#ffffff",
            color: isDark ? "#f8fafc" : "#171717",
            border: `1px solid ${isDark ? "#2e2e2e" : "#e5e5e5"}`,
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "500",
            padding: "10px 14px",
            maxWidth: "min(92vw, 420px)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
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
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/create-problem" element={<Navigate to="/admin?tab=create" replace />} />

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
      </Suspense>
    </>
  );
}

export default App;
