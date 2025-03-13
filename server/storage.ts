import { 
  users, type User, type InsertUser,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem,
  watchlistItems, type WatchlistItem, type InsertWatchlistItem,
  userPreferences, type UserPreferences, type InsertUserPreferences
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio operations
  getPortfolioItems(userId: number): Promise<PortfolioItem[]>;
  getPortfolioItem(id: number): Promise<PortfolioItem | undefined>;
  addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: number, item: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: number): Promise<boolean>;
  
  // Watchlist operations
  getWatchlistItems(userId: number): Promise<WatchlistItem[]>;
  getWatchlistItem(id: number): Promise<WatchlistItem | undefined>;
  getWatchlistItemBySymbol(userId: number, symbol: string): Promise<WatchlistItem | undefined>;
  addWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem>;
  deleteWatchlistItem(id: number): Promise<boolean>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolioItems: Map<number, PortfolioItem>;
  private watchlistItems: Map<number, WatchlistItem>;
  private userPreferences: Map<number, UserPreferences>;
  
  private userIdCounter: number;
  private portfolioIdCounter: number;
  private watchlistIdCounter: number;
  private preferencesIdCounter: number;

  constructor() {
    this.users = new Map();
    this.portfolioItems = new Map();
    this.watchlistItems = new Map();
    this.userPreferences = new Map();
    
    this.userIdCounter = 1;
    this.portfolioIdCounter = 1;
    this.watchlistIdCounter = 1;
    this.preferencesIdCounter = 1;
    
    // Initialize with demo user and data
    const demoUser = this.createUser({ username: "demo", password: "demo" });
    
    // Add some sample portfolio items for the demo user
    this.addPortfolioItem({
      userId: demoUser.id,
      symbol: "AAPL",
      companyName: "Apple Inc.",
      shares: 10,
      purchasePrice: 150.50,
      purchaseDate: new Date("2023-01-15")
    });
    
    this.addPortfolioItem({
      userId: demoUser.id,
      symbol: "MSFT",
      companyName: "Microsoft Corporation",
      shares: 5,
      purchasePrice: 280.75,
      purchaseDate: new Date("2023-02-10")
    });
    
    this.addPortfolioItem({
      userId: demoUser.id,
      symbol: "GOOGL",
      companyName: "Alphabet Inc.",
      shares: 3,
      purchasePrice: 2150.20,
      purchaseDate: new Date("2023-03-05")
    });
    
    // Add watchlist items
    this.addWatchlistItem({
      userId: demoUser.id,
      symbol: "TSLA",
      dateAdded: new Date()
    });
    
    this.addWatchlistItem({
      userId: demoUser.id,
      symbol: "AMZN",
      dateAdded: new Date()
    });
    
    // Set user preferences
    this.createUserPreferences({
      userId: demoUser.id,
      defaultTimeframe: "1W",
      theme: "light",
      favoriteIndicators: ["SMA", "EMA", "MACD"]
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Portfolio methods
  async getPortfolioItems(userId: number): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }

  async addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.portfolioIdCounter++;
    const portfolioItem: PortfolioItem = { ...item, id };
    this.portfolioItems.set(id, portfolioItem);
    return portfolioItem;
  }

  async updatePortfolioItem(id: number, item: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const existing = this.portfolioItems.get(id);
    if (!existing) return undefined;
    
    const updated: PortfolioItem = { ...existing, ...item };
    this.portfolioItems.set(id, updated);
    return updated;
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    return this.portfolioItems.delete(id);
  }

  // Watchlist methods
  async getWatchlistItems(userId: number): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getWatchlistItem(id: number): Promise<WatchlistItem | undefined> {
    return this.watchlistItems.get(id);
  }

  async getWatchlistItemBySymbol(userId: number, symbol: string): Promise<WatchlistItem | undefined> {
    return Array.from(this.watchlistItems.values()).find(
      (item) => item.userId === userId && item.symbol === symbol
    );
  }

  async addWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = this.watchlistIdCounter++;
    const watchlistItem: WatchlistItem = { ...item, id };
    this.watchlistItems.set(id, watchlistItem);
    return watchlistItem;
  }

  async deleteWatchlistItem(id: number): Promise<boolean> {
    return this.watchlistItems.delete(id);
  }

  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.preferencesIdCounter++;
    const userPrefs: UserPreferences = { ...preferences, id };
    this.userPreferences.set(id, userPrefs);
    return userPrefs;
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const existing = Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
    
    if (!existing) return undefined;
    
    const updated: UserPreferences = { ...existing, ...preferences };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
