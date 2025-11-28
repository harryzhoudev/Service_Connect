
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");   
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user", err);
    }
  };

  
  const loadServices = async () => {
    try {
      const res = await api.get("/services/my"); 
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  useEffect(() => {
    async function loadAll() {
      await loadUser();
      await loadServices();
      setLoading(false);
    }
    loadAll();
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>
      <p>Welcome back, <b>{user?.name}</b></p>

      <h2>Your Services</h2>

      {services.length === 0 && (
        <p>You have not created any services yet.</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
        {services.map((service) => (
          <div
            key={service._id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "10px",
              width: "280px",
            }}
          >
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p><b>Price:</b> {service.price}</p>
            <p><b>Category:</b> {service.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
