import { Th, Td } from './TableElements';
import { useState } from 'react';

export default function ProviderBookingsSection({
  asProvider,
  getUserLabel,
  getServiceLabel,
  token,
  setAsProvider,
}) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function handleAction(bookingId, action) {
    if (!token) {
      setActionError('You must be logged in.');
      return;
    }

    setLoadingAction(bookingId + '-' + action);
    setActionError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Action failed');
      }

      // Update provider bookings list
      setAsProvider((prev) =>
        prev.map((b) => (b._id === json.booking._id ? json.booking : b))
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 8 }}>Bookings For Your Services</h2>
      <p style={{ marginBottom: 12, color: '#555' }}>
        These are bookings made by customers on your services. You may Accept,
        Reject, or Complete bookings depending on status.
      </p>

      {actionError && (
        <p style={{ color: 'red', marginBottom: 12 }}>{actionError}</p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 900,
          }}
        >
          <thead>
            <tr>
              <Th>Service</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Price</Th>
              <Th>Date</Th>
              <Th>Notes</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {asProvider.map((b) => {
              const isPending = b.status === 'pending';
              const isAccepted = b.status === 'accepted';

              return (
                <tr key={b._id}>
                  <Td>{getServiceLabel(b.service)}</Td>
                  <Td>{getUserLabel(b.customer)}</Td>
                  <Td style={{ textTransform: 'capitalize' }}>{b.status}</Td>
                  <Td>${b.priceAtTime?.toFixed(2)}</Td>
                  <Td>{b.date ? new Date(b.date).toLocaleString() : '-'}</Td>
                  <Td>{b.notes || '-'}</Td>
                  <Td>
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}
                  </Td>

                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* Accept button */}
                      {isPending && (
                        <button
                          onClick={() => handleAction(b._id, 'accept')}
                          disabled={loadingAction}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid green',
                            background: '#e8ffe8',
                            color: 'black',
                            cursor: 'pointer',
                          }}
                        >
                          {loadingAction === b._id + '-accept'
                            ? '...'
                            : 'Accept'}
                        </button>
                      )}

                      {/* Reject button */}
                      {isPending && (
                        <button
                          onClick={() => handleAction(b._id, 'reject')}
                          disabled={loadingAction}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid red',
                            background: '#ffe8e8',
                            color: 'black',
                            cursor: 'pointer',
                          }}
                        >
                          {loadingAction === b._id + '-reject'
                            ? '...'
                            : 'Reject'}
                        </button>
                      )}

                      {/* Complete button */}
                      {isAccepted && (
                        <button
                          onClick={() => handleAction(b._id, 'complete')}
                          disabled={loadingAction}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid #555',
                            background: '#f0f0f0',
                            cursor: 'pointer',
                          }}
                        >
                          {loadingAction === b._id + '-complete'
                            ? '...'
                            : 'Complete'}
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}

            {asProvider.length === 0 && (
              <tr>
                <Td colSpan={8} style={{ textAlign: 'center' }}>
                  No one has booked your services yet.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
