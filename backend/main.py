from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
items: List[dict] = []
_next_id = 1


class ItemCreate(BaseModel):
    name: str


class ItemResponse(BaseModel):
    id: int
    name: str


@app.get("/items", response_model=List[ItemResponse])
def get_items():
    return items


@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate):
    global _next_id
    if not item.name.strip():
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    new_item = {"id": _next_id, "name": item.name.strip()}
    items.append(new_item)
    _next_id += 1
    return new_item


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    for i, item in enumerate(items):
        if item["id"] == item_id:
            items.pop(i)
            return
    raise HTTPException(status_code=404, detail="Item not found")