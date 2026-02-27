// client/src/components/OrderInvoice.jsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import pdfBg from "../assets/Pdfbg.png";
import logo from "../assets/logo.png";

const OrderInvoice = forwardRef(({ order, garments = [] }, ref) => {
  const invoiceRef = useRef();

  useImperativeHandle(ref, () => ({
    handleDownload: async () => {
      try {
        const element = invoiceRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        pdf.save(`Dreamfit_Invoice_${order?.orderId || "Order"}.pdf`);
      } catch (error) {
        console.error("PDF Error:", error);
        alert("Failed to generate PDF");
      }
    },
  }));

  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Get delivery status text
  const getDeliveryStatus = () => {
    const orderDate = new Date(order.deliveryDate);
    const today = new Date();
    const diffTime = orderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "DELAYED";
    if (diffDays === 0) return "TODAY";
    if (diffDays <= 3) return "URGENT";
    if (diffDays <= 7) return "THIS WEEK";
    return "ON SCHEDULE";
  };

  // Calculate totals
  const subtotalMin = order.priceSummary?.totalMin || 0;
  const subtotalMax = order.priceSummary?.totalMax || 0;
  const advance = order.advancePayment?.amount || 0;
  const balanceMin = subtotalMin - advance;
  const balanceMax = subtotalMax - advance;

  return (
    <div
      ref={invoiceRef}
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#334155",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${pdfBg})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          opacity: 0.08,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "50px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "35px",
          }}
        >
          <img
            src={logo}
            alt="Dreamfit Logo"
            style={{ width: "200px" }}
          />

          <div style={{ textAlign: "right", lineHeight: "1.4" }}>
            <h1
              style={{
                color: "#be185d",
                fontSize: "34px",
                fontWeight: "900",
                margin: 0,
              }}
            >
              INVOICE
            </h1>
            <p style={{ fontWeight: "800", margin: "5px 0" }}>
              #{order.orderId}
            </p>
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              Date: {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        {/* CUSTOMER + DELIVERY WITH STATUS */}
        <div
          style={{
            display: "flex",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "18px",
              borderLeft: "5px solid #be185d",
              backgroundColor: "#fdf2f8",
              borderRadius: "10px",
            }}
          >
            <h4 style={{ marginBottom: "8px", color: "#be185d" }}>
              Billed To
            </h4>
            <p style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>
              {order.customer?.name}
            </p>
            <p style={{ margin: "4px 0" }}>
              {order.customer?.phone}
            </p>
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              {order.customer?.addressLine1} {order.customer?.addressLine2}
              <br />
              {order.customer?.city}
            </p>
          </div>

          <div style={{ width: "260px", textAlign: "right" }}>
            {/* Delivery Status */}
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 5px 0" }}>
                Delivery Status
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "800",
                  background: getDeliveryStatus() === "DELAYED" ? "#fee2e2" :
                             getDeliveryStatus() === "URGENT" ? "#ffedd5" :
                             getDeliveryStatus() === "TODAY" ? "#fef9c3" :
                             getDeliveryStatus() === "THIS WEEK" ? "#dbeafe" :
                             "#dcfce7",
                  color: getDeliveryStatus() === "DELAYED" ? "#991b1b" :
                         getDeliveryStatus() === "URGENT" ? "#9a3412" :
                         getDeliveryStatus() === "TODAY" ? "#854d0e" :
                         getDeliveryStatus() === "THIS WEEK" ? "#1e40af" :
                         "#166534",
                }}
              >
                {getDeliveryStatus()}
              </span>
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 5px 0" }}>
              Delivery Date
            </p>
            <p
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#be185d",
                margin: "0 0 10px 0",
              }}
            >
              {formatDate(order.deliveryDate)}
            </p>

            <span
              style={{
                background: "#be185d",
                color: "#fff",
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: "700",
              }}
            >
              {order.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* TABLE - WITH ALL MEASUREMENTS */}
        <div
          style={{
            border: "1px solid #fbcfe8",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "40px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#be185d", color: "#fff" }}>
                <th style={{ width: "30%", padding: "15px", textAlign: "left" }}>
                  Garment
                </th>
                <th style={{ width: "40%", padding: "15px", textAlign: "left" }}>
                  Measurements
                </th>
                <th style={{ width: "30%", padding: "15px", textAlign: "right" }}>
                  Price Range (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {garments.map((g, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #fbcfe8" }}>
                  <td style={{ padding: "15px", verticalAlign: "top" }}>
                    <strong>{g.name}</strong>
                    <br />
                    <span style={{ fontSize: "11px", color: "#db2777" }}>
                      {g.garmentId}
                    </span>
                    <br />
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {g.category?.name} / {g.item?.name}
                    </span>
                  </td>

                  <td style={{ padding: "15px" }}>
                    {/* ✅ ALL MEASUREMENTS - EVERY SINGLE ONE */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(2, 1fr)", 
                      gap: "5px 10px",
                      fontSize: "11px"
                    }}>
                      {g.measurements?.map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>
                            {m.name}:
                          </span>
                          <span style={{ fontWeight: "700", color: "#be185d" }}>
                            {m.value}"
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Show message if no measurements */}
                    {(!g.measurements || g.measurements.length === 0) && (
                      <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                        No measurements recorded
                      </span>
                    )}
                  </td>

                  <td
                    style={{
                      padding: "15px",
                      textAlign: "right",
                      fontWeight: "800",
                      verticalAlign: "top",
                    }}
                  >
                    ₹{g.priceRange?.min || 0} - ₹{g.priceRange?.max || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CALCULATION - WITH RANGE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "40px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h4 style={{ color: "#be185d", marginBottom: "10px" }}>
              Special Instructions
            </h4>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6" }}>
              {order.specialNotes ||
                "Handle with professional care. Custom fit guaranteed."}
            </p>
          </div>

          <div
            style={{
              width: "350px",
              padding: "25px",
              border: "2px solid #be185d",
              borderRadius: "15px",
              backgroundColor: "#fff",
            }}
          >
            <h4 style={{ margin: "0 0 15px 0", color: "#be185d" }}>
              Payment Summary
            </h4>

            {/* Subtotal Range */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span style={{ color: "#64748b" }}>Subtotal:</span>
              <strong style={{ fontSize: "16px" }}>
                ₹{subtotalMin} - ₹{subtotalMax}
              </strong>
            </div>

            {/* Advance Payment */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                color: "#166534",
              }}
            >
              <span>Advance Paid:</span>
              <strong>- ₹{advance}</strong>
            </div>

            <hr style={{ margin: "15px 0", borderColor: "#fbcfe8" }} />

            {/* Balance Range */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#be185d" }}>
                  Balance Due
                </span>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0 0" }}>
                  Payable on delivery
                </p>
              </div>
              <strong style={{ fontSize: "24px", fontWeight: "900", color: "#be185d" }}>
                ₹{balanceMin} - ₹{balanceMax}
              </strong>
            </div>

            {/* Show if min != max */}
            {subtotalMin !== subtotalMax && (
              <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "10px", textAlign: "center" }}>
                *Final price may vary based on actual measurements
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <p style={{ fontWeight: "800", color: "#be185d", fontSize: "16px" }}>
            Thank You for Choosing Dreamfit Couture!
          </p>
          <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "20px" }}>
            THIS IS A COMPUTER GENERATED INVOICE • VALID WITHOUT SIGNATURE
          </p>
        </div>
      </div>
    </div>
  );
});

export default OrderInvoice;