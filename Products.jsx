
import { useEffect, useMemo, useState } from "react";
import "./Products.css";

const API_URL = "http://127.0.0.1:8000/api/products/";
const ORDER_API_URL = "http://127.0.0.1:8000/api/orders/create/";

const FLOWER_IMAGES = {
  Rose: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=700",
  Lily: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=700",
  Tulip: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=700",
  Sunflower: "https://images.unsplash.com/photo-1470509037663-7dbdca8ee9af?w=700",
  Jasmine: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=700",
  Orchid: "https://images.unsplash.com/photo-1566907225472-514a6f7e1f5b?w=700",
  Marigold: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=700",
  Carnation: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=700",
  Daisy: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=700",
  Gerbera: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=700",
  Lotus: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=700",
  Chrysanthemum: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=700",
  Lavender: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=700",
  Peony: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=700",
  Hibiscus: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=700",
};

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("flowerMarketUser") || "null");
  } catch {
    return null;
  }
}

function getImageUrl(product) {
  return product?.image_url || product?.image || "";
}

function getFlowerImage(product) {
  const customImage = getImageUrl(product);
  if (customImage) return customImage;

  const name = String(product?.name || "").toLowerCase();
  const flower = Object.keys(FLOWER_IMAGES).find(
    (item) => item.toLowerCase() === name
  );

  return flower ? FLOWER_IMAGES[flower] : "";
}

function getCustomerName(user) {
  return (
    user?.fullName ||
    user?.full_name ||
    user?.first_name ||
    user?.username ||
    user?.name ||
    ""
  );
}

function getCustomerEmail(user) {
  return String(user?.email || user?.customer_email || "")
    .trim()
    .toLowerCase();
}

function Products({ onLogout, user, onNavigate }) {
  const currentUser = user || getSavedUser();
  const role = String(currentUser?.role || "").trim().toLowerCase();
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formError, setFormError] = useState("");

  const emptyProductForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
  };

  const [productForm, setProductForm] = useState({ ...emptyProductForm });

  const [orderingProduct, setOrderingProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");

  const [customerName, setCustomerName] = useState(() =>
    getCustomerName(currentUser)
  );
  const [customerEmail, setCustomerEmail] = useState(() =>
    getCustomerEmail(currentUser)
  );

  async function loadProducts() {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Unable to load products.");
      }

      const list = Array.isArray(data)
        ? data
        : data.products || data.results || [];

      setProducts(list);
    } catch (error) {
      setPageError(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = [
        product.name,
        product.description,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (selectedCategory === "All" ||
          product.category === selectedCategory)
      );
    });
  }, [products, search, selectedCategory]);

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const lowStockCount = products.filter((product) => {
    const stock = Number(product.stock || 0);
    return stock > 0 && stock <= 5;
  }).length;

  function openAddForm() {
    setEditingProduct(null);
    setProductForm({ ...emptyProductForm });
    setFormError("");
    setSuccessMessage("");
    setShowProductForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      stock: String(product.stock ?? ""),
      image_url: getImageUrl(product),
    });
    setFormError("");
    setSuccessMessage("");
    setShowProductForm(true);
  }

  function closeProductForm() {
    if (savingProduct) return;
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ ...emptyProductForm });
    setFormError("");
  }

  function handleProductFormChange(event) {
    const { name, value } = event.target;
    setProductForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSaveProduct(event) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!productForm.name.trim()) {
      setFormError("Please enter a product name.");
      return;
    }

    if (
      productForm.price === "" ||
      !Number.isFinite(Number(productForm.price)) ||
      Number(productForm.price) < 0
    ) {
      setFormError("Please enter a valid price.");
      return;
    }

    if (
      productForm.stock === "" ||
      !Number.isInteger(Number(productForm.stock)) ||
      Number(productForm.stock) < 0
    ) {
      setFormError("Please enter a valid stock quantity.");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      category: productForm.category.trim(),
      stock: Number(productForm.stock),
      image_url: productForm.image_url.trim(),
    };

    setSavingProduct(true);

    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing
        ? `${API_URL}${editingProduct.id}/`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === "error") {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to ${isEditing ? "update" : "add"} product.`
        );
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ ...emptyProductForm });
      setSuccessMessage(
        isEditing
          ? "Product updated successfully."
          : "Product added successfully."
      );

      await loadProducts();
    } catch (error) {
      setFormError(error.message || "Something went wrong.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setPageError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}${product.id}/`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || data.error || "Unable to delete product.");
      }

      setSuccessMessage("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      setPageError(error.message || "Unable to delete product.");
    }
  }

  function openOrderDialog(product) {
    setCustomerName(getCustomerName(currentUser));
    setCustomerEmail(getCustomerEmail(currentUser));
    setOrderingProduct(product);
    setQuantity("1");
    setOrderError("");
    setOrderSuccess("");
  }

  function closeOrderDialog() {
    if (ordering) return;
    setOrderingProduct(null);
    setQuantity("1");
    setOrderError("");
    setOrderSuccess("");
  }

  async function handleOrder(event) {
    event.preventDefault();
    setOrderError("");
    setOrderSuccess("");

    if (!orderingProduct) return;

    if (!isCustomer) {
      setOrderError("Please login with your customer account to place an order.");
      return;
    }

    const name = customerName.trim();
    const email = customerEmail.trim().toLowerCase();
    const requestedQuantity = Number(quantity);
    const stock = Number(orderingProduct.stock || 0);

    if (!name) {
      setOrderError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOrderError("Please enter a valid email address.");
      return;
    }

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      setOrderError("Please enter a valid quantity.");
      return;
    }

    if (requestedQuantity > stock) {
      setOrderError("Requested quantity exceeds available stock.");
      return;
    }

    setOrdering(true);

    try {
      const response = await fetch(ORDER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: orderingProduct.id,
          quantity: requestedQuantity,
          customer_name: name,
          customer_email: email,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || data.error || "Unable to place your order.");
      }

      // APIs can return the order in data.order or directly in data.
      const savedOrder = data.order || data;
      const orderId =
        savedOrder.id ??
        savedOrder.order_id ??
        data.order_id ??
        null;

      const totalAmount = Number(
        savedOrder.total_price ??
          savedOrder.total ??
          savedOrder.amount ??
          Number(orderingProduct.price) * requestedQuantity
      );

      const orderDetails = {
        id: orderId,
        order_id: orderId,
        product:
          typeof savedOrder.product === "string"
            ? savedOrder.product
            : savedOrder.product?.name || orderingProduct.name,
        quantity: requestedQuantity,
        amount: totalAmount,
        total_price: totalAmount,
        customer_name: name,
        customer_email: email,
        status: savedOrder.status || "Pending",
      };

      setOrderSuccess("Order placed successfully! Opening Payments...");

      await loadProducts();

      window.setTimeout(() => {
        setOrderingProduct(null);
        setOrderSuccess("");
        onNavigate?.("payments", orderDetails);
      }, 800);
    } catch (error) {
      setOrderError(error.message || "Unable to place your order.");
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="products-title">
          <div className="products-logo">✿</div>
          <div>
            <h1>Flower Products</h1>
            <p>Flower Market Dispatch · Inventory Management</p>
          </div>
        </div>

        <div className="products-header-actions">
          {isAdmin && (
            <button
              type="button"
              className="add-product-button"
              onClick={openAddForm}
            >
              + Add Product
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="products-logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {isCustomer && (
        <p className="products-customer-note">
          Signed in as {getCustomerEmail(currentUser)}
        </p>
      )}

      <section className="products-stats">
        <div className="product-stat green-stat">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="product-stat blue-stat">
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </div>
        <div className="product-stat orange-stat">
          <span>Low Stock Items</span>
          <strong>{lowStockCount}</strong>
        </div>
        <div className="product-stat purple-stat">
          <span>Categories</span>
          <strong>{Math.max(categories.length - 1, 0)}</strong>
        </div>
      </section>

      {pageError && (
        <div className="products-alert products-alert-error">{pageError}</div>
      )}

      {successMessage && (
        <div className="products-alert products-alert-success">
          {successMessage}
        </div>
      )}

      <section className="products-toolbar">
        <input
          className="products-search"
          type="search"
          placeholder="Search flowers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </section>

      <div className="products-section-heading">
        <div>
          <h2>Available Flowers</h2>
          <p>Browse and manage your flower inventory.</p>
        </div>
        <span>{filteredProducts.length} products</span>
      </div>

      {loading ? (
        <div className="products-empty">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-empty">
          <h3>No products found</h3>
          <p>
            {isAdmin
              ? "Add a product or change your search filters."
              : "Try searching for a different flower."}
          </p>
          {isAdmin && (
            <button
              type="button"
              className="add-product-button"
              onClick={openAddForm}
            >
              + Add Product
            </button>
          )}
        </div>
      ) : (
        <section className="products-grid">
          {filteredProducts.map((product) => {
            const stock = Number(product.stock || 0);
            const image = getFlowerImage(product);

            return (
              <article className="product-card" key={product.id}>
                <div className="product-photo-wrap">
                  {image ? (
                    <img
                      className="product-photo"
                      src={image}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="product-photo-placeholder">✿</div>
                  )}

                  <span className="product-category">
                    {product.category || "Flowers"}
                  </span>
                </div>

                <div className="product-card-content">
                  <div className="product-card-title-row">
                    <h3>{product.name}</h3>
                    <span
                      className={`product-status ${
                        stock > 5
                          ? "in-stock"
                          : stock > 0
                            ? "low-stock"
                            : "out-of-stock"
                      }`}
                    >
                      {stock > 5
                        ? "In Stock"
                        : stock > 0
                          ? "Low Stock"
                          : "Out of Stock"}
                    </span>
                  </div>

                  <p className="product-description">
                    {product.description || "Fresh flowers for every occasion."}
                  </p>

                  <div className="product-stock">
                    Available quantity: <strong>{stock}</strong>
                  </div>

                  <div className="product-price-row">
                    <span className="product-price">
                      ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {isAdmin ? (
                    <div className="product-admin-actions">
                      <button
                        type="button"
                        className="edit-product-button"
                        onClick={() => openEditForm(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-product-button"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="product-order-button"
                      disabled={stock <= 0 || !isCustomer}
                      onClick={() => openOrderDialog(product)}
                    >
                      {stock <= 0
                        ? "Out of Stock"
                        : !isCustomer
                          ? "Customer Login Required"
                          : "Order Now"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {isAdmin && showProductForm && (
        <div className="order-dialog-backdrop">
          <section
            className="order-dialog product-management-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <button
              type="button"
              className="order-dialog-close"
              onClick={closeProductForm}
              disabled={savingProduct}
              aria-label="Close"
            >
              ×
            </button>

            <h2 id="product-form-title">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="product-form-subtitle">
              Enter the flower product details below.
            </p>

            {formError && (
              <div className="order-error-message">{formError}</div>
            )}

            <form onSubmit={handleSaveProduct} className="product-form">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                required
              />

              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
                rows={3}
              />

              <div className="product-form-two-columns">
                <div>
                  <label htmlFor="product-price">Price (₹) *</label>
                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="product-stock">Stock *</label>
                  <input
                    id="product-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>
              </div>

              <label htmlFor="product-category">Category</label>
              <input
                id="product-category"
                name="category"
                value={productForm.category}
                onChange={handleProductFormChange}
              />

              <label htmlFor="product-image">Image URL</label>
              <input
                id="product-image"
                name="image_url"
                type="url"
                value={productForm.image_url}
                onChange={handleProductFormChange}
                placeholder="https://example.com/flower.jpg"
              />

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-product-button"
                  onClick={closeProductForm}
                  disabled={savingProduct}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="add-product-button"
                  disabled={savingProduct}
                >
                  {savingProduct
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {orderingProduct && (
        <div className="order-dialog-backdrop">
          <section
            className="order-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
          >
            <button
              type="button"
              className="order-dialog-close"
              onClick={closeOrderDialog}
              disabled={ordering}
              aria-label="Close"
            >
              ×
            </button>

            <h2 id="order-dialog-title">Place Your Order</h2>
            <p>{orderingProduct.name}</p>
            <p className="product-price">
              ₹{Number(orderingProduct.price || 0).toLocaleString("en-IN")} each
            </p>

            {orderError && (
              <div className="order-error-message">{orderError}</div>
            )}
            {orderSuccess && (
              <div className="order-success-message">{orderSuccess}</div>
            )}

            <form onSubmit={handleOrder}>
              <label htmlFor="customer-name">Full Name *</label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                autoComplete="name"
                required
              />

              <label htmlFor="customer-email">Email Address *</label>
              <input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="order-quantity">Quantity *</label>
              <input
                id="order-quantity"
                type="number"
                min="1"
                max={Number(orderingProduct.stock || 0)}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />

              <div className="order-total">
                Total: ₹
                {(
                  Number(orderingProduct.price || 0) *
                  Number(quantity || 0)
                ).toLocaleString("en-IN")}
              </div>

              <button
                type="submit"
                className="product-order-button"
                disabled={ordering || Boolean(orderSuccess)}
              >
                {ordering ? "Placing Order..." : "Confirm Order"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Products;
