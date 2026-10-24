
import { useCallback, useEffect, useState } from "react";
import "./Customer.css";

const ORDERS_API_URL = "http://127.0.0.1:8000/api/orders/";
const PAYMENTS_API_URL = "http://127.0.0.1:8000/api/payments/";
const PAYMENT_UPDATE_BASE_URL =
  "http://127.0.0.1:8000/api/payments/update/";

function getSavedUser() {
  try {
    return JSON.parse(
      localStorage.getItem("flowerMarketUser") || "null"
    ) || {};
  } catch {
    return {};
  }
}

function getRows(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function isPaid(payment) {
  return ["paid", "completed", "success"].includes(
    String(payment?.status || "").trim().toLowerCase()
  );
}

function getEmail(record) {
  return String(
    record?.customer_email ||
    record?.email ||
    record?.customer?.email ||
    ""
  ).trim().toLowerCase();
}

function Customer({ user, onNavigate, onLogout }) {
  const customer = user || getSavedUser();

  const customerName =
    customer.fullName ||
    customer.full_name ||
    customer.first_name ||
    customer.name ||
    customer.username ||
    "Customer";

  const customerEmail = getEmail(customer);

  const [activeView, setActiveView] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [demoPaymentSuccess, setDemoPaymentSuccess] = useState("");

  const menuItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "products", icon: "✿", label: "Products" },
    { id: "orders", icon: "▤", label: "My Orders" },
    { id: "payments", icon: "₹", label: "Payments" },
    { id: "reports", icon: "▥", label: "Reports" },
  ];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(ORDERS_API_URL);
      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Unable to load orders.");
      }

      const allOrders = getRows(data, "orders");

      setOrders(
        allOrders.filter(
          (order) =>
            customerEmail !== "" && getEmail(order) === customerEmail
        )
      );
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [customerEmail]);

  const fetchPayments = useCallback(async () => {
    setPaymentError("");

    try {
      const response = await fetch(PAYMENTS_API_URL);
      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Unable to load payments.");
      }

      const allPayments = getRows(data, "payments");

      setPayments(
        allPayments.filter(
          (payment) =>
            customerEmail !== "" && getEmail(payment) === customerEmail
        )
      );
    } catch (err) {
      setPaymentError(err.message || "Unable to load payments.");
    }
  }, [customerEmail]);

  useEffect(() => {
    if (
      activeView === "dashboard" ||
      activeView === "orders" ||
      activeView === "reports"
    ) {
      fetchOrders();
    }

    if (activeView === "payments") {
      fetchPayments();
    }
  }, [activeView, fetchOrders, fetchPayments]);

  function navigate(view) {
    if (view === "products") {
      if (onNavigate) {
        onNavigate("products");
      } else {
        setActiveView("products");
      }
      return;
    }

    setActiveView(view);
  }

  async function handleDemoPayment(payment) {
    if (!payment?.id || paymentLoadingId !== null) return;

    if (isPaid(payment)) {
      setPaymentError("This payment is already marked as successful.");
      return;
    }

    setPaymentLoadingId(payment.id);
    setPaymentError("");
    setDemoPaymentSuccess("");

    try {
      // Ensure this payment belongs to the signed-in customer.
      if (getEmail(payment) !== customerEmail || !customerEmail) {
        throw new Error("This payment does not belong to your account.");
      }

      const response = await fetch(
        `${PAYMENT_UPDATE_BASE_URL}${payment.id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Paid",
            payment_method: "UPI",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message || `Payment update failed (${response.status}).`
        );
      }

      // Reload from the backend to confirm the saved status.
      const refreshResponse = await fetch(PAYMENTS_API_URL);
      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok || refreshData.status === "error") {
        throw new Error(
          refreshData.message || "Payment updated, but refresh failed."
        );
      }

      const refreshedPayments = getRows(
        refreshData,
        "payments"
      ).filter(
        (item) => customerEmail && getEmail(item) === customerEmail
      );

      setPayments(refreshedPayments);

      const updatedPayment = refreshedPayments.find(
        (item) => String(item.id) === String(payment.id)
      );

      if (!updatedPayment || !isPaid(updatedPayment)) {
        throw new Error(
          "Backend did not return this payment as Paid. Check update_payment_api in views.py."
        );
      }

      setDemoPaymentSuccess(
        `Payment #${payment.id} is now marked Paid in demo mode.`
      );
    } catch (err) {
      setPaymentError(err.message || "Demo payment failed.");
    } finally {
      setPaymentLoadingId(null);
    }
  }

  function renderDashboard() {
    const totalValue = orders.reduce(
      (sum, order) =>
        sum + Number(order.total_price || order.amount || 0),
      0
    );

    const pending = orders.filter(
      (order) => String(order.status || "").toLowerCase() === "pending"
    ).length;

    const completed = orders.filter(
      (order) => String(order.status || "").toLowerCase() === "delivered"
    ).length;

    return (
      <>
        <section className="customer-welcome">
          <p className="customer-eyebrow">
            FLOWER MARKET · CUSTOMER PORTAL
          </p>
          <h1>
            Welcome to <span>Flower Market!</span>
          </h1>
          <p>
            Discover fresh flowers for every special occasion. Browse our
            collection and order your favourites.
          </p>
          <button
            className="customer-primary-btn"
            onClick={() => navigate("products")}
          >
            Browse Flowers →
          </button>
          <div className="customer-flower-decoration" aria-hidden="true">
            ✿
          </div>
        </section>

        <section className="customer-overview">
          <div className="customer-section-heading">
            <div>
              <p className="customer-eyebrow">YOUR ACCOUNT</p>
              <h2>My Overview</h2>
              <p>Your personal order and payment workspace.</p>
            </div>
          </div>

          <div className="customer-stats-grid">
            <article className="customer-stat-card">
              <div className="customer-stat-icon">▤</div>
              <p>Total Orders</p>
              <h3>{orders.length}</h3>
            </article>

            <article className="customer-stat-card">
              <div className="customer-stat-icon">✓</div>
              <p>Delivered Orders</p>
              <h3>{completed}</h3>
            </article>

            <article className="customer-stat-card">
              <div className="customer-stat-icon">₹</div>
              <p>Total Order Value</p>
              <h3>₹{totalValue.toFixed(2)}</h3>
            </article>

            <article className="customer-stat-card">
              <div className="customer-stat-icon">◷</div>
              <p>Pending Orders</p>
              <h3>{pending}</h3>
            </article>
          </div>
        </section>

        <section className="customer-quick-actions">
          <div className="customer-section-heading">
            <div>
              <p className="customer-eyebrow">YOUR FLOWER JOURNEY</p>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="customer-cards">
            {[
              {
                id: "products",
                icon: "✿",
                title: "Browse Products",
                text: "Explore fresh flowers.",
              },
              {
                id: "orders",
                icon: "▤",
                title: "My Orders",
                text: "Check your order status.",
              },
              {
                id: "payments",
                icon: "₹",
                title: "Payments",
                text: "View your payment history.",
              },
              {
                id: "reports",
                icon: "▥",
                title: "My Reports",
                text: "Review your order summary.",
              },
            ].map((item) => (
              <article className="customer-action-card" key={item.id}>
                <div className="customer-action-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button
                  className="customer-action-link"
                  onClick={() => navigate(item.id)}
                >
                  Open →
                </button>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderOrders() {
    return (
      <section className="customer-content-panel">
        <p className="customer-eyebrow">ORDER HISTORY</p>
        <h1 className="customer-page-title">My Orders</h1>
        <p className="customer-page-description">
          View your flower orders and their status.
        </p>

        <button
          className="customer-primary-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Orders ↻"}
        </button>

        {error && <p role="alert">{error}</p>}
        {loading && <p>Loading orders...</p>}

        {!loading && !error && orders.length === 0 && (
          <p>No orders found for {customerEmail || "this account"}.</p>
        )}

        {!loading && orders.length > 0 && (
          <div className="orders-table-wrapper">
            <table>
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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      {typeof order.product === "string"
                        ? order.product
                        : order.product?.name || "—"}
                    </td>
                    <td>{order.quantity ?? 0}</td>
                    <td>
                      ₹{Number(
                        order.total_price || order.amount || 0
                      ).toFixed(2)}
                    </td>
                    <td>{order.status || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          className="customer-primary-btn"
          onClick={() => navigate("payments")}
        >
          View Payments →
        </button>
      </section>
    );
  }

  function renderPayments() {
    return (
      <section className="customer-content-panel">
        <p className="customer-eyebrow">ACCOUNT &amp; BILLING</p>
        <h1 className="customer-page-title">My Payments</h1>
        <p className="customer-page-description">
          Review your payment records and demo checkout.
        </p>

        {paymentError && (
          <p role="alert" className="orders-error">
            {paymentError}
          </p>
        )}

        {demoPaymentSuccess && (
          <p role="status" className="payment-success-message">
            {demoPaymentSuccess} No real money was transferred.
          </p>
        )}

        <div className="customer-info-card">
          <h3>Payment History</h3>
          <p>
            Payment records found: <strong>{payments.length}</strong>
          </p>
          <button
            className="customer-primary-btn"
            onClick={fetchPayments}
          >
            Refresh Payments ↻
          </button>
        </div>

        {payments.length === 0 && !paymentError && (
          <p>No payment records found for this account.</p>
        )}

        {payments.length > 0 && (
          <div className="orders-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const paid = isPaid(payment);
                  const updating = paymentLoadingId === payment.id;

                  return (
                    <tr key={payment.id}>
                      <td>#{payment.id}</td>
                      <td>#{payment.order_id ?? payment.order?.id ?? "—"}</td>
                      <td>
                        {typeof payment.product === "string"
                          ? payment.product
                          : payment.product?.name || "—"}
                      </td>
                      <td>₹{Number(payment.amount || 0).toFixed(2)}</td>
                      <td>{payment.payment_method || "Not specified"}</td>
                      <td>{paid ? "Paid" : payment.status || "Pending"}</td>
                      <td>
                        {!paid ? (
                          <button
                            type="button"
                            className="customer-primary-btn"
                            disabled={paymentLoadingId !== null}
                            onClick={() => handleDemoPayment(payment)}
                          >
                            {updating ? "Updating..." : "Test Demo Payment"}
                          </button>
                        ) : (
                          <span>✓ Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="customer-profile-hint">
          Demo only. This does not transfer real money.
        </p>

        <button
          className="customer-primary-btn"
          onClick={() => navigate("orders")}
        >
          View My Orders →
        </button>
      </section>
    );
  }

  function renderReports() {
    const totalValue = orders.reduce(
      (sum, order) =>
        sum + Number(order.total_price || order.amount || 0),
      0
    );

    return (
      <section className="customer-content-panel">
        <p className="customer-eyebrow">YOUR FLOWER JOURNEY</p>
        <h1 className="customer-page-title">My Reports</h1>

        <div className="customer-report-grid">
          <article className="customer-report-card">
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
            <button
              className="customer-action-link"
              onClick={() => navigate("orders")}
            >
              View Orders →
            </button>
          </article>

          <article className="customer-report-card">
            <h3>Total Order Value</h3>
            <p>₹{totalValue.toFixed(2)}</p>
            <button
              className="customer-action-link"
              onClick={() => navigate("payments")}
            >
              View Payments →
            </button>
          </article>
        </div>
      </section>
    );
  }

  const currentLabel =
    menuItems.find((item) => item.id === activeView)?.label || "Dashboard";

  function renderPage() {
    if (activeView === "orders") return renderOrders();
    if (activeView === "payments") return renderPayments();
    if (activeView === "reports") return renderReports();
    if (activeView === "products") {
      return (
        <section className="customer-content-panel">
          <h1 className="customer-page-title">Products</h1>
          <p>Open the Products page to browse flowers.</p>
          <button
            className="customer-primary-btn"
            onClick={() => onNavigate?.("products")}
          >
            Browse Products →
          </button>
        </section>
      );
    }
    return renderDashboard();
  }

  return (
    <div className="customer-layout">
      <aside className="customer-sidebar">
        <div className="customer-brand">
          <span className="customer-brand-icon">✿</span>
          <div>
            <h2>Flower Market</h2>
            <p>DISPATCH SYSTEM</p>
          </div>
        </div>

        <p className="customer-menu-label">CUSTOMER MENU</p>

        <nav className="customer-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeView ? "active" : ""}
              onClick={() => navigate(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="customer-profile">
          <div className="customer-avatar">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div className="customer-profile-text">
            <h4>{customerName}</h4>
            <p>{customerEmail || "Customer account"}</p>
          </div>
        </div>
      </aside>

      <main className="customer-main">
        <header className="customer-topbar">
          <div className="customer-breadcrumb">
            Home / <strong>{currentLabel}</strong>
          </div>

          <div className="customer-topbar-right">
            <div className="customer-status">
              <span className="customer-status-dot"></span>
              System Online
            </div>
            <button
              type="button"
              className="customer-top-logout"
              onClick={() => onLogout?.()}
            >
              ↪ Logout
            </button>
          </div>
        </header>

        {renderPage()}

        <footer className="customer-footer">
          Flower Market Dispatch · Customer Workspace
        </footer>
      </main>
    </div>
  );
}

export default Customer;
