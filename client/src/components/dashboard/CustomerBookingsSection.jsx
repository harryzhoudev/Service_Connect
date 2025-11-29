import { useState } from 'react';
import { Th, Td } from './TableElements';

export default function CustomerBookingsSection({
  asCustomer,
  setAsCustomer,
  token,
  getUserLabel,
  getServiceLabel,
}) {
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  function startEditBooking(booking) {
    setEditingBookingId(booking._id);

    // Convert date to datetime-local (YYYY-MM-DDTHH:mm)
    const dt = booking.date ? new Date(booking.date) : null;
    const localIso = dt
      ? new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : '';
    setEditDate(localIso);
    setEditNotes(booking.notes || '');
    setEditError(null);
  }

  function cancelEditBooking() {
    setEditingBookingId(null);
    setEditDate('');
    setEditNotes('');
    setEditSaving(false);
    setEditError(null);
  }

  async function saveEditBooking(bookingId) {
    if (!token) {
      setEditError('You must be logged in to edit a booking.');
      return;
    }

    setEditSaving(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Only editable fields; no action
          date: editDate || undefined,
          notes: editNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update booking');
      }

      setAsCustomer((prev) =>
        prev.map((b) => (b._id === json.booking._id ? json.booking : b))
      );

      cancelEditBooking();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 8 }}>Bookings You Made</h2>
      <p style={{ marginBottom: 12, color: '#555' }}>
        These are services you have booked from providers. You can edit the date
        and notes while the booking is still pending.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 850,
          }}
        >
          <thead>
            <tr>
              <Th>Service</Th>
              <Th>Provider</Th>
              <Th>Status</Th>
              <Th>Price at Time</Th>
              <Th>Date</Th>
              <Th>Notes</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {asCustomer.map((b) => {
              const isEditing = editingBookingId === b._id;
              const isPending = b.status === 'pending';

              return (
                <tr key={b._id}>
                  <Td>{getServiceLabel(b.service)}</Td>
                  <Td>{getUserLabel(b.provider)}</Td>
                  <Td style={{ textTransform: 'capitalize' }}>{b.status}</Td>
                  <Td>
                    {typeof b.priceAtTime === 'number'
                      ? `$${b.priceAtTime.toFixed(2)}`
                      : '-'}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <input
                        type='datetime-local'
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        style={{
                          padding: 4,
                          borderRadius: 4,
                          border: '1px solid #ccc',
                          maxWidth: 200,
                        }}
                      />
                    ) : b.date ? (
                      new Date(b.date).toLocaleString()
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        style={{
                          width: '100%',
                          minWidth: 160,
                          padding: 4,
                          borderRadius: 4,
                          border: '1px solid #ccc',
                        }}
                      />
                    ) : (
                      b.notes || '-'
                    )}
                  </Td>
                  <Td>
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}
                  </Td>
                  <Td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type='button'
                          onClick={() => saveEditBooking(b._id)}
                          disabled={editSaving}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            cursor: editSaving ? 'default' : 'pointer',
                          }}
                        >
                          {editSaving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type='button'
                          onClick={cancelEditBooking}
                          disabled={editSaving}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,

                            color: 'black',
                            border: '1px solid #ccc',
                            backgroundColor: '#f5f5f5',
                            cursor: editSaving ? 'default' : 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      isPending && (
                        <button
                          type='button'
                          onClick={() => startEditBooking(b)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid #007bff',
                            backgroundColor: '#fff',
                            color: '#007bff',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                      )
                    )}
                  </Td>
                </tr>
              );
            })}

            {asCustomer.length === 0 && (
              <tr>
                <Td colSpan={8} style={{ textAlign: 'center' }}>
                  You have not booked any services yet.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editError && <p style={{ marginTop: 8, color: 'red' }}>{editError}</p>}
    </section>
  );
}
