import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <div> <footer className="footer">
    <div className="container" style={{backgroundColor: "#334155", border:"none"}}>
      <div className="footer-grid">
        <div className="footer-column">
          <h3 className="footer-heading">Categories</h3>
          <ul className="footer-links">
            <li className="footer-link"><a href="#">Web Development</a></li>
            <li className="footer-link"><a href="#">Design & Creative</a></li>
            <li className="footer-link"><a href="#">Mobile Development</a></li>
            <li className="footer-link"><a href="#">Writing & Translation</a></li>
            <li className="footer-link"><a href="#">Video & Animation</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3 className="footer-heading">About</h3>
          <ul className="footer-links">
            <li className="footer-link"><a href="#">About Us</a></li>
            <li className="footer-link"><a href="#">How it Works</a></li>
            <li className="footer-link"><a href="#">Careers</a></li>
            <li className="footer-link"><a href="#">Press</a></li>
            <li className="footer-link"><a href="#">Blog</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links">
            <li className="footer-link"><a href="#">Help Center</a></li>
            <li className="footer-link"><a href="#">Contact Us</a></li>
            <li className="footer-link"><a href="#">Privacy Policy</a></li>
            <li className="footer-link"><a href="#">Terms of Service</a></li>
            <li className="footer-link"><a href="#">Trust & Safety</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3 className="footer-heading">Community</h3>
          <ul className="footer-links">
            <li className="footer-link"><a href="#">Freelance Forum</a></li>
            <li className="footer-link"><a href="#">Podcast</a></li>
            <li className="footer-link"><a href="#">Events</a></li>
            <li className="footer-link"><a href="#">Affiliates</a></li>
            <li className="footer-link"><a href="#">Invite Friends</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2023 Skillify. All rights reserved.</p>
        <div className="social-icons">
          <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
          <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
        </div>
      </div>
    </div>
  </footer></div>
  )
}

export default Footer