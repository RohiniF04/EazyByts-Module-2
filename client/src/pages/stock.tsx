import React from "react";
import { useParams } from "wouter";
import { StockDetails } from "@/components/stock-details";

export default function StockPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = params.symbol?.toUpperCase() || "";
  
  if (!symbol) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Stock Not Found</h1>
        <p>Please enter a valid stock symbol.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <StockDetails symbol={symbol} />
    </div>
  );
}
