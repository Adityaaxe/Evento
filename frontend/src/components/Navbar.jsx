import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" className="w-10 h-10" />
        <h1 className="text-xl font-bold">Evento</h1>
      </div>
      
      {/* Center - Menu Links */}
      <ul className="flex gap-6 text-lg">
        <li><Link to="/contactus" className="hover:text-gray-400">Contact Us</Link></li>
      </ul>
    
    </nav>
  );
};

export default Navbar;