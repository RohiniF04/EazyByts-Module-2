import React, { useState } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export function StockSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: results, isLoading, error } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${searchQuery}`],
    enabled: !!searchQuery && searchQuery.length > 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 1) {
      setSearchQuery(searchTerm.trim());
    }
  };

  const handleSelectStock = (symbol: string) => {
    setOpen(false);
    setSearchTerm("");
    setSearchQuery("");
    navigate(`/stock/${symbol}`);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "/") {
      e.preventDefault();
      setOpen(true);
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div 
        className="flex w-full max-w-sm items-center space-x-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="relative w-full">
          <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            className="pl-9 pr-4 bg-muted cursor-pointer"
            placeholder="Search stocks... (Press '/')"
            readOnly
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Search Stocks</DialogTitle>
          <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
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
            {isLoading ? (
              <div className="p-4 text-center">Searching...</div>
            ) : error ? (
              <div className="p-4 text-center text-negative">Error searching stocks. Please try again.</div>
            ) : results && results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <div
                    key={result.symbol}
                    className="flex justify-between items-center p-3 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => handleSelectStock(result.symbol)}
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
    </>
  );
}
