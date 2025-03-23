import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Attempting login...");
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response received:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed!");
      }

      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("User set in state:", data.user);
      console.log("User saved in localStorage:", localStorage.getItem("user"));

      // Redirect based on user role
      navigate(data.user.isOrganizer ? "/admin" : "/home");
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(error.message || "Invalid credentials!");
    }
  };

  const register = async (formData) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed!");
      }

      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on user role after registration
      navigate(data.user.isOrganizer ? "/admin" : "/home");
    } catch (error) {
      console.error("Registration failed:", error.message);
      alert(error.message || "Something went wrong!");
    }
  };
  
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};