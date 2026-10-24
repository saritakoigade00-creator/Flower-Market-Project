
import { useEffect, useState } from "react";
import "./Staff.css";

const ORDERS_API_URL = "http://127.0.0.1:8000/api/orders/";
const ALLOWED_STATUSES = ["Pending", "In Transit", "Delivered"];

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("flowerMarketUser") || "null");
  } catch {
    return null;
  }
}

function Staff({ userEmail, onLogout, user }) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Orders", icon: "📦" },
    { name: "Deliveries", icon: "🚚" },
  ];

  const stats = [
    { title: "Assigned Orders", value: orders.length, icon: "📦" },
    {
      title: "Pending Deliveries",
      value: orders.filter(
        (order) => order.status === "Pending"
      ).length,
      icon: "🚚",
    },
    {
      title: "Completed Deliveries",
      value: orders.filter(
        (order) => order.status === "Delivered"
      ).length,
      icon: "✓",
    },
  ];

  useEffect(() => {
    if (activeMenu !== "Orders" && activeMenu !== "Deliveries") {
      return;
    }

    const controller = new AbortController();

    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError("");
      setStatusMessage("");

      try {
        const savedUser = user || getSavedUser();
        const headers = {
          "Content-Type": "application/json",
        };

        if (savedUser?.token) {
          headers.Authorization = `Bearer ${savedUser.token}`;
        }

        const response = await fetch(ORDERS_API_URL, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Orders load झाले नाहीत. Server status: ${response.status}`
          );
        }

        const data = await response.json();

        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.orders)
          ? data.orders
          : null;

        if (!orderList) {
          throw new Error("Orders API response योग्य format मध्ये नाही.");
        }

        setOrders(orderList);

        const initialStatuses = {};
        orderList.forEach((order) => {
          initialStatuses[order.id] = ALLOWED_STATUSES.includes(order.status)
            ? order.status
            : "Pending";
        });

        setSelectedStatuses((previous) => ({
          ...initialStatuses,
          ...previous,
        }));
      } catch (error) {
        if (error.name !== "AbortError") {
          setOrdersError(error.message || "Orders load करताना error आला.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingOrders(false);
        }
      }
    }

    loadOrders();

    return () => controller.abort();
  }, [activeMenu, user]);

  const handleMenu = (name) => {
    setActiveMenu(name);
  };

  const formatPrice = (price) => {
    const amount = Number(price);
    return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : "—";
  };

  const getOrderId = (order) => order.id ?? order.order_id ?? "—";

  const getCustomerName = (order) =>
    order.customer_name ??
    order.customer?.username ??
    order.customer?.email ??
    order.customer ??
    "—";

  const getCustomerEmail = (order) =>
    order.customer_email ?? order.email ?? order.customer?.email ?? "—";

  const getProductName = (order) =>
    order.product_name ?? order.product?.name ?? order.product ?? "—";

  const getQuantity = (order) => order.quantity ?? "—";

  const getTotal = (order) =>
    order.total_price ?? order.total ?? order.price ?? null;

  const getStatus = (order) =>
    ALLOWED_STATUSES.includes(order.status) ? order.status : "Pending";

  async function handleUpdateStatus(order) {
    const orderId = getOrderId(order);
    const newStatus = selectedStatuses[order.id] || getStatus(order);

    if (!order.id) {
      setStatusMessage("Order ID मिळाला नाही.");
      return;
    }

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      setStatusMessage("कृपया योग्य status निवड.");
      return;
    }

    setUpdatingOrderId(order.id);
    setStatusMessage("");

    try {
      const savedUser = user || getSavedUser();
      const headers = {
        "Content-Type": "application/json",
      };

      if (savedUser?.token) {
        headers.Authorization = `Bearer ${savedUser.token}`;
      }

      const response = await fetch(
        `${ORDERS_API_URL}${order.id}/status/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || `Status update झाला नाही (${response.status}).`
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.id === order.id
            ? { ...item, status: newStatus }
            : item
        )
      );

      setStatusMessage(`Order #${orderId} status: ${newStatus}`);
    } catch (error) {
      setStatusMessage(
        error.message || "Status update करताना error आला."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="staff-dashboard">
      <aside className="staff-sidebar">
        <div className="staff-brand">
          <span>✿</span>
          <div>
            <h2>Flower Market</h2>
            <p>DISPATCH SYSTEM</p>
          </div>
        </div>

        <p className="staff-menu-label">STAFF MENU</p>

        <nav className="staff-navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`staff-menu ${
                activeMenu === item.name ? "active" : ""
              }`}
              onClick={() => handleMenu(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="staff-sidebar-bottom">
          <div className="staff-avatar">S</div>
          <div>
            <strong>Staff Member</strong>
            <p>Dispatch Staff</p>
          </div>
        </div>
      </aside>

      <main className="staff-main">
        <header className="staff-topbar">
          <div>
            <p className="staff-breadcrumb">Home / {activeMenu}</p>
            <h2>
              {activeMenu === "Dashboard" ? "Staff Dashboard" : activeMenu}
            </h2>
          </div>

          <div className="staff-top-actions">
            <span className="staff-online">
              <span /> System Online
            </span>

            <button
              type="button"
              className="staff-logout"
              onClick={onLogout}
            >
              ↪ Logout
            </button>
          </div>
        </header>

        {activeMenu === "Dashboard" && (
          <>
            <section className="staff-welcome">
              <div>
                <span className="staff-eyebrow">
                  FLOWER MARKET · STAFF PORTAL
                </span>
                <h1>Welcome, Staff! 🌸</h1>
                <p>
                  Manage your assigned orders and deliveries from one place.
                </p>
                <p className="staff-email">
                  Signed in as: {userEmail || user?.email || "Staff Member"}
                </p>
              </div>
              <div className="staff-welcome-icon">🚚</div>
            </section>

            <section className="staff-stats">
              {stats.map((item) => (
                <article className="staff-stat-card" key={item.title}>
                  <div className="staff-stat-icon">{item.icon}</div>
                  <p>{item.title}</p>
                  <h2>{item.value}</h2>
                  <span>Current overview</span>
                </article>
              ))}
            </section>

            <section className="staff-work-section">
              <span className="staff-eyebrow">DAILY OPERATIONS</span>
              <h2>My Work</h2>
              <p className="staff-section-description">
                Choose a section to continue your daily tasks.
              </p>

              <div className="staff-work-grid">
                <article className="staff-work-card">
                  <span>📦</span>
                  <h3>My Orders</h3>
                  <p>Check available orders.</p>
                  <button
                    type="button"
                    onClick={() => handleMenu("Orders")}
                  >
                    View Orders →
                  </button>
                </article>

                <article className="staff-work-card">
                  <span>🚚</span>
                  <h3>My Deliveries</h3>
                  <p>Update delivery status and review deliveries.</p>
                  <button
                    type="button"
                    onClick={() => handleMenu("Deliveries")}
                  >
                    View Deliveries →
                  </button>
                </article>
              </div>
            </section>
          </>
        )}

        {(activeMenu === "Orders" || activeMenu === "Deliveries") && (
          <section className="staff-work-section">
            <span className="staff-eyebrow">STAFF OPERATIONS</span>
            <h2>
              {activeMenu === "Orders" ? "Orders Management" : "My Deliveries"}
            </h2>
            <p className="staff-section-description">
              View orders and track their delivery status.
            </p>

            {loadingOrders && <p>Loading orders...</p>}

            {ordersError && (
              <p role="alert" style={{ color: "#b42318" }}>
                {ordersError}
              </p>
            )}

            {statusMessage && (
              <p role="status" style={{ color: "#245b43", marginTop: "12px" }}>
                {statusMessage}
              </p>
            )}

            {!loadingOrders && !ordersError && orders.length === 0 && (
              <p>No orders found.</p>
            )}

            {!loadingOrders && !ordersError && orders.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                    marginTop: "20px",
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Order ID",
                        "Customer",
                        "Email",
                        "Product",
                        "Quantity",
                        "Total",
                        "Status",
                        ...(activeMenu === "Deliveries" ? ["Update Status"] : []),
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "1px solid #e5e7eb",
                            color: "#245b43",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={getOrderId(order) || index}>
                        <td style={cellStyle}>{getOrderId(order)}</td>
                        <td style={cellStyle}>{getCustomerName(order)}</td>
                        <td style={cellStyle}>{getCustomerEmail(order)}</td>
                        <td style={cellStyle}>{getProductName(order)}</td>
                        <td style={cellStyle}>{getQuantity(order)}</td>
                        <td style={cellStyle}>{formatPrice(getTotal(order))}</td>
                        <td style={cellStyle}>{getStatus(order)}</td>

                        {activeMenu === "Deliveries" && (
                          <td style={cellStyle}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                minWidth: "150px",
                              }}
                            >
                              <select
                                value={
                                  selectedStatuses[order.id] || getStatus(order)
                                }
                                onChange={(event) =>
                                  setSelectedStatuses((previous) => ({
                                    ...previous,
                                    [order.id]: event.target.value,
                                  }))
                                }
                                disabled={updatingOrderId === order.id}
                                style={{
                                  padding: "9px",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "8px",
                                  background: "#fff",
                                }}
                              >
                                {ALLOWED_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order)}
                                disabled={updatingOrderId === order.id}
                                style={{
                                  padding: "9px 12px",
                                  border: "none",
                                  borderRadius: "8px",
                                  background: "#245b43",
                                  color: "#fff",
                                  cursor: "pointer",
                                  opacity:
                                    updatingOrderId === order.id ? 0.6 : 1,
                                }}
                              >
                                {updatingOrderId === order.id
                                  ? "Updating..."
                                  : "Update Status"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <footer className="staff-footer">
          <span>✿ Flower Market Dispatch</span>
          <span>Staff Portal · 2026</span>
        </footer>
      </main>
    </div>
  );
}

const cellStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

export default Staff;
