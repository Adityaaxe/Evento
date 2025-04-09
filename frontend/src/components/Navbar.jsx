import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useAuth();
  
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" className="w-10 h-10" />
        <h1 className="text-xl font-bold">Carnival</h1>
      </div>
      
      {/* Right Side - Auth Buttons */}
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link to="/home" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            {user?.publicMetadata?.role === "admin" && (
              <Link to="/admin" className="hover:text-blue-400 transition-colors">
                Admin
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
};

export default Navbar;