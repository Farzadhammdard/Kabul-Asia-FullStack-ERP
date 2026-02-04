export default function DashboardCards({ data }) {
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <Card title="Users" value={data.total_users} />
      <Card title="Projects" value={data.total_projects} />
      <Card title="Income" value={data.total_income} />
      <Card title="Pending Orders" value={data.pending_orders} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      padding: 20,
      border: "1px solid #ddd",
      borderRadius: 10,
      minWidth: 150
    }}>
      <h3>{title}</h3>
      <p style={{ fontSize: 24 }}>{value}</p>
    </div>
  );
}
