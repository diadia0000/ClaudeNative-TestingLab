import pytest
from fastapi.testclient import TestClient
from main import app, items

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    """每個測試前後清空 in-memory store，確保測試互相獨立。"""
    items.clear()
    import main
    main._next_id = 1
    yield
    items.clear()
    main._next_id = 1


# ── Test Case 1 ──────────────────────────────────────────────────────────────

def test_create_item_returns_201_with_correct_data():
    """
    測試：POST /items 成功建立一個 item。
    預期：HTTP 201、回傳 JSON 包含正確 name 與自動產生的 id。
    """
    payload = {"name": "Buy groceries"}
    response = client.post("/items", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Buy groceries"
    assert data["id"] == 1


# ── Test Case 2 ──────────────────────────────────────────────────────────────

def test_get_items_returns_all_created_items():
    """
    測試：新增兩筆 item 後，GET /items 應回傳完整清單。
    預期：HTTP 200、list 長度為 2、內容與新增順序相符。
    """
    client.post("/items", json={"name": "Learn FastAPI"})
    client.post("/items", json={"name": "Write tests"})

    response = client.get("/items")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Learn FastAPI"
    assert data[1]["name"] == "Write tests"