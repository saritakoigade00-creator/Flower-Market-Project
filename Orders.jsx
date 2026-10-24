
import { useCallback, useEffect, useState } from "react";
import "./Orders.css";

const ORDERS_API_URL = "http://127.0.0.1:8000/api/orders/";
const STATUS_OPTIONS = ["Pending", "In Transit", "Delivered"];

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("flowerMarketUser") || "null"
    );
  } catch {
    return null;
  }
}

function Orders({ user, userRole, onLogout, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const currentUser = user || getStoredUser();

  const role = String(
    userRole || currentUser?.role || ""
  )
    .trim()
    .toLowerCase();

  const isCustomer = role === "customer";
  const canUpdateStatus = role === "admin" || role === "staff";

  // Load all orders from Django backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!currentUser || !role) {
      setOrders([]);
      setError("Please log in to view orders.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(ORDERS_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Failed to load orders."
        );
      }

      const allOrders = Array.isArray(data.orders)
        ? data.orders
        : [];

      // IMPORTANT: Do not filter orders by customer email here.
      setOrders(allOrders);
    } catch (err) {
      setOrders([]);
      setError(
        err.message || "Could not load orders. Check the backend."
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser, role]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Admin and Staff can update order status
  async function handleStatusChange(orderId, newStatus) {
    if (!canUpdateStatus) {
      setError("You are not allowed to update order status.");
      return;
    }

    setMessage("");
    setError("");
    setUpdatingId(orderId);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/status/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Failed to update order status."
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setMessage(
        `Order #${orderId} status updated to ${newStatus}.`
      );
    } catch (err) {
      setError(
        err.message || "Could not update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div>
          <h1>
            {isCustomer ? "My Orders" : "Orders Management"}
          </h1>
          <p>Flower Market Dispatch</p>
        </div>

        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div className="orders-actions">
        <button
          type="button"
          className="back-button"
          onClick={() => onNavigate?.("dashboard")}
        >
          Back to Dashboard
        </button>

        <button
          type="button"
          className="back-button"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      <section className="orders-card">
        <h2>
          {isCustomer ? "My Orders" : "All Orders"}
        </h2>

        {loading && <p>Loading orders...</p>}

        {error && (
          <p className="orders-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="orders-message" role="status">
            {message}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="orders-message">
            No orders found.
          </p>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <p>
              Total orders: <strong>{orders.length}</strong>
            </p>

            <div className="orders-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>

                      <td>{order.customer_name || "—"}</td>

                      <td>{order.customer_email || "—"}</td>

                      <td>
                        {typeof order.product === "string"
                          ? order.product
                          : order.product?.name || "—"}
                      </td>

                      <td>{order.quantity}</td>

                      <td>
                        ₹
                        {Number(
                          order.total_price || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {canUpdateStatus ? (
                          <select
                            className="order-status-select"
                            value={order.status || "Pending"}
                            disabled={updatingId === order.id}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value
                              )
                            }
                            aria-label={`Order ${order.id} status`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="order-status">
                            {order.status || "Pending"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Orders;
