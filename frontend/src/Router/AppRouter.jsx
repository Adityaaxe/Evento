import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Pages/AuthPage";
import AdminPage from "../Pages/AdminPage";
import HomePage from "../Pages/HomePage";
import EventDetailPage from '../Pages/EventDetailPage';
import { AuthProvider } from "../context/AuthContext";
import NotFoundPage from '../Pages/NotFoundPage';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AppRouter = () => {
  return (
    <Router> {/* Ensure Router is the outermost wrapper */}
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/contactus" element={<Footer />} />
          {/* Add other routes here */}
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
