import { useState, useEffect } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");

  const fetchItems = async () => {
    const res = await fetch(`${API}/items`);
    setItems(await res.json());
  };

  useEffect(() => { fetchItems(); }, []);

  const addItem = async () => {
    if (!input.trim()) return;
    await fetch(`${API}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: input }),
    });
    setInput("");
    fetchItems();
  };

  const deleteItem = async (id) => {
    await fetch(`${API}/items/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1> Todo List</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          data-testid="item-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new item..."
          style={{ flex: 1, padding: "8px 12px", fontSize: 16 }}
        />
        <button data-testid="add-btn" onClick={addItem}
          style={{ padding: "8px 16px", fontSize: 16 }}>
          Add
        </button>
      </div>

      <ul style={{ marginTop: 24, paddingLeft: 0, listStyle: "none" }}>
        {items.map((item) => (
          <li key={item.id}
            style={{ display: "flex", justifyContent: "space-between",
                     padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <span>{item.name}</span>
            <button onClick={() => deleteItem(item.id)}
              style={{ background: "none", border: "none", cursor: "pointer",
                       color: "#e55" }}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}