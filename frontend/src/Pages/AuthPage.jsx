import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    isOrganizer: false 
  });

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Debugging: Check if state is being set properly
  console.log("Current Form State:", formData);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
        alert("Signup successful!");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Something went wrong!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl text-center shadow-lg backdrop-blur-xl">
        <h2 className="text-3xl font-bold mb-4">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {/* ✅ Debugging: Ensure Checkbox works */}
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span>Become an Organizer</span>
                <input
                  type="checkbox"
                  name="isOrganizer"
                  className="toggle-checkbox"
                  checked={formData.isOrganizer}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* ✅ Debugging: Ensure Toggle Between Login & Signup */}
        <p className="mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: "", email: "", password: "", isOrganizer: false });
            }}
          >
            {isLogin ? " Sign up" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
