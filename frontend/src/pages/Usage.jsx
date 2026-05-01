import { useEffect, useState } from "react";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function Usage() {
  const [logs, setLogs] = useState([]);
  const [usage, setUsage] = useState(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [billing, setBilling] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    fetchLogs();
    fetchBilling();
    fetchBillingHistory();
  }, []);

  // ✅ FETCH LOGS
  const fetchLogs = async () => {
    try {
      const res = await API.get("/usage");

      setUsage(res.data);
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // 💰 BILL
  const fetchBilling = async () => {
    try {
      const res = await API.get("/billing/calculate");
      setBilling(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 📄 HISTORY
  const fetchBillingHistory = async () => {
    try {
      const res = await API.get("/billing/history");
      setBillingHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 💳 PAY
  const handlePayment = async () => {
    try {
      setPaying(true);
      await API.post("/billing/pay");

      await fetchBilling();
      await fetchBillingHistory();

      alert("Payment successful!");
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  // 📊 STATS
  const safeLogs = Array.isArray(logs) ? logs : [];

  const total = usage?.totalRequests ?? safeLogs.length;
  const errors = usage?.errors ?? safeLogs.filter(l => l.status !== 200).length;
  const successRate =
    total === 0 ? 0 : ((total - errors) / total) * 100;

  // 🔍 FILTER
  const filteredLogs = safeLogs.filter((log) => {
    const matchKey = log.apiKey?.toLowerCase().includes(filter.toLowerCase());

    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "success"
        ? log.status === 200
        : log.status !== 200;

    return matchKey && matchStatus;
  });

  // 📊 BAR DATA
  const usageByKey = {};
  safeLogs.forEach((log) => {
    if (!log.apiKey) return;
    usageByKey[log.apiKey] = (usageByKey[log.apiKey] || 0) + 1;
  });

  const usageArray = Object.entries(usageByKey).map(([key, count]) => ({
    key,
    count,
  }));

  // 📈 LINE DATA
  const grouped = {};

  safeLogs.forEach((log) => {
    let date = new Date(log.createdAt || Date.now());

    const label = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!grouped[label]) {
      grouped[label] = { success: 0, errors: 0, date };
    }

    if (log.status === 200) grouped[label].success++;
    else grouped[label].errors++;
  });

  const chartData = Object.keys(grouped)
    .map((time) => ({
      time,
      ...grouped[time],
    }))
    .sort((a, b) => a.date - b.date);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1000px",
        margin: "auto",
        color: "white",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Usage Dashboard</h1>

      {/* 💰 BILL */}
      {billing && (
        <div
          style={{
            background: "#111",
            padding: "25px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h2>💰 Current Bill</h2>
          <p>Total Requests: {billing.totalRequests}</p>
          <p>Cost per Request: ₹{billing.costPerRequest}</p>
          <h2>₹{billing.amount.toFixed(2)}</h2>

          <button
            onClick={handlePayment}
            disabled={paying}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: "#4CAF50",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: "white",
            }}
          >
            {paying ? "Processing..." : "Pay Now"}
          </button>
        </div>
      )}

      {/* 🧾 HISTORY */}
      <h2>Billing History</h2>

      {billingHistory.length === 0 ? (
        <p>No payments yet</p>
      ) : (
        billingHistory.map((bill) => (
          <div
            key={bill._id}
            style={{
              background: "#111",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p><strong>₹{bill.amount.toFixed(2)}</strong></p>
              <p>Requests: {bill.totalRequests}</p>
            </div>

            <div>
              <p style={{ color: "lightgreen" }}>{bill.status}</p>
              <small>{new Date(bill.createdAt).toLocaleString()}</small>
            </div>
          </div>
        ))
      )}

      {/* 📊 STATS */}
      <h3 style={{ marginTop: "20px" }}>Total Requests: {total}</h3>
      <p>Errors: {errors}</p>
      <p>Success Rate: {successRate.toFixed(1)}%</p>

      {/* 📊 BAR */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BarChart width={700} height={250} data={usageArray}>
          <XAxis dataKey="key" tickFormatter={(k) => k.slice(0, 6)} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#00ff9f" />
        </BarChart>
      </div>

      {/* 📈 LINE */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <LineChart width={700} height={300} data={chartData}>
          <CartesianGrid stroke="#333" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="success" stroke="#00ff9f" />
          <Line type="monotone" dataKey="errors" stroke="#ff4d4f" />
        </LineChart>
      </div>

      {/* 🔍 FILTER */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <input
          placeholder="Filter by API key"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="all">All</option>
          <option value="success">Success</option>
          <option value="error">Errors</option>
        </select>
      </div>

      {/* 📜 LOGS */}
      <h2 style={{ marginTop: "30px" }}>📜 Usage Logs</h2>

      {filteredLogs.map((log) => (
        <div
          key={log._id}
          style={{
            background: "#111",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p><strong>{log.endpoint}</strong></p>
            <small>{new Date(log.createdAt).toLocaleString()}</small>
          </div>

          <div>
            <p style={{
              color: log.status === 200 ? "#00ff9f" : "#ff4d4f"
            }}>
              {log.status}
            </p>
            <small>{log.apiKey?.slice(0, 6)}...</small>
          </div>
        </div>
      ))}
    </div>
  );
}
