import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const stored = localStorage.getItem('user');
  const navigate = useNavigate();

  let currentUser = null;
  try {
    currentUser = stored ? JSON.parse(stored) : null;
  } catch (e) {
    currentUser = null;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error('Failed to load service');
        const data = await res.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!token) return alert('Login required');
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Delete failed');
      navigate('/services');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!service) return <div style={{ padding: 20 }}>Service not found</div>;

  const providerId =
    service.providerId?._id || service.providerId || service.provider;

  const isOwner =
    currentUser && providerId && currentUser.id === String(providerId);

  const canManage =
    isOwner ||
    (currentUser && ['admin', 'superuser'].includes(currentUser.role));

  // Safely compute provider display name
  const providerName =
    service.providerId?.name ||
    service.providerId?.username ||
    service.providerId?.email ||
    'Unknown provider';

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h2>{service.title}</h2>
      <p>{service.description}</p>

      <div>
        <strong>Category:</strong> {service.category}
      </div>

      <div>
        <strong>Price:</strong> ${service.price}
      </div>

      <div>
        <strong>Provider:</strong> {providerName}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {currentUser && currentUser.role === 'user' && (
          <Link to={`/services/${id}/booking`}>
            <button>Book</button>
          </Link>
        )}

        {canManage && (
          <>
            <Link to={`/services/${id}/edit`}>
              <button>Edit</button>
            </Link>
            <button onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
