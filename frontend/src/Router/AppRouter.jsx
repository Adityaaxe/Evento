import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";
import LandingPage from "../Pages/LandingPage";
import AdminPage from "../Pages/AdminPage";
import HomePage from "../Pages/HomePage";
import EventDetailPage from '../Pages/EventDetailPage';
import NotFoundPage from '../Pages/NotFoundPage';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// 👮 Admin route guard
const RequireAdmin = ({ children }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  const role = user?.publicMetadata?.role;

  if (role === "admin") {
    return children;
  } else {
    return <RedirectToSignIn />;
  }
};

// 🔐 General auth guard for signed-in users
const RequireAuth = ({ children }) => (
  <SignedIn>{children}</SignedIn>
  ||
  <SignedOut>
    <RedirectToSignIn />
  </SignedOut>
);

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/event/:id"
          element={
            <RequireAuth>
              <EventDetailPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/contactus" element={<Footer />} />
      </Routes>
      <Footer />
    </>
  );
};

export default AppRouter;
