export default function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: '1px solid #ddd',
        backgroundColor: '#fafafa',
      }}
    >
      <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
