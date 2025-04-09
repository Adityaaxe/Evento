import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import PageSetup from "../components/PageSetup";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  // Redirect to home if already signed in
  if (isSignedIn) {
    return <Navigate to="/home" />;
  }

  // Define Button component for use in SignInButton and Learn More button
  const Button = ({ children, className, variant }) => {
    const baseClasses = "font-semibold px-6 py-2 rounded-full transition-all";
    const variantClasses = variant === "outline" 
      ? "border border-white text-white hover:bg-white hover:text-black" 
      : "bg-yellow-400 hover:bg-yellow-300 text-black";
    
    return (
      <button className={`${baseClasses} ${variantClasses} ${className || ''}`}>
        {children}
      </button>
    );
  };

  return (
    <PageSetup>
      <div className="flex justify-center items-center h-screen p-3 bg-gradient-to-br from-purple-900 via-fuchsia-800 to-pink-700">
        <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl text-center shadow-2xl max-w-xl border border-white/20">
          <h1 className="text-5xl font-extrabold text-white drop-shadow mb-4">
            Carnival
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Dive into the celebration of culture, tech, and creativity.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <SignInButton>
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2 rounded-full transition-all">
                Enter the Carnival
              </Button>
            </SignInButton>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black px-6 py-2 rounded-full transition-all"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </PageSetup>
  );
}