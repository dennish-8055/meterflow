import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const [apis, setApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔑 Fetch keys (FIXED RESPONSE HANDLING)
  const fetchKeys = async () => {
    try {
      const res = await API.get("/keys");

      // 🔥 handle both possible formats
      const data = res.data?.keys || res.data || [];

      setKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching keys:", err);
      setKeys([]);
    }
  };

  // 📦 Fetch APIs
  const fetchApis = async () => {
    try {
      const res = await API.get("/apis");

      const data = res.data?.apis || res.data || [];

      setApis(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching APIs:", err);
      setApis([]);
    }
  };

  // ➕ Create key (🔥 INSTANT UI UPDATE FIX)
  const createKey = async () => {
    if (!selectedApi) {
      alert("Select API first");
      return;
    }

    try {
      const res = await API.post("/keys", {
        apiId: selectedApi,
      });

      // 🔥 ADD NEW KEY DIRECTLY (NO REFETCH BUG)
      setKeys((prev) => [res.data, ...prev]);

      setSelectedApi("");
    } catch (err) {
      console.error("Error creating key:", err);
    }
  };

  // ❌ Delete key (instant update)
  const deleteKey = async (id) => {
    try {
      await API.delete(`/keys/${id}`);

      // 🔥 remove locally (no refetch delay)
      setKeys((prev) => prev.filter((k) => k._id !== id));
    } catch (err) {
      console.error("Error deleting key:", err);
    }
  };

  // 🔐 INIT
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await Promise.all([fetchKeys(), fetchApis()]);

      setLoading(false);
    };

    init();
  }, []);

  // ⏳ Loading
  if (loading) {
    return (
      <p style={{ textAlign: "center", color: "white" }}>
        Loading...
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "auto",
        color: "white",
      }}
    >
      <h1 style={{ textAlign: "center" }}>API Keys</h1>

      {/* CREATE KEY */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <select
          value={selectedApi}
          onChange={(e) => setSelectedApi(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
          }}
        >
          <option value="">Select API</option>
          {apis.map((api) => (
            <option key={api._id} value={api._id}>
              {api.name}
            </option>
          ))}
        </select>

        <button
          onClick={createKey}
          style={{
            background: "#4CAF50",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Create API Key
        </button>
      </div>

      {/* KEYS LIST */}
      {keys.length === 0 ? (
        <p style={{ textAlign: "center" }}>No keys yet</p>
      ) : (
        keys.map((k) => (
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

            <p>
              <strong>API:</strong> {k.apiId?.name || "Unknown API"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {k.active === false ? "Revoked" : "Active"}
            </p>

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
        ))
      )}
    </div>
  );
}