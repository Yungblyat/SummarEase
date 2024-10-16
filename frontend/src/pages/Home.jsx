import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, USER_NAME } from "../constants";
import UploadSection from "../components/UploadSection";
import LoginModal from "../components/LoginModal";
import "../styles/Home.css";
import logo_icon from "../assets/logo_nav.png";
import Features from "../components/FeaturesSection";
import About from "../components/AboutSection";
import Footer from "../components/FooterSection";

// Custom function to decode JWT because for some reason the built in function kept crashing the app in this specific file, you're welcome to try your luck
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT", error);
    return null;
  }
}

export default function Home() {
  const [username, setUsername] = useState(
    localStorage.getItem(USER_NAME) || ""
  );
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken) {
        setUser(decodedToken);
      } else {
        localStorage.removeItem(ACCESS_TOKEN);
      }
    }
  }, []);

  const handleLoginSuccess = (token) => {
    const decodedToken = decodeJWT(token);
    if (decodedToken) {
      setUser(decodedToken);
      const newUsername =
        localStorage.getItem(USER_NAME) || decodedToken.username;
      setUsername(newUsername);
      localStorage.setItem(USER_NAME, newUsername);
      setIsLoginOpen(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    setUser(null);
    setIsDropdownOpen(false);
  };

  const handleLoginRequired = () => {
    setIsLoginOpen(true);
  };

  return (
    <div className="main">
      <div className="container">
        <header className="header">
          <nav className="navbar">
            <div className="left">
              <div className="logo">
                <img src={logo_icon} alt="" />
              </div>
              {/* <span className="title">SummarEase</span> */}
            </div>
            <div className="nav-center">
              <a href="/" className="text">
                Home
              </a>
              <a href="#features" className="text">
                Features
              </a>
              <a href="#upload" className="text">
                Upload
              </a>
              <a href="#about" className="text">
                About
              </a>
            </div>
            {user ? (
              <div className="relative">
                <button
                  className="dropdown"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{localStorage.getItem(USER_NAME)}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                    <a
                      href=""
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/history");
                      }}
                    >
                      History
                    </a>
                    <a
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="animated-button"
                onClick={() => setIsLoginOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="arr-2"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                </svg>
                <span className="text">Login</span>
                <span className="circle"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="arr-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                </svg>
              </button>
            )}
          </nav>
        </header>
        <main className="head">
          <h1 className="head-title">Streamline Your Meetings</h1>
          <p className="head-text">
            Our meeting summarizer helps you upload meeting recordings and
            transforms them into concise, actionable insights. Perfect for busy
            professionals, it automatically extracts the key points from your
            meetings, ensuring you capture all vital information without sifting
            through hours of audio. With our tool, you can easily review what
            matters most, saving time and boosting productivity. Whether it's a
            team meeting, client call, or webinar, our service provides clear,
            easy-to-understand summaries that help you make informed decisions
            faster.
          </p>
          <div className="buttons">
            <a href="#upload">
              <button className="button1">
                <div className="svg-wrapper-1">
                  <div className="svg-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path
                        fill="currentColor"
                        d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <span>Get Started</span>
              </button>
            </a>
            <a href="#features">
              <button className="button2">
                Learn More
                <span></span>
              </button>
            </a>
          </div>
        </main>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Features />

      <UploadSection
        isLoggedIn={!!user}
        onLoginRequired={handleLoginRequired}
      />

      <About />

      <Footer />
    </div>
  );
}
