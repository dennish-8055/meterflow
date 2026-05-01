import { useEffect, useState } from "react";
import API from "../services/api";

export default function APIs() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apis, setApis] = useState([]);

  // 📦 Fetch APIs
  const fetchApis = async () => {
    try {
      const res = await API.get("/apis");
      setApis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ Create API
  const createApi = async () => {
    try {
      await API.post("/apis", {
        name,
        baseUrl: url,
      });

      setName("");
      setUrl("");
      fetchApis();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>APIs</h1>

      {/* CREATE API */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="API Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <input
          placeholder="Base URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <button onClick={createApi}>
          Create API
        </button>
      </div>

      {/* LIST APIs */}
      {apis.length === 0 ? (
        <p>No APIs yet</p>
      ) : (
        apis.map((api) => (
          <div
            key={api._id}
            style={{
              background: "#1e1e2f",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "10px"
            }}
          >
            <p><strong>{api.name}</strong></p>
            <p>{api.baseUrl}</p>
          </div>
        ))
      )}
    </div>
  );
}