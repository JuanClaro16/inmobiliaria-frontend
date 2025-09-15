import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: 20 }}></Link>
      </header>
      <Outlet />
    </div>
  );
}
