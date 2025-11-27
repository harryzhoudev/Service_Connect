import { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name || '');
        setPhone(data.user.phone || '');
      } catch (err) {
        setStatus({ error: err.message });
      }
    }
    load();
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStatus({ success: 'Profile updated' });
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Profile</h2>
        <p>Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>My Profile</h2>
      {status?.error && <div style={{ color: 'red' }}>{status.error}</div>}
      {status?.success && <div style={{ color: 'green' }}>{status.success}</div>}

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Email
          <input value={user?.email || ''} disabled />
        </label>

        <label>
          Role
          <input value={user?.role || ''} disabled />
        </label>

        <label>
          Phone{user?.role === 'provider' ? ' (visible to customers)' : ''}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <div>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
