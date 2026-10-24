
import { useCallback, useEffect, useState } from "react";
import "./Admin.css";

const ORDERS_API_URL = "http://127.0.0.1:8000/api/orders/";
const PAYMENTS_API_URL = "http://127.0.0.1:8000/api/payments/";

function Admin({ user, userEmail, onLogout, onNavigate }) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adminName =
    user?.fullName || user?.username || "Admin";
  const adminEmail = user?.email || userEmail || "admin@gmail.com";

  const getRows = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const valueOf = (record, keys, fallback = "—") => {
    for (const key of keys) {
      const value = record?.[key];
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "object") {
          return value.name ?? value.email ?? value.id ?? fallback;
        }
        return value;
      }
    }
    return fallback;
  };

  const paymentStatus = (payment) =>
    String(valueOf(payment, ["status", "payment_status"], "Pending"))
      .trim()
      .toLowerCase();

  const isPaid = (payment) =>
    ["paid", "completed", "success", "successful"].includes(
      paymentStatus(payment)
    );

  const isSuccessfulOrder = (order) =>
    ["successful", "success", "completed", "delivered"].includes(
      String(valueOf(order, ["status"], "")).trim().toLowerCase()
    );

  const amountOf = (record) => {
    const raw = valueOf(
      record,
      ["amount", "total_price", "total_amount"],
      0
    );
    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : 0;
  };

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const dateOf = (value) => {
    if (!value || value === "—") return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orderResponse, paymentResponse] = await Promise.all([
        fetch(ORDERS_API_URL),
        fetch(PAYMENTS_API_URL),
      ]);

      if (!orderResponse.ok || !paymentResponse.ok) {
        throw new Error("Could not load orders or payments from backend.");
      }

      const [orderData, paymentData] = await Promise.all([
        orderResponse.json(),
        paymentResponse.json(),
      ]);

      setOrders(getRows(orderData, "orders"));
      setPayments(getRows(paymentData, "payments"));
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
      setOrders([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const successfulPayments = payments.filter(isPaid);
  const pendingPayments = payments.filter(
    (payment) => paymentStatus(payment) === "pending"
  );
  const successfulOrders = orders.filter(isSuccessfulOrder);
  const revenue = successfulPayments.reduce(
    (sum, payment) => sum + amountOf(payment),
    0
  );

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Order History", icon: "📦" },
    { name: "Payment History", icon: "₹" },
    { name: "Products", icon: "🌸" },
  ];

  const handleMenu = (name) => {
    if (name === "Products") {
      if (typeof onNavigate === "function") onNavigate("products");
      return;
    }
    setActiveMenu(name);
  };

  const renderOrders = () => (
    <section className="admin-panel">
      <div className="admin-section-heading">
        <div>
          <span className="admin-eyebrow">ORDER MANAGEMENT</span>
          <h2>Order History</h2>
          <p>All orders placed by customers.</p>
        </div>
        <button
          className="admin-refresh"
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty">No orders found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id ?? index}>
                  <td>#{valueOf(order, ["id", "order_id"])}</td>
                  <td>
                    {valueOf(order, [
                      "customer_name",
                      "customer",
                      "full_name",
                      "customer_email",
                      "email",
                    ])}
                  </td>
                  <td>
                    {valueOf(order, [
                      "product_name",
                      "product",
                      "flower_name",
                    ])}
                  </td>
                  <td>{valueOf(order, ["quantity", "qty"])}</td>
                  <td>{money(amountOf(order))}</td>
                  <td>
                    <span className="admin-status-badge">
                      {valueOf(order, ["status"], "Pending")}
                    </span>
                  </td>
                  <td>
                    {dateOf(
                      valueOf(order, ["created_at", "order_date", "date"], "")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderPayments = () => (
    <section className="admin-panel">
      <div className="admin-section-heading">
        <div>
          <span className="admin-eyebrow">PAYMENT MANAGEMENT</span>
          <h2>Payment History</h2>
          <p>Review successful and pending customer payments.</p>
        </div>
        <button
          className="admin-refresh"
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="admin-stat-grid admin-payment-stats">
        <article className="admin-stat-card">
          <span>Successful Payments</span>
          <strong>{successfulPayments.length}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Successful Amount</span>
          <strong>{money(revenue)}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Pending Payments</span>
          <strong>{pendingPayments.length}</strong>
        </article>
      </div>

      {payments.length === 0 ? (
        <div className="admin-empty">No payment records found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id ?? payment.payment_id ?? index}>
                  <td>#{valueOf(payment, ["id", "payment_id"])}</td>
                  <td>#{valueOf(payment, ["order_id", "order"])}</td>
                  <td>
                    {valueOf(payment, [
                      "customer_name",
                      "customer",
                      "customer_email",
                      "email",
                    ])}
                  </td>
                  <td>
                    {valueOf(payment, [
                      "product_name",
                      "product",
                      "flower_name",
                    ])}
                  </td>
                  <td>{money(amountOf(payment))}</td>
                  <td>{valueOf(payment, ["payment_method"])}</td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        isPaid(payment) ? "is-paid" : "is-pending"
                      }`}
                    >
                      {valueOf(payment, ["status", "payment_status"], "Pending")}
                    </span>
                  </td>
                  <td>
                    {dateOf(
                      valueOf(
                        payment,
                        ["created_at", "payment_date", "date"],
                        ""
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">✿</span>
          <div>
            <h2>Flower Market</h2>
            <p>DISPATCH SYSTEM</p>
          </div>
        </div>

        <p className="admin-menu-label">ADMIN MENU</p>

        <nav className="admin-navigation">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`admin-menu-item ${
                activeMenu === item.name ? "active" : ""
              }`}
              onClick={() => handleMenu(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
              {activeMenu === item.name && (
                <span className="admin-menu-indicator">•</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-avatar">
            {String(adminName).charAt(0).toUpperCase()}
          </div>
          <div className="admin-user-details">
            <strong>{adminName}</strong>
            <span>{adminEmail}</span>
            <small>Administrator</small>
          </div>
          <button
            className="admin-logout"
            type="button"
            onClick={onLogout}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">
              Home / {activeMenu}
            </p>
            <h1>{activeMenu === "Dashboard" ? "Admin Dashboard" : activeMenu}</h1>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-online">
              <span /> System Online
            </span>
            <button
              className="admin-refresh"
              type="button"
              onClick={loadData}
              disabled={loading}
            >
              ↻ Refresh Data
            </button>
          </div>
        </header>

        {error && (
          <div className="admin-error" role="alert">
            <strong>Backend Error</strong>
            <p>{error}</p>
            <button type="button" onClick={loadData}>Try Again</button>
          </div>
        )}

        {loading && <div className="admin-loading">Loading latest records…</div>}

        {activeMenu === "Dashboard" && (
          <>
            <section className="admin-welcome">
              <div>
                <span className="admin-eyebrow">FLOWER MARKET · ADMINISTRATION</span>
                <h2>Welcome back, {adminName}!</h2>
                <p>
                  Track customer orders, payment activity and business performance.
                </p>
              </div>
              <div className="admin-welcome-flower">💐</div>
            </section>

            <section className="admin-stat-grid">
              <article className="admin-stat-card">
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
                <small>All recorded orders</small>
              </article>
              <article className="admin-stat-card">
                <span>Successful Orders</span>
                <strong>{successfulOrders.length}</strong>
                <small>Completed or delivered</small>
              </article>
              <article className="admin-stat-card">
                <span>Successful Revenue</span>
                <strong>{money(revenue)}</strong>
                <small>Based on paid payments</small>
              </article>
              <article className="admin-stat-card">
                <span>Pending Payments</span>
                <strong>{pendingPayments.length}</strong>
                <small>Awaiting payment</small>
              </article>
            </section>

            <section className="admin-panel">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-eyebrow">BUSINESS OPERATIONS</span>
                  <h2>Manage Your Business</h2>
                  <p>Open the section you want to review.</p>
                </div>
              </div>

              <div className="admin-management-grid">
                <button
                  type="button"
                  className="admin-action-card"
                  onClick={() => setActiveMenu("Order History")}
                >
                  <span className="admin-action-icon">📦</span>
                  <strong>Order History</strong>
                  <small>Review customer orders and status.</small>
                  <span className="admin-action-link">View Orders →</span>
                </button>

                <button
                  type="button"
                  className="admin-action-card"
                  onClick={() => setActiveMenu("Payment History")}
                >
                  <span className="admin-action-icon">₹</span>
                  <strong>Payment History</strong>
                  <small>Review Pending and Paid payments.</small>
                  <span className="admin-action-link">View Payments →</span>
                </button>

                <button
                  type="button"
                  className="admin-action-card"
                  onClick={() => handleMenu("Products")}
                >
                  <span className="admin-action-icon">🌸</span>
                  <strong>Manage Products</strong>
                  <small>Open the flower inventory page.</small>
                  <span className="admin-action-link">View Products →</span>
                </button>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-section-heading">
                <div>
                  <span className="admin-eyebrow">LATEST ACTIVITY</span>
                  <h2>Recent Orders</h2>
                </div>
                <button
                  type="button"
                  className="admin-text-button"
                  onClick={() => setActiveMenu("Order History")}
                >
                  View All →
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order, index) => (
                      <tr key={order.id ?? index}>
                        <td>#{valueOf(order, ["id", "order_id"])}</td>
                        <td>
                          {valueOf(order, [
                            "product_name",
                            "product",
                            "flower_name",
                          ])}
                        </td>
                        <td>{valueOf(order, ["quantity", "qty"])}</td>
                        <td>{money(amountOf(order))}</td>
                        <td>{valueOf(order, ["status"], "Pending")}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeMenu === "Order History" && renderOrders()}
        {activeMenu === "Payment History" && renderPayments()}

        <footer className="admin-footer">
          <span>✿ Flower Market Dispatch</span>
          <span>Admin Portal · 2026</span>
        </footer>
      </main>
    </div>
  );
}

export default Admin;
