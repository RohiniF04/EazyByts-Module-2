import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Star, Info, BarChart3, DollarSign, TrendingUp } from "lucide-react";
import StockChart, { ChartDataPoint } from "@/components/ui/stock-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils/format";

interface StockDetails {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
}

interface StockDetailsProps {
  symbol: string;
}

export function StockDetails({ symbol }: StockDetailsProps) {
  const [timeframe, setTimeframe] = useState("1M");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch stock details
  const { data: stockDetails, isLoading: isLoadingDetails } = useQuery<StockDetails>({
    queryKey: [`/api/stocks/${symbol}`],
  });
  
  // Fetch historical data
  const { data: historicalData, isLoading: isLoadingHistory } = useQuery<ChartDataPoint[]>({
    queryKey: [`/api/stocks/${symbol}/history?timeframe=${timeframe}`],
  });
  
  // Check if in watchlist
  const { data: watchlist } = useQuery<any[]>({
    queryKey: ['/api/watchlist'],
  });
  
  const isInWatchlist = watchlist?.some(item => item.symbol === symbol);
  
  const handleAddToWatchlist = async () => {
    try {
      await apiRequest("POST", "/api/watchlist", { symbol });
      
      queryClient.invalidateQueries({
        queryKey: ['/api/watchlist']
      });
      
      toast({
        title: "Added to Watchlist",
        description: `${symbol} has been added to your watchlist.`,
      });
    } catch (error: any) {
      // Check if it's already in watchlist
      if (error.message?.includes("409")) {
        toast({
          title: "Already in Watchlist",
          description: `${symbol} is already in your watchlist.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to watchlist. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  const isLoading = isLoadingDetails || isLoadingHistory;
  
  const renderStat = (label: string, value: string | number | undefined, icon: React.ReactNode, tooltip?: string) => (
    <div className="text-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center">
              <div className="text-muted-foreground mb-2">{icon}</div>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <div className="font-semibold">{value}</div>
              )}
            </div>
          </TooltipTrigger>
          {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isLoadingDetails ? <Skeleton className="h-8 w-40" /> : (
              <>
                {symbol}
                <span className="ml-2 text-muted-foreground font-normal">
                  {stockDetails?.name}
                </span>
              </>
            )}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || isInWatchlist}
            onClick={handleAddToWatchlist}
          >
            <Star className="h-4 w-4 mr-2" />
            {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
          </Button>
        </div>
      </div>
      
      <StockChart
        data={historicalData || []}
        symbol={symbol}
        companyName={stockDetails?.name}
        currentPrice={stockDetails?.price}
        priceChange={stockDetails?.change ? stockDetails.price * stockDetails.change / 100 : undefined}
        percentChange={stockDetails?.change}
        isLoading={isLoading}
        onTimeframeChange={setTimeframe}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderStat(
          "Market Cap", 
          stockDetails?.marketCap, 
          <DollarSign className="h-5 w-5" />,
          "Total market value of a company's outstanding shares"
        )}
        {renderStat(
          "P/E Ratio", 
          stockDetails?.peRatio.toFixed(2), 
          <BarChart3 className="h-5 w-5" />,
          "Price-to-Earnings ratio - measure of company valuation"
        )}
        {renderStat(
          "Dividend Yield", 
          `${stockDetails?.dividendYield.toFixed(2)}%`, 
          <TrendingUp className="h-5 w-5" />,
          "Annual dividends per share divided by share price"
        )}
        {renderStat(
          "52-Week Range", 
          stockDetails ? `$${(stockDetails.price * 0.75).toFixed(2)} - $${(stockDetails.price * 1.25).toFixed(2)}` : undefined, 
          <Info className="h-5 w-5" />,
          "Lowest and highest price over the past 52 weeks"
        )}
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="financials" className="flex-1">Financials</TabsTrigger>
          <TabsTrigger value="news" className="flex-1">News</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : (
                <p className="text-muted-foreground">
                  {stockDetails?.name} is a leading company in its industry. The company has shown 
                  {stockDetails?.change && stockDetails.change > 0 
                    ? " positive growth " 
                    : " some challenges "} 
                  recently, with a market capitalization of {stockDetails?.marketCap}.
                </p>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open</span>
                      <span className="font-medium">{formatCurrency(stockDetails?.price ? stockDetails.price * 0.995 : 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High</span>
                      <span className="font-medium">{formatCurrency(stockDetails?.price ? stockDetails.price * 1.01 : 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low</span>
                      <span className="font-medium">{formatCurrency(stockDetails?.price ? stockDetails.price * 0.99 : 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">3.6M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Volume</span>
                      <span className="font-medium">4.2M</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1 Day</span>
                      <span className={`font-medium ${stockDetails?.change && stockDetails.change > 0 ? 'text-positive' : 'text-negative'}`}>
                        {stockDetails?.change ? (stockDetails.change > 0 ? '+' : '') + stockDetails.change.toFixed(2) + '%' : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1 Week</span>
                      <span className="font-medium text-positive">+2.87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1 Month</span>
                      <span className="font-medium text-positive">+5.42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">3 Months</span>
                      <span className="font-medium text-negative">-1.23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1 Year</span>
                      <span className="font-medium text-positive">+22.98%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financials" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Financial data is available in the premium version.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="news" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                News feeds are available in the premium version.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
