import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stored = localStorage.getItem('user');
  let currentUser = null;
  try {
    currentUser = stored ? JSON.parse(stored) : null;
  } catch (e) {
    currentUser = null;
  }

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/services', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();

    // refresh when token/user changes in another tab
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [token]);

  async function handleDelete(id) {
    if (!token) return alert('Login required');
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Delete failed');
      setServices((s) => s.filter((svc) => svc._id !== id && svc.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading services…</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Services</h2>

      {/* Any logged-in user can provide a service */}
      {currentUser && (
        <div style={{ marginBottom: 12 }}>
          <Link to='/services/new'>
            <button>Provide Service</button>
          </Link>
        </div>
      )}

      {services.length === 0 && <div>No services found.</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {services.map((svc) => {
          const providerId =
            svc.providerId?._id ||
            svc.providerId ||
            svc.provider ||
            svc.providerId;

          const isOwner =
            currentUser && providerId && currentUser.id === String(providerId);

          const canManage =
            isOwner ||
            (currentUser && ['admin', 'superuser'].includes(currentUser.role));

          // provider display name (matches detail/booking logic)
          const providerName =
            svc.providerId?.name ||
            svc.providerId?.username ||
            svc.providerId?.email ||
            'Unknown provider';

          return (
            <div
              key={svc._id || svc.id}
              style={{
                border: '1px solid #ddd',
                padding: 12,
                borderRadius: 6,
              }}
            >
              <h3>{svc.title}</h3>
              <p>{svc.description}</p>

              <div>
                <strong>Category:</strong> {svc.category}
              </div>
              <div>
                <strong>Price:</strong> ${svc.price}
              </div>
              <div>
                <strong>Provider:</strong> {providerName}
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <Link to={`/services/${svc._id || svc.id}`}>
                  <button>View</button>
                </Link>

                {/* Any logged-in user can book as long as they're not the owner */}
                {currentUser && !isOwner && (
                  <Link to={`/services/${svc._id || svc.id}/booking`}>
                    <button>Book</button>
                  </Link>
                )}

                {/* Owners (and admin/superuser) can manage */}
                {canManage && (
                  <>
                    <Link to={`/services/${svc._id || svc.id}/edit`}>
                      <button>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(svc._id || svc.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
