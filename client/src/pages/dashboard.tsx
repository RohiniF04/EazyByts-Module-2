import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketOverview } from "@/components/market-overview";
import { PortfolioItem } from "@/components/portfolio-item";
import { WatchlistItem } from "@/components/watchlist-item";
import StockChart, { ChartDataPoint } from "@/components/ui/stock-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";

export default function Dashboard() {
  const [activeStock, setActiveStock] = useState("AAPL");
  
  // Fetch portfolio data
  const { data: portfolioItems, isLoading: isLoadingPortfolio } = useQuery<any[]>({
    queryKey: ['/api/portfolio'],
  });
  
  // Fetch watchlist data
  const { data: watchlistItems, isLoading: isLoadingWatchlist } = useQuery<any[]>({
    queryKey: ['/api/watchlist'],
  });
  
  // Fetch historical data for the active stock
  const { data: historicalData, isLoading: isLoadingHistorical } = useQuery<ChartDataPoint[]>({
    queryKey: [`/api/stocks/${activeStock}/history?timeframe=1M`],
  });
  
  // Fetch stock details
  const { data: stockDetails, isLoading: isLoadingStockDetails } = useQuery<any>({
    queryKey: [`/api/stocks/${activeStock}`],
  });
  
  // Calculate portfolio value and performance
  const portfolioValue = portfolioItems?.reduce(
    (sum, item) => sum + item.totalValue, 0
  ) || 0;
  
  const portfolioCost = portfolioItems?.reduce(
    (sum, item) => sum + (item.purchasePrice * item.shares), 0
  ) || 0;
  
  const portfolioProfit = portfolioValue - portfolioCost;
  const portfolioPerformance = portfolioCost > 0 
    ? (portfolioProfit / portfolioCost) * 100 
    : 0;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button>Refresh Data</Button>
      </div>
      
      <MarketOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>
                Your investment portfolio summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                  {isLoadingPortfolio ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    <p className="text-3xl font-bold">{formatCurrency(portfolioValue)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Profit/Loss</p>
                  {isLoadingPortfolio ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    <p className={`text-2xl font-bold ${portfolioProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {portfolioProfit >= 0 ? '+' : ''}{formatCurrency(portfolioProfit)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Performance</p>
                  {isLoadingPortfolio ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    <p className={`text-2xl font-bold ${portfolioPerformance >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {portfolioPerformance >= 0 ? '+' : ''}{portfolioPerformance.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
              
              <StockChart
                data={historicalData || []}
                symbol={activeStock}
                companyName={stockDetails?.name}
                currentPrice={stockDetails?.price}
                priceChange={stockDetails?.change ? stockDetails.price * stockDetails.change / 100 : undefined}
                percentChange={stockDetails?.change}
                isLoading={isLoadingHistorical || isLoadingStockDetails}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Tabs defaultValue="portfolio" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="flex-1 pt-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Holdings</CardTitle>
                    <Link href="/portfolio">
                      <Button variant="ghost" size="sm" className="text-primary">
                        <span>View All</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {isLoadingPortfolio ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="mb-4">
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </div>
                    ))
                  ) : portfolioItems && portfolioItems.length > 0 ? (
                    <div className="space-y-4">
                      {portfolioItems.slice(0, 3).map((item) => (
                        <div 
                          key={item.id} 
                          className="cursor-pointer"
                          onClick={() => setActiveStock(item.symbol)}
                        >
                          <div className={`p-3 rounded-lg transition-colors ${activeStock === item.symbol ? 'bg-accent' : 'hover:bg-muted'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">{item.symbol}</div>
                              <div className={`text-sm ${item.percentChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                                {item.percentChange >= 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.shares} shares</span>
                              <span>{formatCurrency(item.totalValue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Link href="/portfolio">
                        <Button className="w-full">Manage Portfolio</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You don't have any stocks in your portfolio yet.</p>
                      <Link href="/portfolio">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Stocks
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="watchlist" className="flex-1 pt-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Watchlist</CardTitle>
                    <Link href="/watchlist">
                      <Button variant="ghost" size="sm" className="text-primary">
                        <span>View All</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {isLoadingWatchlist ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="mb-4">
                        <Skeleton className="h-16 w-full rounded-lg" />
                      </div>
                    ))
                  ) : watchlistItems && watchlistItems.length > 0 ? (
                    <div className="space-y-4">
                      {watchlistItems.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="cursor-pointer"
                          onClick={() => setActiveStock(item.symbol)}
                        >
                          <div className={`p-3 rounded-lg transition-colors ${activeStock === item.symbol ? 'bg-accent' : 'hover:bg-muted'}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{item.symbol}</div>
                                <div className="text-xs text-muted-foreground">{item.name}</div>
                              </div>
                              <div>
                                <div className="text-right">{formatCurrency(item.price)}</div>
                                <div className={`text-xs text-right ${item.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Link href="/watchlist">
                        <Button className="w-full">Manage Watchlist</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You don't have any stocks in your watchlist yet.</p>
                      <Link href="/watchlist">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Stocks
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
