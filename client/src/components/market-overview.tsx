import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid } from "lucide-react";
import { DataCard } from "@/components/ui/data-card";
import { formatCurrency } from "@/lib/utils/format";

interface MarketIndex {
  value: number;
  change: number;
  changeAmount: number;
}

interface MarketIndices {
  "S&P 500": MarketIndex;
  "NASDAQ": MarketIndex;
  "DOW JONES": MarketIndex;
  "10-YR TREASURY": MarketIndex;
}

export function MarketOverview() {
  const { data: marketIndices, isLoading } = useQuery<MarketIndices>({
    queryKey: ['/api/market/overview'],
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DataCard
        title="S&P 500"
        value={isLoading ? "—" : formatCurrency(marketIndices?.["S&P 500"].value || 0, false)}
        change={isLoading ? undefined : marketIndices?.["S&P 500"].change}
        description={isLoading ? undefined : `${(marketIndices?.["S&P 500"].changeAmount || 0) > 0 ? "+" : ""}${marketIndices?.["S&P 500"].changeAmount.toFixed(2)}`}
        isLoading={isLoading}
      />
      
      <DataCard
        title="NASDAQ"
        value={isLoading ? "—" : formatCurrency(marketIndices?.["NASDAQ"].value || 0, false)}
        change={isLoading ? undefined : marketIndices?.["NASDAQ"].change}
        description={isLoading ? undefined : `${(marketIndices?.["NASDAQ"].changeAmount || 0) > 0 ? "+" : ""}${marketIndices?.["NASDAQ"].changeAmount.toFixed(2)}`}
        isLoading={isLoading}
      />
      
      <DataCard
        title="DOW JONES"
        value={isLoading ? "—" : formatCurrency(marketIndices?.["DOW JONES"].value || 0, false)}
        change={isLoading ? undefined : marketIndices?.["DOW JONES"].change}
        description={isLoading ? undefined : `${(marketIndices?.["DOW JONES"].changeAmount || 0) > 0 ? "+" : ""}${marketIndices?.["DOW JONES"].changeAmount.toFixed(2)}`}
        isLoading={isLoading}
      />
      
      <DataCard
        title="10-YR TREASURY"
        value={isLoading ? "—" : `${marketIndices?.["10-YR TREASURY"].value.toFixed(2)}%`}
        change={isLoading ? undefined : marketIndices?.["10-YR TREASURY"].change}
        isLoading={isLoading}
      />
    </div>
  );
}
