import SummaryCard from './SummaryCard.jsx';

export default function DashboardSummarySection({
  loadingBookings,
  loadingServices,
  totalBookings,
  bookingsSummary,
  asCustomer,
  asProvider,
  pendingCount,
  acceptedCount,
  completedCount,
  cancelledCount,
  rejectedCount,
  providerRevenue,
  myServicesCount,
}) {
  if (loadingBookings || loadingServices) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}
    >
      <SummaryCard label='Total Bookings' value={totalBookings} />
      <SummaryCard
        label='As Customer'
        value={bookingsSummary?.asCustomerCount ?? asCustomer.length}
      />
      <SummaryCard
        label='As Provider'
        value={bookingsSummary?.asProviderCount ?? asProvider.length}
      />
      <SummaryCard label='Pending' value={pendingCount} />
      <SummaryCard label='Accepted' value={acceptedCount} />
      <SummaryCard label='Completed' value={completedCount} />
      <SummaryCard label='Cancelled' value={cancelledCount} />
      <SummaryCard label='Rejected' value={rejectedCount} />
      <SummaryCard
        label='Provider Revenue (Completed)'
        value={`$${providerRevenue.toFixed(2)}`}
      />
      <SummaryCard label='My Services' value={myServicesCount} />
    </div>
  );
}
