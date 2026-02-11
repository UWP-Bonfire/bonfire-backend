import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/welcome.css";
import "../css/global.css";
import logo from '../assets/images/Logo.png';
export default function Welcome() {
  const navigate = useNavigate();

  // Generate stars ONCE
  useEffect(() => {
    const container = document.querySelector(".star-field");
    for (let i = 0; i < 60; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.top = Math.random() * 100 + "%";
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 2 + "s";
      container.appendChild(star);
    }
  }, []);

  // Toggle dark mode
  const toggleDark = () => {
    document.body.classList.toggle("dark");
  };

  return (
    <div className="welcome-container">
      {/* Star layer */}
      <div className="star-field"></div>

      <div className="welcome-content">
        <img src={logo} alt="Bonfire Logo" className="welcome-logo" />
        <h1>Welcome to Bonfire</h1>

        {/* DARK MODE BUTTON */}
        <button className="welcome-btn login" onClick={toggleDark}>
          🌙 Toggle Dark Mode
        </button>

        <div className="button-group">
          <button className="welcome-btn register" onClick={() => navigate("/signUp")}>
            Register
          </button>
          <button className="welcome-btn login" onClick={() => navigate("/auth")}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}