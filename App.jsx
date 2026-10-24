
import { useState } from "react";
import "./App.css";

import Home from "./Home";
import Login from "./login";
import Register from "./register";
import Admin from "./admin";
import Staff from "./Staff";
import Customer from "./customer";
import Products from "./Products";
import Orders from "./Orders";

const API_URL = "http://127.0.0.1:8000/api/login/";
const VALID_ROLES = ["admin", "staff", "customer"];

function getSavedUser() {
  try {
    const saved = localStorage.getItem("flowerMarketUser");

    if (!saved) return null;

    const user = JSON.parse(saved);
    const role = String(user?.role || "").toLowerCase();

    if (!user || !VALID_ROLES.includes(role)) return null;

    return {
      ...user,
      role,
      fullName:
        user.fullName ||
        user.full_name ||
        user.name ||
        user.username ||
        "",
      email: user.email || "",
    };
  } catch {
    return null;
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(getSavedUser);

  const [page, setPage] = useState(() => {
    const savedUser = getSavedUser();
    return savedUser ? savedUser.role : "home";
  });

  // Stores the most recently placed order for the Payments view.
  const [selectedOrder, setSelectedOrder] = useState(null);

  const userRole = String(currentUser?.role || "").toLowerCase();

  async function handleLogin(loginDetails) {
    const email = String(loginDetails?.email || "").trim();
    const password = String(loginDetails?.password || "");

    if (!email || !password) {
      alert("Please enter your email address and password.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        alert(data.message || data.error || "Invalid email or password.");
        return;
      }

      const role = String(data.role || "").toLowerCase();

      if (!VALID_ROLES.includes(role)) {
        alert("Account role could not be identified. Please contact admin.");
        return;
      }

      const user = {
        ...data,
        fullName:
          data.fullName ||
          data.full_name ||
          data.name ||
          data.username ||
          "",
        username: data.username || "",
        email: data.email || email,
        role,
      };

      localStorage.setItem("flowerMarketUser", JSON.stringify(user));

      setCurrentUser(user);
      setSelectedOrder(null);
      setPage(role);
    } catch (error) {
      console.error("Login error:", error);
      alert("Backend connect होत नाही. Django server तपासा.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("flowerMarketUser");
    setCurrentUser(null);
    setSelectedOrder(null);
    setPage("login");
  }

  // Accepts either a page name or (page name, order details).
  function handleNavigate(destination, orderDetails = null) {
    const target = String(destination || "").toLowerCase();

    if (target === "payments") {
      if (userRole !== "customer") {
        alert("Payments are available from the Customer account.");
        return;
      }

      if (orderDetails && typeof orderDetails === "object") {
        setSelectedOrder(orderDetails);
      }

      setPage("customer");
      return;
    }

    if (target === "orders") {
      if (VALID_ROLES.includes(userRole)) {
        setPage("orders");
      } else {
        alert("Please login to access Orders.");
      }
      return;
    }

    if (target === "products") {
      if (["admin", "customer"].includes(userRole)) {
        setPage("products");
      } else {
        alert("You are not allowed to access Products.");
      }
      return;
    }

    if (target === "dashboard") {
      if (VALID_ROLES.includes(userRole)) {
        setPage(userRole);
      }
      return;
    }

    if (["admin", "staff", "customer"].includes(target)) {
      if (target === userRole) {
        setPage(target);
      } else {
        alert("You can access only your assigned dashboard.");
      }
      return;
    }

    if (target === "home") {
      setPage("home");
    }

    if (target === "login") {
      setPage("login");
    }
  }

  return (
    <>
      {page === "home" && (
        <Home
          onLogin={() => setPage("login")}
          onRegister={() => setPage("register")}
        />
      )}

      {page === "login" && (
        <Login
          onBack={() => setPage("home")}
          onRegister={() => setPage("register")}
          onLogin={handleLogin}
        />
      )}

      {page === "register" && (
        <Register
          onBack={() => setPage("home")}
          onLogin={() => setPage("login")}
        />
      )}

      {page === "admin" && userRole === "admin" && (
        <Admin
          user={currentUser}
          userEmail={currentUser?.email || ""}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {page === "staff" && userRole === "staff" && (
        <Staff
          user={currentUser}
          userEmail={currentUser?.email || ""}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {page === "customer" && userRole === "customer" && (
        <Customer
          user={currentUser}
          userEmail={currentUser?.email || ""}
          orderDetails={selectedOrder}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {page === "products" &&
        ["admin", "customer"].includes(userRole) && (
          <Products
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}

      {page === "orders" && VALID_ROLES.includes(userRole) && (
        <Orders
          user={currentUser}
          userRole={userRole}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {!VALID_ROLES.includes(userRole) &&
        !["home", "login", "register"].includes(page) && (
          <div style={{ padding: "30px" }}>
            <h2>Please login to continue.</h2>
            <button type="button" onClick={() => setPage("login")}>
              Back to Login
            </button>
          </div>
        )}
    </>
  );
}

export default App;
