import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock global fetch
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("App – Frontend Tests", () => {

  // ── Test Case 1 ────────────────────────────────────────────────────────────
  it("TC1: 頁面載入後應渲染現有的購買清單", async () => {
    /**
     * 測試目的：App 掛載時會呼叫 GET /items，
     * 並將回傳的清單正確渲染到畫面上。
     */
    fetch.mockResolvedValueOnce({
      json: async () => [
        { id: 1, name: "Learn React" },
        { id: 2, name: "Write tests" },
      ],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Learn React")).toBeInTheDocument();
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });
  });

  // ── Test Case 2 ────────────────────────────────────────────────────────────
  it("TC2: 點擊 Add 按鈕後應呼叫 POST /items 並刷新清單", async () => {
    /**
     * 測試目的：使用者輸入文字並點擊 Add 按鈕後，
     * 前端應向後端發送 POST 請求，並重新 fetch 清單。
     */
    // 1st call: initial GET /items (empty)
    fetch.mockResolvedValueOnce({ json: async () => [] });
    // 2nd call: POST /items
    fetch.mockResolvedValueOnce({ json: async () => ({ id: 1, name: "Buy milk" }) });
    // 3rd call: refresh GET /items
    fetch.mockResolvedValueOnce({ json: async () => [{ id: 1, name: "Buy milk" }] });

    render(<App />);

    const input = screen.getByTestId("item-input");
    const btn   = screen.getByTestId("add-btn");

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(btn);

    await waitFor(() => {
      const postCall = fetch.mock.calls.find(
        ([url, opts]) => url.includes("/items") && opts?.method === "POST"
      );
      expect(postCall).toBeTruthy();
      expect(JSON.parse(postCall[1].body)).toEqual({ name: "Buy milk" });
    });

    await waitFor(() => {
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
    });
  });
});