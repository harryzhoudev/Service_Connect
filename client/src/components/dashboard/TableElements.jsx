export function Th({ children }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '8px 12px',
        borderBottom: '2px solid #ddd',
        backgroundColor: '#f4f4f4',
        fontSize: '0.9rem',
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children, colSpan, style }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        fontSize: '0.9rem',
        ...style,
      }}
    >
      {children}
    </td>
  );
}
