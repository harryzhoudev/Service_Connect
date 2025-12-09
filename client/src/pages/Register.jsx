// import { useState } from "react";
// import axios from "axios";
// import "./Auth.css";

// export default function Register() {
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await axios.post("/api/auth/register", {
//         ...form,
//         role: "user",
//       });

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       window.location.href = "/dashboard";
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2 className="auth-title">Create Account</h2>

//       {error && <p className="auth-error">{error}</p>}

//       <form className="auth-form" onSubmit={handleSubmit}>
//         <input
//           className="auth-input"
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={form.name}
//           onChange={handleChange}
//           required
//         />

//         <input
//           className="auth-input"
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         />

//         <input
//           className="auth-input"
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />

//         <button type="submit" className="auth-btn">
//           Register
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import axios from "axios";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer", // default role
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/auth/register", form);

      // Save JWT + user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create Account</h2>

      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>

        {/* FULL NAME */}
        <input
          className="auth-input"
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        {/* EMAIL */}
        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {/* PASSWORD */}
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* ROLE SELECTOR */}
        <select
          className="auth-input"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="customer">Customer</option>
          <option value="provider">Service Provider</option>
        </select>

        <button type="submit" className="auth-btn">
          Register
        </button>
      </form>
    </div>
  );
}
