import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";
import { useProducts } from "./ProductContext";
import "./managersapace.css";

const ManagerSpace = () => {
  const { products } = useProducts();
  const [auditData, setAuditData] = useState([]);
  const [form, setForm] = useState({
    product: "",
    systemQty: "",
    physicalQty: "",
  });

  // Log products to debug if list is loaded
  useEffect(() => {
    console.log("Loaded products:", products);
  }, [products]);

  // Handle change for select and inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "product") {
      const selectedProduct = products.find(
        (p) => p.name.toLowerCase() === value.toLowerCase()
      );
      if (selectedProduct) {
        setForm({
          product: selectedProduct.name,
          systemQty: selectedProduct.quantity,
          physicalQty: "",
        });
      } else {
        setForm({ product: "", systemQty: "", physicalQty: "" });
      }
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  // Add new audit entry
  const handleAddAudit = async () => {
    const { product, systemQty, physicalQty } = form;

    if (!product || physicalQty === "") {
      alert("Please select a product and enter physical quantity.");
      return;
    }

    const parsedSystemQty = parseInt(systemQty, 10);
    const parsedPhysicalQty = parseInt(physicalQty, 10);

    if (isNaN(parsedSystemQty) || isNaN(parsedPhysicalQty)) {
      alert("Invalid quantity input.");
      return;
    }

    const difference = parsedPhysicalQty - parsedSystemQty;

    // Check for duplicates
    if (auditData.some((entry) => entry.product === product)) {
      alert("Product already exists in the audit table.");
      return;
    }

    // Optional: send to backend
    try {
      await axios.post("http://localhost:5000/api/audits", {
        product,
        systemQty: parsedSystemQty,
        physicalQty: parsedPhysicalQty,
        difference,
      });
    } catch (err) {
      console.warn("Backend error (not blocking UI):", err.message);
    }

    // Update table immediately
    setAuditData((prev) => [
      ...prev,
      {
        product,
        systemQty: parsedSystemQty,
        physicalQty: parsedPhysicalQty,
        difference,
      },
    ]);

    // Reset form
    setForm({ product: "", systemQty: "", physicalQty: "" });
  };

  // Delete entry
  const handleDelete = (productName) => {
    setAuditData((prev) =>
      prev.filter((entry) => entry.product !== productName)
    );
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title="Manager Space" />

        <div className="inventory-audit">
          <h3>Inventory Audit</h3>
          <p>Perform a physical stock count and update your system.</p>

          <div className="audit-form">
            <select name="product" value={form.product} onChange={handleChange}>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.name} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="systemQty"
              placeholder="System Quantity"
              value={form.systemQty}
              disabled
            />

            <input
              type="number"
              name="physicalQty"
              placeholder="Physical Quantity"
              value={form.physicalQty}
              onChange={handleChange}
            />

            <button className="btn btn-primary" onClick={handleAddAudit}>
              Add to Table
            </button>
          </div>

          <table className="audit-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>System Qty</th>
                <th>Physical Qty</th>
                <th>Difference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.product}</td>
                  <td>{entry.systemQty}</td>
                  <td>{entry.physicalQty}</td>
                  <td>{entry.difference}</td>
                  <td>
                    <button onClick={() => handleDelete(entry.product)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {auditData.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    No audit entries added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerSpace;
