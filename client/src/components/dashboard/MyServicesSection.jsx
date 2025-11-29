import { Link } from 'react-router-dom';

export default function MyServicesSection({
  myServices,
  setMyServices,
  token,
}) {
  async function handleDeleteService(id) {
    if (!token) {
      alert('You must be logged in to delete a service.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this service?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to delete service');
      }

      // Remove from local state
      setMyServices((prev) => prev.filter((svc) => (svc._id || svc.id) !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section>
      <h2 style={{ marginBottom: 8 }}>My Services</h2>
      <p style={{ marginBottom: 12, color: '#555' }}>
        Services you have created and are offering on ServiceConnect.
      </p>

      <div style={{ marginBottom: 12 }}>
        <Link to='/services/new'>
          <button>Provide New Service</button>
        </Link>
      </div>

      {myServices.length === 0 && (
        <div>You have not created any services yet.</div>
      )}

      {myServices.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {myServices.map((svc) => {
            const id = svc._id || svc.id;

            return (
              <div
                key={id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: 12,
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

                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <Link to={`/services/${id}`}>
                    <button>View</button>
                  </Link>
                  <Link to={`/services/${id}/edit`}>
                    <button>Edit</button>
                  </Link>
                  <button
                    type='button'
                    onClick={() => handleDeleteService(id)}
                    style={{
                      border: '1px solid #cc0000',
                      backgroundColor: '#ffe5e5',
                      color: 'black',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
