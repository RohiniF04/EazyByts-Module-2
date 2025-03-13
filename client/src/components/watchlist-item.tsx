import React from "react";
import { useLocation } from "wouter";
import { Star, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";

interface WatchlistItemProps {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export function WatchlistItem({
  id,
  symbol,
  name,
  price,
  change,
}: WatchlistItemProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleClick = () => {
    navigate(`/stock/${symbol}`);
  };
  
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await apiRequest("DELETE", `/api/watchlist/${id}`);
      
      queryClient.invalidateQueries({
        queryKey: ['/api/watchlist']
      });
      
      toast({
        title: "Removed from Watchlist",
        description: `${symbol} has been removed from your watchlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      className="flex justify-between items-center p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center text-primary mr-3">
          {symbol.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{symbol}</div>
          <div className="text-xs text-muted-foreground">{name}</div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-right mr-4">
          <div className="font-medium">{formatCurrency(price)}</div>
          <div className={change >= 0 ? "text-positive text-xs" : "text-negative text-xs"}>
            {formatPercentage(change)}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
