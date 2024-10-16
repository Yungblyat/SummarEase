import logo from "../assets/logo.png";
import "../styles/Footer.css";
const Footer = () => {
  return (
    <div className="footer">
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 SummarEase, Inc. All rights reserved.</p>
          <ul className="footer-links">
            <li>
              <a href="#">Security</a>
            </li>
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
