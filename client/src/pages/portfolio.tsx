import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PortfolioItem } from "@/components/portfolio-item";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils/format";

// Form schema
const portfolioItemSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  companyName: z.string().min(1, "Company name is required"),
  shares: z.coerce.number().min(0.01, "Shares must be greater than 0"),
  purchasePrice: z.coerce.number().min(0.01, "Purchase price must be greater than 0"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
});

type PortfolioItemFormValues = z.infer<typeof portfolioItemSchema>;

export default function PortfolioPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get portfolio data
  const { data: portfolioItems, isLoading } = useQuery<any[]>({
    queryKey: ['/api/portfolio'],
  });
  
  const form = useForm<PortfolioItemFormValues>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      symbol: "",
      companyName: "",
      shares: undefined,
      purchasePrice: undefined,
      purchaseDate: new Date().toISOString().split('T')[0],
    },
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
  
  const handleEdit = async (id: number) => {
    // Find the item to edit
    const item = portfolioItems?.find(item => item.id === id);
    if (!item) return;
    
    // Format the date as YYYY-MM-DD
    const date = new Date(item.purchaseDate);
    const formattedDate = date.toISOString().split('T')[0];
    
    // Reset form and set values
    form.reset({
      symbol: item.symbol,
      companyName: item.companyName,
      shares: item.shares,
      purchasePrice: item.purchasePrice,
      purchaseDate: formattedDate,
    });
    
    setEditId(id);
    setDialogOpen(true);
  };
  
  const onSubmit = async (data: PortfolioItemFormValues) => {
    try {
      if (editId !== null) {
        // Update existing item
        await apiRequest("PUT", `/api/portfolio/${editId}`, data);
        toast({
          title: "Position Updated",
          description: `${data.symbol} has been updated in your portfolio.`,
        });
      } else {
        // Add new item
        await apiRequest("POST", "/api/portfolio", data);
        toast({
          title: "Position Added",
          description: `${data.symbol} has been added to your portfolio.`,
        });
      }
      
      // Reset form and close dialog
      form.reset();
      setDialogOpen(false);
      setEditId(null);
      
      // Refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/portfolio']
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save position. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              form.reset();
              setEditId(null);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editId !== null ? "Edit Position" : "Add New Position"}</DialogTitle>
              <DialogDescription>
                {editId !== null 
                  ? "Update your stock position details."
                  : "Enter details for your new stock position."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AAPL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Apple Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shares</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            placeholder="10"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            placeholder="150.00"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">{editId !== null ? "Update" : "Add"} Position</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className={`text-2xl font-bold ${portfolioProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                {portfolioProfit >= 0 ? '+' : ''}{formatCurrency(portfolioProfit)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className={`text-2xl font-bold ${portfolioPerformance >= 0 ? 'text-positive' : 'text-negative'}`}>
                {portfolioPerformance >= 0 ? '+' : ''}{portfolioPerformance.toFixed(2)}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="gainers">Gainers</TabsTrigger>
          <TabsTrigger value="losers">Losers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : portfolioItems && portfolioItems.length > 0 ? (
            <div className="space-y-4">
              {portfolioItems.map((item) => (
                <PortfolioItem
                  key={item.id}
                  id={item.id}
                  symbol={item.symbol}
                  companyName={item.companyName}
                  shares={item.shares}
                  purchasePrice={item.purchasePrice}
                  purchaseDate={new Date(item.purchaseDate)}
                  currentPrice={item.currentPrice}
                  totalValue={item.totalValue}
                  profit={item.profit}
                  percentChange={item.percentChange}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">You don't have any stocks in your portfolio yet.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Position
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="gainers" className="pt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : portfolioItems && portfolioItems.filter(item => item.percentChange > 0).length > 0 ? (
            <div className="space-y-4">
              {portfolioItems
                .filter(item => item.percentChange > 0)
                .sort((a, b) => b.percentChange - a.percentChange)
                .map((item) => (
                  <PortfolioItem
                    key={item.id}
                    id={item.id}
                    symbol={item.symbol}
                    companyName={item.companyName}
                    shares={item.shares}
                    purchasePrice={item.purchasePrice}
                    purchaseDate={new Date(item.purchaseDate)}
                    currentPrice={item.currentPrice}
                    totalValue={item.totalValue}
                    profit={item.profit}
                    percentChange={item.percentChange}
                    onEdit={handleEdit}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No gainers in your portfolio.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="losers" className="pt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : portfolioItems && portfolioItems.filter(item => item.percentChange < 0).length > 0 ? (
            <div className="space-y-4">
              {portfolioItems
                .filter(item => item.percentChange < 0)
                .sort((a, b) => a.percentChange - b.percentChange)
                .map((item) => (
                  <PortfolioItem
                    key={item.id}
                    id={item.id}
                    symbol={item.symbol}
                    companyName={item.companyName}
                    shares={item.shares}
                    purchasePrice={item.purchasePrice}
                    purchaseDate={new Date(item.purchaseDate)}
                    currentPrice={item.currentPrice}
                    totalValue={item.totalValue}
                    profit={item.profit}
                    percentChange={item.percentChange}
                    onEdit={handleEdit}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No losers in your portfolio.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
