import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";

interface PortfolioItemProps {
  id: number;
  symbol: string;
  companyName: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: Date;
  currentPrice: number;
  totalValue: number;
  profit: number;
  percentChange: number;
  onEdit: (id: number) => void;
}

export function PortfolioItem({
  id,
  symbol,
  companyName,
  shares,
  purchasePrice,
  purchaseDate,
  currentPrice,
  totalValue,
  profit,
  percentChange,
  onEdit
}: PortfolioItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/portfolio/${id}`);
      
      queryClient.invalidateQueries({
        queryKey: ['/api/portfolio']
      });
      
      toast({
        title: "Position Deleted",
        description: `${symbol} has been removed from your portfolio.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete position. Please try again.",
        variant: "destructive",
      });
    }
    
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="bg-card hover:bg-accent/10 rounded-lg p-4 transition-colors duration-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary mr-3">
              {symbol.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">{symbol}</h3>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Shares</p>
            <p className="font-medium">{shares}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="font-medium">{formatCurrency(currentPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="font-medium">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Return</p>
            <p className={`font-medium ${percentChange >= 0 ? "text-positive" : "text-negative"}`}>
              {formatCurrency(profit)} ({formatPercentage(percentChange)})
            </p>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {symbol} from your portfolio? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
