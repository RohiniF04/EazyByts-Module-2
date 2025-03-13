import { apiRequest } from "./queryClient";

// Stock API
export async function searchStocks(query: string) {
  const response = await apiRequest("GET", `/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function getStockDetails(symbol: string) {
  const response = await apiRequest("GET", `/api/stocks/${encodeURIComponent(symbol)}`);
  return response.json();
}

export async function getStockHistory(symbol: string, timeframe: string = "1M") {
  const response = await apiRequest("GET", `/api/stocks/${encodeURIComponent(symbol)}/history?timeframe=${timeframe}`);
  return response.json();
}

// Portfolio API
export async function getPortfolio() {
  const response = await apiRequest("GET", "/api/portfolio");
  return response.json();
}

export async function addPortfolioItem(data: any) {
  const response = await apiRequest("POST", "/api/portfolio", data);
  return response.json();
}

export async function updatePortfolioItem(id: number, data: any) {
  const response = await apiRequest("PUT", `/api/portfolio/${id}`, data);
  return response.json();
}

export async function deletePortfolioItem(id: number) {
  return apiRequest("DELETE", `/api/portfolio/${id}`);
}

// Watchlist API
export async function getWatchlist() {
  const response = await apiRequest("GET", "/api/watchlist");
  return response.json();
}

export async function addToWatchlist(symbol: string) {
  const response = await apiRequest("POST", "/api/watchlist", { symbol });
  return response.json();
}

export async function removeFromWatchlist(id: number) {
  return apiRequest("DELETE", `/api/watchlist/${id}`);
}

// Market API
export async function getMarketOverview() {
  const response = await apiRequest("GET", "/api/market/overview");
  return response.json();
}

// User Preferences API
export async function getUserPreferences() {
  const response = await apiRequest("GET", "/api/preferences");
  return response.json();
}

export async function updateUserPreferences(preferences: any) {
  const response = await apiRequest("PUT", "/api/preferences", preferences);
  return response.json();
}
