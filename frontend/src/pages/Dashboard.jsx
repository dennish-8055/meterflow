import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const [keys, setKeys] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await API.get("/keys");

      // ✅ FIX: handle new backend response
      setKeys(res.data.keys || []);
      setTotalRequests(res.data.totalRequests || 0);

    } catch (err) {
      console.error("Fetch keys error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id) => {
    try {
      await API.delete(`/keys/${id}`);
      fetchKeys();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 🔥 GROUP KEYS BY API
  const groupedKeys = (keys || []).reduce((acc, key) => {
    const apiName = key.apiId?.name || "Unknown API";

    if (!acc[apiName]) {
      acc[apiName] = [];
    }

    acc[apiName].push(key);
    return acc;
  }, {});

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "auto",
        textAlign: "center",
        color: "white",
      }}
    >
      {/* 🔐 Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 12px",
          background: "#ff4d4d",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <h1>Dashboard</h1>

      {/* 🚀 NAVIGATION */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/apis")} style={{ marginRight: "10px" }}>
          Manage APIs
        </button>

        <button onClick={() => navigate("/keys")} style={{ marginRight: "10px" }}>
          Manage Keys
        </button>

        <button onClick={() => navigate("/usage")}>
          View Usage
        </button>
      </div>

      {/* 📊 CORRECT TOTAL */}
      <h2 style={{ marginTop: "20px", color: "#4CAF50" }}>
        Total Requests: {totalRequests}
      </h2>

      <h2>Your API Keys</h2>

      {/* ⏳ Loading */}
      {loading ? (
        <p>Loading...</p>
      ) : keys.length === 0 ? (
        <p>No keys yet</p>
      ) : (
        Object.keys(groupedKeys).map((apiName) => (
          <div key={apiName} style={{ marginTop: "30px" }}>
            {/* API NAME */}
            <h3 style={{ color: "#4CAF50" }}>{apiName}</h3>

            {/* KEYS */}
            {groupedKeys[apiName].map((k) => (
              <div
                key={k._id}
                style={{
                  background: "#1e1e2f",
                  padding: "15px",
                  marginTop: "10px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                }}
              >
                <p><strong>Key:</strong> {k.key}</p>
                <p><strong>Usage:</strong> {k.usageCount || 0}</p>
                <p><strong>Plan:</strong> {k.plan || "free"}</p>

                <button
                  onClick={() => deleteKey(k._id)}
                  style={{
                    marginTop: "10px",
                    background: "#ff4d4d",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}