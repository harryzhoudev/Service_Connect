import { useEffect, useState } from 'react';
import DashboardSummarySection from '../components/dashboard/DashboardSummarySection';
import CustomerBookingsSection from '../components/dashboard/CustomerBookingsSection';
import ProviderBookingsSection from '../components/dashboard/ProviderBookingsSection';
import MyServicesSection from '../components/dashboard/MyServicesSection';

export default function Dashboard() {
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [asCustomer, setAsCustomer] = useState([]);
  const [asProvider, setAsProvider] = useState([]);
  const [myServices, setMyServices] = useState([]);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState(null);

  // Current user from localStorage
  const stored = localStorage.getItem('user');
  let currentUser = null;
  try {
    currentUser = stored ? JSON.parse(stored) : null;
  } catch (e) {
    currentUser = null;
  }

  const token = localStorage.getItem('token');
  const userId = currentUser?.id || null;

  useEffect(() => {
    if (!userId || !token) {
      setError('You must be logged in to view the dashboard.');
      setLoadingBookings(false);
      setLoadingServices(false);
      return;
    }

    async function loadBookings() {
      setLoadingBookings(true);
      try {
        const res = await fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load bookings');
        }

        setBookingsSummary(data.summary || null);
        setAsCustomer(data.asCustomer || []);
        setAsProvider(data.asProvider || []);
      } catch (err) {
        setError((prev) => prev || err.message);
      } finally {
        setLoadingBookings(false);
      }
    }

    async function loadServices() {
      setLoadingServices(true);
      try {
        const res = await fetch('/api/services', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load services');
        }

        // services where current user is provider
        const my = (data || []).filter((svc) => {
          const providerId =
            svc.providerId?._id ||
            svc.providerId ||
            svc.provider ||
            svc.providerId;
          return providerId && userId && userId === String(providerId);
        });

        setMyServices(my);
      } catch (err) {
        setError((prev) => prev || err.message);
      } finally {
        setLoadingServices(false);
      }
    }

    loadBookings();
    loadServices();
  }, [token, userId]);

  if (!userId || !token) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'red' }}>You must be logged in to view this page.</p>
      </div>
    );
  }

  // Helpers for labels
  const getUserLabel = (user) =>
    user?.name || user?.username || user?.email || user?._id || '-';

  const getServiceLabel = (service) =>
    service?.title || service?.name || service?._id || '-';

  // Summary numbers
  const allBookings = [...asCustomer, ...asProvider];
  const countByStatus = (status) =>
    allBookings.filter((b) => b.status === status).length;

  const totalBookings = allBookings.length;
  const pendingCount = countByStatus('pending');
  const acceptedCount = countByStatus('accepted');
  const completedCount = countByStatus('completed');
  const cancelledCount = countByStatus('cancelled');
  const rejectedCount = countByStatus('rejected');

  const providerRevenue = asProvider
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.priceAtTime || 0), 0);

  return (
    <div style={{ padding: 40, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginBottom: 24, color: '#555' }}>
        Overview of your bookings and services on ServiceConnect.
      </p>

      {error && <div style={{ marginBottom: 16, color: 'red' }}>{error}</div>}

      <DashboardSummarySection
        loadingBookings={loadingBookings}
        loadingServices={loadingServices}
        totalBookings={totalBookings}
        bookingsSummary={bookingsSummary}
        asCustomer={asCustomer}
        asProvider={asProvider}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        completedCount={completedCount}
        cancelledCount={cancelledCount}
        rejectedCount={rejectedCount}
        providerRevenue={providerRevenue}
        myServicesCount={myServices.length}
      />

      {loadingBookings && <p>Loading bookings…</p>}
      {loadingServices && <p>Loading your services…</p>}

      {!loadingBookings && (
        <CustomerBookingsSection
          asCustomer={asCustomer}
          setAsCustomer={setAsCustomer}
          token={token}
          getUserLabel={getUserLabel}
          getServiceLabel={getServiceLabel}
        />
      )}

      {!loadingBookings && (
        <ProviderBookingsSection
          asProvider={asProvider}
          setAsProvider={setAsProvider}
          getUserLabel={getUserLabel}
          getServiceLabel={getServiceLabel}
          token={token}
        />
      )}

      {!loadingServices && (
        <MyServicesSection
          myServices={myServices}
          setMyServices={setMyServices}
          token={token}
        />
      )}
    </div>
  );
}
