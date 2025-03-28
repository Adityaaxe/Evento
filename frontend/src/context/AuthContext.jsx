import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleApiCall = async (url, method, body) => {
    try {
      console.log(`Attempting ${method} request to ${url}`);
      console.log('Request Body:', body);

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log('Full Response:', response);
      console.log('Response Status:', response.status);
      
      const data = await response.text();
      console.log('Raw Response Data:', data);

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(parsedData.message || "Operation failed");
      }

      return parsedData;
    } catch (error) {
      console.error(`Detailed Error in ${method} request:`, error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const data = await handleApiCall(
        "http://localhost:5000/api/login", 
        "POST", 
        { email, password }
      );

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.isOrganizer ? "/admin" : "/home");
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message || "Login failed");
    }
  };

  const register = async (formData) => {
    try {
      const data = await handleApiCall(
        "http://localhost:5000/api/register", 
        "POST", 
        formData
      );

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.isOrganizer ? "/admin" : "/home");
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};