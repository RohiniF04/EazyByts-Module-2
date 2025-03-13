import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPortfolioItemSchema, insertWatchlistItemSchema, insertUserPreferencesSchema } from "@shared/schema";

// Simulated financial data
function getRandomPrice(min = 100, max = 1000) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function getRandomChange() {
  const isPositive = Math.random() > 0.5;
  const change = +(Math.random() * 5).toFixed(2);
  return isPositive ? change : -change;
}

// Mock stock data for demonstration
const stockData = {
  AAPL: { name: "Apple Inc.", price: 173.42, change: 2.74, marketCap: "2.84T", peRatio: 28.64, dividendYield: 0.51 },
  MSFT: { name: "Microsoft Corporation", price: 328.79, change: 1.34, marketCap: "2.45T", peRatio: 31.22, dividendYield: 0.82 },
  GOOGL: { name: "Alphabet Inc.", price: 2728.36, change: 1.57, marketCap: "1.72T", peRatio: 25.78, dividendYield: 0.0 },
  AMZN: { name: "Amazon.com, Inc.", price: 3445.09, change: -0.87, marketCap: "1.75T", peRatio: 60.21, dividendYield: 0.0 },
  TSLA: { name: "Tesla, Inc.", price: 864.27, change: 3.21, marketCap: "868B", peRatio: 186.43, dividendYield: 0.0 },
  META: { name: "Meta Platforms, Inc.", price: 325.45, change: 0.95, marketCap: "885B", peRatio: 27.12, dividendYield: 0.0 },
  NFLX: { name: "Netflix, Inc.", price: 518.73, change: 1.13, marketCap: "230B", peRatio: 45.67, dividendYield: 0.0 },
  NVDA: { name: "NVIDIA Corporation", price: 716.99, change: 4.32, marketCap: "1.77T", peRatio: 75.39, dividendYield: 0.04 },
  JPM: { name: "JPMorgan Chase & Co.", price: 142.61, change: -0.42, marketCap: "415B", peRatio: 11.32, dividendYield: 2.80 },
  BAC: { name: "Bank of America Corporation", price: 38.28, change: -0.65, marketCap: "300B", peRatio: 10.85, dividendYield: 2.61 },
  WMT: { name: "Walmart Inc.", price: 142.63, change: -0.42, marketCap: "383B", peRatio: 29.76, dividendYield: 1.54 },
  PG: { name: "The Procter & Gamble Company", price: 159.37, change: 0.77, marketCap: "376B", peRatio: 28.35, dividendYield: 2.44 }
};

// Mock market indices
const marketIndices = {
  "S&P 500": { value: 4587.64, change: 1.23, changeAmount: 56.09 },
  "NASDAQ": { value: 14346.02, change: 1.64, changeAmount: 232.56 },
  "DOW JONES": { value: 35208.51, change: 0.78, changeAmount: 272.68 },
  "10-YR TREASURY": { value: 1.63, change: -0.05, changeAmount: -0.05 }
};

// Generate historical data for charts
function generateHistoricalData(symbol: string, days: number) {
  const basePrice = stockData[symbol] ? stockData[symbol].price / 2 : 100;
  const data = [];
  
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some randomness to create variation
    const change = (Math.random() - 0.48) * 5;
    currentPrice = Math.max(currentPrice + change, 1);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: +currentPrice.toFixed(2)
    });
  }
  
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes start with /api prefix
  
  // Stock search endpoint
  app.get("/api/search", (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }
    
    const results = Object.entries(stockData)
      .filter(([symbol, data]) => 
        symbol.toLowerCase().includes(query.toLowerCase()) || 
        data.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(([symbol, data]) => ({
        symbol,
        name: data.name,
        price: data.price,
        change: data.change
      }));
    
    res.json(results);
  });
  
  // Get stock details
  app.get("/api/stocks/:symbol", (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const stock = stockData[symbol];
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    res.json({
      symbol,
      ...stock
    });
  });
  
  // Get historical price data
  app.get("/api/stocks/:symbol/history", (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    
    if (!stockData[symbol]) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    const timeframe = req.query.timeframe || '1M';
    let days;
    
    switch(timeframe) {
      case '1D': days = 1; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '6M': days = 180; break;
      case '1Y': days = 365; break;
      default: days = 30;
    }
    
    const data = generateHistoricalData(symbol, days);
    res.json(data);
  });
  
  // Get market overview
  app.get("/api/market/overview", (_req, res) => {
    res.json(marketIndices);
  });
  
  // Portfolio routes
  app.get("/api/portfolio", async (req, res) => {
    // In a real app, this would come from auth middleware
    const userId = 1; // Using demo user
    
    try {
      const portfolioItems = await storage.getPortfolioItems(userId);
      
      // Add current price and performance data
      const enrichedItems = portfolioItems.map(item => {
        const currentPrice = stockData[item.symbol]?.price || item.purchasePrice;
        const totalValue = currentPrice * item.shares;
        const totalCost = item.purchasePrice * item.shares;
        const profit = totalValue - totalCost;
        const percentChange = ((currentPrice - item.purchasePrice) / item.purchasePrice) * 100;
        
        return {
          ...item,
          currentPrice,
          totalValue,
          profit,
          percentChange: +percentChange.toFixed(2)
        };
      });
      
      res.json(enrichedItems);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio data" });
    }
  });
  
  app.post("/api/portfolio", async (req, res) => {
    // In a real app, this would come from auth middleware
    const userId = 1; // Using demo user
    
    try {
      const validatedData = insertPortfolioItemSchema.parse({
        ...req.body,
        userId,
        purchaseDate: new Date(req.body.purchaseDate)
      });
      
      const newItem = await storage.addPortfolioItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      res.status(400).json({ message: "Invalid portfolio data" });
    }
  });
  
  app.put("/api/portfolio/:id", async (req, res) => {
    const userId = 1; // Using demo user
    const itemId = parseInt(req.params.id);
    
    try {
      const item = await storage.getPortfolioItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updateData = req.body;
      if (updateData.purchaseDate) {
        updateData.purchaseDate = new Date(updateData.purchaseDate);
      }
      
      const updated = await storage.updatePortfolioItem(itemId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });
  
  app.delete("/api/portfolio/:id", async (req, res) => {
    const userId = 1; // Using demo user
    const itemId = parseInt(req.params.id);
    
    try {
      const item = await storage.getPortfolioItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePortfolioItem(itemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });
  
  // Watchlist routes
  app.get("/api/watchlist", async (req, res) => {
    const userId = 1; // Using demo user
    
    try {
      const watchlistItems = await storage.getWatchlistItems(userId);
      
      // Add stock data
      const enrichedItems = watchlistItems.map(item => {
        const stock = stockData[item.symbol] || {
          name: "Unknown", 
          price: 0, 
          change: 0
        };
        
        return {
          ...item,
          name: stock.name,
          price: stock.price,
          change: stock.change
        };
      });
      
      res.json(enrichedItems);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist data" });
    }
  });
  
  app.post("/api/watchlist", async (req, res) => {
    const userId = 1; // Using demo user
    
    try {
      // Check if already in watchlist
      const existing = await storage.getWatchlistItemBySymbol(userId, req.body.symbol);
      
      if (existing) {
        return res.status(409).json({ message: "Stock already in watchlist" });
      }
      
      const validatedData = insertWatchlistItemSchema.parse({
        ...req.body,
        userId,
        dateAdded: new Date()
      });
      
      const newItem = await storage.addWatchlistItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error adding watchlist item:", error);
      res.status(400).json({ message: "Invalid watchlist data" });
    }
  });
  
  app.delete("/api/watchlist/:id", async (req, res) => {
    const userId = 1; // Using demo user
    const itemId = parseInt(req.params.id);
    
    try {
      const item = await storage.getWatchlistItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Watchlist item not found" });
      }
      
      if (item.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteWatchlistItem(itemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting watchlist item:", error);
      res.status(500).json({ message: "Failed to delete watchlist item" });
    }
  });
  
  // User preferences routes
  app.get("/api/preferences", async (req, res) => {
    const userId = 1; // Using demo user
    
    try {
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  
  app.put("/api/preferences", async (req, res) => {
    const userId = 1; // Using demo user
    
    try {
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        const newPreferences = await storage.createUserPreferences({
          userId,
          ...req.body
        });
        return res.json(newPreferences);
      }
      
      const updated = await storage.updateUserPreferences(userId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(400).json({ message: "Invalid preference data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
