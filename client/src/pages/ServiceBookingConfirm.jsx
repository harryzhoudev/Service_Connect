import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ServiceBookingConfirm() {
  const { id } = useParams(); // service id from /services/:id/booking
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState(null);

  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const token = localStorage.getItem('token');
  const stored = localStorage.getItem('user');

  let currentUser = null;
  try {
    currentUser = stored ? JSON.parse(stored) : null;
  } catch (e) {
    currentUser = null;
  }

  // Load service details (same style as ServiceDetail)
  useEffect(() => {
    async function load() {
      setLoadingService(true);
      setError(null);
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error('Failed to load service');
        const data = await res.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingService(false);
      }
    }
    if (id) load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentUser || !token) {
      setError('You must be logged in to book a service.');
      return;
    }

    if (currentUser.role !== 'user') {
      setError('Only customers can book services.');
      return;
    }

    if (!date) {
      setError('Please select a date and time for the booking.');
      return;
    }

    try {
      setSubmitting(true);

      // ✅ MATCHES BACKEND: POST /api/services/:id/booking
      const res = await fetch(`/api/services/${id}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, notes }),
      });

      let json = {};
      try {
        json = await res.json();
      } catch (_) {}

      if (!res.ok) {
        throw new Error(json.message || 'Failed to create booking');
      }

      setSuccessMessage('Booking created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingService)
    return <div style={{ padding: 20 }}>Loading service…</div>;
  if (error && !service)
    return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!service) return <div style={{ padding: 20 }}>Service not found</div>;

  const providerId =
    service.providerId?._id || service.providerId || service.provider;
  const isOwner =
    currentUser && providerId && currentUser.id === String(providerId);

  // Safely derive provider display name (same idea as ServiceDetail)
  const providerName =
    service.providerId?.name ||
    service.providerId?.username ||
    service.providerId?.email ||
    'Unknown provider';

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>Confirm Booking</h2>
      <p style={{ marginBottom: 16 }}>
        Review the service details and confirm your booking.
      </p>

      {/* Guard: prevent provider from booking their own service */}
      {isOwner && (
        <div style={{ marginBottom: 12, color: 'red' }}>
          You cannot book your own service.
        </div>
      )}

      {/* Service summary with provider info */}
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <h3>{service.title}</h3>
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
        {service.location && (
          <div>
            <strong>Location:</strong> {service.location}
          </div>
        )}
      </div>

      {/* Error / success messages */}
      {error && <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>}
      {successMessage && (
        <div style={{ marginBottom: 12, color: 'green' }}>{successMessage}</div>
      )}

      {/* Booking form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor='booking-date'
            style={{ display: 'block', marginBottom: 4 }}
          >
            Date &amp; Time <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id='booking-date'
            type='datetime-local'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ccc',
              maxWidth: 260,
              width: '100%',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor='booking-notes'
            style={{ display: 'block', marginBottom: 4 }}
          >
            Notes for Provider (optional)
          </label>
          <textarea
            id='booking-notes'
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Add any details or special requests for the provider…'
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Quick summary including provider */}
        <div
          style={{
            border: '1px dashed #ccc',
            borderRadius: 6,
            padding: 10,
            marginBottom: 12,
          }}
        >
          <strong>Booking Summary:</strong>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            <li>Service: {service.title}</li>
            <li>Provider: {providerName}</li>
            <li>
              Date &amp; Time:{' '}
              {date ? new Date(date).toLocaleString() : 'Not selected'}
            </li>
            <li>Price at time of booking: ${service.price}</li>
            {notes && <li>Notes: {notes}</li>}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type='submit'
            disabled={submitting || isOwner}
            style={{
              padding: '8px 14px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: submitting || isOwner ? '#888' : '#007bff',
              color: '#fff',
              cursor: submitting || isOwner ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Confirming…' : 'Confirm Booking'}
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 14px',
              borderRadius: 4,
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
