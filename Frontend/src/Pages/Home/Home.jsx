import React, { useRef } from "react";
import "./Home.css";
import { 
  FaCheck, 
  FaSearch, 
  FaHandshake, 
  FaShieldAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaBars,
  FaUser
} from "react-icons/fa";

// Navbar Component
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (sectionId, event) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <a href="/" className="logo">Skillify</a>
        </div>
        
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a href="/" className="nav-link">Home</a>
            </li>
            <li className="nav-item">
              <a href="/find-talent" className="nav-link" onClick={(e) => scrollToSection('category-section', e)}>Find Talent</a>
            </li>
            <li className="nav-item">
              <a href="/find-work" className="nav-link" onClick={(e) => scrollToSection('cta-section', e)}>Find Work</a>
            </li>
            <li className="nav-item">
              <a href="#how-it-works" className="nav-link" onClick={(e) => scrollToSection('how-it-works', e)} >How It Works</a>
            </li>
          </ul>
        </div>
        
        <div className="navbar-auth">
          <a href="/login" className="login-button">Log in</a>
          <a href="/signup" className="signup-button" style={{'marginBottom': '0px'}}>Sign Up</a>
        </div>
        
        <div className="navbar-toggle">
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FaBars />
          </button>
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId, event) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close mobile menu after clicking
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-wrapper">
      {/* Pass howItWorksRef as a prop to Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find the perfect <span>freelance</span> services for your business
            </h1>
            <p className="hero-description">
              Connect with talented freelancers within minutes. Maintain full control of your projects with Skillify.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={(e) => scrollToSection('cta-section', e)}>Get Started</button>
              <button className="btn-white" onClick={(e) => scrollToSection('how-it-works', e)}>How It Works</button>
            </div>
          </div>
          <div className="services-card">
            <h3 className="services-title">Popular Services</h3>
            <div className="services-list">
              {['Logo Design', 'Web Development', 'Content Writing', 'Digital Marketing', 'Mobile App Development'].map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-icon">
                    <FaSearch />
                  </div>
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Slider */}
      <section className="category-section" id="category-section">
        <div className="container">
          <div className="category-header">
            <h2 className="category-title">Explore Popular Categories</h2>
            <div className="slider-controls">
              <button className="control-btn" onClick={scrollLeft}>
                <FaChevronLeft />
              </button>
              <button className="control-btn" onClick={scrollRight}>
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="categories-slider" ref={sliderRef}>
            {[
              { id: 1, name: 'Web Development', icon: '💻' },
              { id: 2, name: 'Mobile Apps', icon: '📱' },
              { id: 3, name: 'Design & Creative', icon: '🎨' },
              { id: 4, name: 'Writing & Translation', icon: '✍️' },
              { id: 5, name: 'Video & Animation', icon: '🎬' },
              { id: 6, name: 'Music & Audio', icon: '🎵' },
              { id: 7, name: 'Marketing', icon: '📊' },
              { id: 8, name: 'Business', icon: '💼' },
              { id: 9, name: 'Data Science', icon: '📈' },
              { id: 10, name: 'Photography', icon: '📷' }
            ].map((category) => (
              <a key={category.id} href="#" className="category-item">
                <div className="category-card">
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-name">{category.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <h2 className="how-title">How GreenLance Works</h2>
          <p className="how-description">
            Skillify makes it simple to connect with skilled professionals to get your projects done quickly and efficiently.
          </p>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Post a Project</h3>
              <p className="step-description">
                Describe your project in detail. Specify your requirements, timeline, and budget.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Choose a Freelancer</h3>
              <p className="step-description">
                Review proposals from freelancers, check their portfolios, and select the best match for your needs.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Pay Securely</h3>
              <p className="step-description">
                Use our secure payment system. Release funds only when you're satisfied with the work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="features-title">Why Choose Skillify</h2>
          <p className="features-description">
            Join thousands of businesses and freelancers who trust Skillify for their project needs.
          </p>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <FaCheck />
              </div>
              <h3 className="feature-title">Quality Work</h3>
              <p className="feature-description">
                Access top talent and professionals with proven experience in their fields.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaSearch />
              </div>
              <h3 className="feature-title">Wide Range of Services</h3>
              <p className="feature-description">
                Find services across 500+ categories, from graphic design to software development.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaHandshake />
              </div>
              <h3 className="feature-title">Smooth Collaboration</h3>
              <p className="feature-description">
                Our platform makes it easy to communicate, share files, and track progress.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3 className="feature-title">Secure Payments</h3>
              <p className="feature-description">
                Your payments are protected until you're completely satisfied with the delivered work.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaCheck />
              </div>
              <h3 className="feature-title">24/7 Support</h3>
              <p className="feature-description">
                Our customer support team is available around the clock to help with any issues.
              </p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaCheck />
              </div>
              <h3 className="feature-title">Satisfaction Guaranteed</h3>
              <p className="feature-description">
                Not happy with the results? We offer revision options and money-back guarantees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-description">
            Join thousands of clients and freelancers who are already using GreenLance to bring their projects to life.
          </p>
          <div className="cta-buttons">
            <a href="/signup"><button className="btn-white">Sign Up as Client</button></a>
            <a href="/signup"><button className="btn-outline">Sign Up as Freelancer</button></a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
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
      </footer>
    </div>
  );
};

export default Home;