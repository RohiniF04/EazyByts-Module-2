import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WatchlistItem } from "@/components/watchlist-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WatchlistPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get watchlist data
  const { data: watchlistItems, isLoading } = useQuery<any[]>({
    queryKey: ['/api/watchlist'],
  });
  
  // Search for stocks
  const { data: searchResults, isLoading: isSearching } = useQuery<any[]>({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }
      return response.json();
    },
    enabled: !!searchQuery && searchQuery.length > 1,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 1) {
      setSearchQuery(searchTerm.trim());
    }
  };
  
  const handleAddToWatchlist = async (symbol: string) => {
    try {
      await apiRequest("POST", "/api/watchlist", { symbol });
      
      queryClient.invalidateQueries({
        queryKey: ['/api/watchlist']
      });
      
      toast({
        title: "Added to Watchlist",
        description: `${symbol} has been added to your watchlist.`,
      });
      
      setDialogOpen(false);
      setSearchTerm("");
      setSearchQuery("");
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
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            queryClient.invalidateQueries({
              queryKey: ['/api/watchlist']
            });
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add to Watchlist</DialogTitle>
                <DialogDescription>
                  Search for stocks to add to your watchlist.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-4"
                    placeholder="Enter symbol or company name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
              
              <div className="max-h-72 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">Searching...</div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.symbol}
                        className="flex justify-between items-center p-3 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => handleAddToWatchlist(result.symbol)}
                      >
                        <div>
                          <div className="font-medium">{result.symbol}</div>
                          <div className="text-sm text-muted-foreground">{result.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${result.price.toFixed(2)}</div>
                          <div className={result.change >= 0 ? "text-positive text-xs" : "text-negative text-xs"}>
                            {result.change >= 0 ? "+" : ""}{result.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="p-4 text-center">No results found for "{searchQuery}"</div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Type a symbol or company name to search
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
          <CardDescription>
            Track your favorite stocks and market opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : watchlistItems && watchlistItems.length > 0 ? (
            <div className="space-y-2">
              {watchlistItems.map((item) => (
                <WatchlistItem
                  key={item.id}
                  id={item.id}
                  symbol={item.symbol}
                  name={item.name}
                  price={item.price}
                  change={item.change}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">You don't have any stocks in your watchlist yet.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Stock
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
