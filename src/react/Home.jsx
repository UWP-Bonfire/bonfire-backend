
import React from 'react';
import '../css/Home.css';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="home-container">
            <header className="header">
                <nav className="navbar">
                    <img src="/images/Logo.png" alt="Bonfire Logo" className="logo" />
                    <Link to="/auth" className="login-button">Login</Link>
                </nav>
                <div className="hero-section">
                    <h1>Welcome to Bonfire</h1>
                    <p>The future of social messaging is here. Connect with friends, share moments, and build your community.</p>
                    <Link to="/auth" className="cta-button">Get Started</Link>
                </div>
            </header>

            <main className="main-content">
                <section className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h2>Real-time Messaging</h2>
                        <p>Experience seamless, real-time conversations with friends and groups. No delays, just instant connection.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h2>Add Friends</h2>
                        <p>Easily find and connect with your friends. Build your social circle and stay in touch with those who matter most.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h2>Modern Design</h2>
                        <p>Enjoy a clean, intuitive, and visually appealing interface that makes messaging a pleasure.</p>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-links">
                    <a href="#">About</a>
                    <a href="#">Contact</a>
                    <a href="#">Terms of Service</a>
                </div>
                <div className="social-media">
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-facebook"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
                <p>&copy; 2024 Bonfire. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Home;
