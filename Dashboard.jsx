
import "./Dashboard.css";

const roleItems = [
  { name: "Admin", icon: "♙" },
  { name: "Staff", icon: "♧" },
  { name: "Customer", icon: "♙" },
];

const workspaceItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Products", icon: "✿" },
  { name: "Orders", icon: "▤" },
  { name: "Payments", icon: "₹" },
  { name: "Reports", icon: "▥" },
];

const orders = [
  {
    id: "FM1001",
    product: "Red Rose Bouquet",
    customer: "Priya Patil",
    amount: "₹850",
    status: "Pending",
  },
  {
    id: "FM1002",
    product: "Marigold Flowers",
    customer: "Rahul Shah",
    amount: "₹1,200",
    status: "Dispatched",
  },
  {
    id: "FM1003",
    product: "White Lily Bundle",
    customer: "Sneha Joshi",
    amount: "₹650",
    status: "Processing",
  },
];

function Dashboard({
  userRole = "",
  userEmail = "",
  onNavigate,
  onLogout,
}) {
  const role = userRole
    ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()
    : "User";

  const handleNavigate = (name) => {
    if (typeof onNavigate === "function") {
      onNavigate(name);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-icon">✿</div>
          <div>
            <h2>Flower Market</h2>
            <p className="sidebar-subtitle">DISPATCH SYSTEM</p>
          </div>
        </div>

        <p className="menu-heading">ROLE MANAGEMENT</p>

        {roleItems.map((item) => (
          <button
            key={item.name}
            type="button"
            className={
              "menu-item role-menu" +
              (role.toLowerCase() === item.name.toLowerCase()
                ? " active"
                : "")
            }
            onClick={() => handleNavigate(item.name)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>
            <span className="menu-arrow">›</span>
          </button>
        ))}

        <p className="menu-heading">WORKSPACE</p>

        {workspaceItems.map((item) => (
          <button
            key={item.name}
            type="button"
            className={
              "menu-item" +
              (item.name === "Dashboard" ? " active" : "")
            }
            onClick={() => handleNavigate(item.name)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {role.charAt(0)}
          </div>

          <div className="profile-details">
            <strong>{role}</strong>
            <p>{userEmail || "System account"}</p>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
            title="Logout"
            aria-label="Logout"
          >
            ↪
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">FLOWER MARKET / OVERVIEW</p>
            <h1>{role} Dashboard</h1>
            <p className="header-description">
              Welcome back, {role}. Here is your dispatch overview.
            </p>
          </div>

          <div className="header-right">
            <span className="online-status">
              <span className="status-dot"></span>
              System Online
            </span>
            <div className="header-avatar">{role.charAt(0)}</div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div className="welcome-content">
            <p className="welcome-label">
              FLOWERS • ORDERS • DELIVERY
            </p>
            <h2>Fresh Flowers, Delivered with Care.</h2>
            <p>
              Manage inventory, monitor orders and keep every
              dispatch running smoothly from one workspace.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => handleNavigate("Orders")}
            >
              View Orders <span>→</span>
            </button>
          </div>

          <div className="welcome-flower" aria-hidden="true">
            ✿
          </div>
        </section>

        <div className="section-heading">
          <div>
            <h2>Business Overview</h2>
            <p>Your flower market at a glance</p>
          </div>
          <span className="sample-label">DEMO DATA</span>
        </div>

        <section className="dashboard-stats">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Products</span>
              <span className="stat-icon green">✿</span>
            </div>
            <h2>128</h2>
            <p className="stat-note">Flowers in inventory</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total Orders</span>
              <span className="stat-icon purple">▤</span>
            </div>
            <h2>56</h2>
            <p className="stat-note">Orders recorded</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Pending Dispatch</span>
              <span className="stat-icon orange">◷</span>
            </div>
            <h2>12</h2>
            <p className="stat-note">Awaiting processing</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total Sales</span>
              <span className="stat-icon blue">₹</span>
            </div>
            <h2>₹24,500</h2>
            <p className="stat-note">Sample sales amount</p>
          </article>
        </section>

        <section className="recent-orders">
          <div className="orders-heading">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest flower dispatch activity</p>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() => handleNavigate("Orders")}
            >
              View all →
            </button>
          </div>

          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>PRODUCT</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.customer}</td>
                    <td className="order-amount">{order.amount}</td>
                    <td>
                      <span
                        className={
                          "order-status " +
                          order.status.toLowerCase()
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>Flower Market Dispatch System</span>
          <span>Management Workspace</span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
