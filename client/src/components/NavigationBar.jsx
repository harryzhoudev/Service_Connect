import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/navbar.css";


 
export default function Navbar() {
//   return (
// <nav style={{ display: "flex", gap: "15px", padding: "10px", background: "#eee" }}>
// <Link to="/">Home</Link>
// <Link to="/services">Services</Link>
// <Link to="/login">Login</Link>
// <Link to="/register">Register</Link>
// <Link to="/dashboard">Dashboard</Link>
// </nav>
//   );

  return (
    //  <nav className="navbar navbar-expand bg-light">
    //   <div className="container d-flex justify-content-center">
    //     <div className="navbar-nav gap-3">
    //       <Link className="nav-link" to="/">Home</Link>
    //       <Link className="nav-link" to="/services">Services</Link>
    //       <Link className="nav-link" to="/login">Login</Link>
    //       <Link className="nav-link" to="/register">Register</Link>
    //       <Link className="nav-link" to="/dashboard">Dashboard</Link>
    //     </div>
    //   </div>
    // </nav>

     <nav className="sc-navbar">
      <div className="nav-left">
        <img src="/serviceConnectLogo.png" alt="ServiceConnect Logo" className="nav-logo" />
        <span className="nav-title">SERVICECONNECT</span>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  )
}