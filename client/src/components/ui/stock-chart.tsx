import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartDataPoint {
  date: string;
  value: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  symbol: string;
  companyName?: string;
  currentPrice?: number;
  priceChange?: number;
  percentChange?: number;
  isLoading?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

const timeframes = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
];

const StockChart: React.FC<StockChartProps> = ({
  data,
  symbol,
  companyName,
  currentPrice,
  priceChange,
  percentChange,
  isLoading = false,
  onTimeframeChange
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  
  const handleTimeframeChange = (timeframe: string) => {
    setActiveTimeframe(timeframe);
    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    }
  };
  
  // Determine start price for the reference line (first data point)
  const startPrice = data.length > 0 ? data[0].value : 0;
  
  // Determine if the price trend is positive
  const isPriceUp = data.length > 1 && data[data.length - 1].value >= data[0].value;
  
  // Format the tooltip date based on timeframe
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (activeTimeframe === "1D") {
      return format(date, "h:mm a");
    } else if (activeTimeframe === "1W" || activeTimeframe === "1M") {
      return format(date, "MMM d");
    } else {
      return format(date, "MMM d, yyyy");
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-medium">{formatTooltipDate(label)}</p>
          <p className="text-sm">
            <span className="font-medium">Price: </span>
            <span>${payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Calculate min and max prices for Y-axis domain with a buffer
  const prices = data.map(d => d.value);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">
            {isLoading ? <Skeleton className="h-6 w-32" /> : (
              <>
                {symbol}
                {companyName && <span className="ml-2 text-sm font-normal text-muted-foreground">({companyName})</span>}
              </>
            )}
          </CardTitle>
          
          {!isLoading && currentPrice !== undefined && (
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold mr-2">${currentPrice.toFixed(2)}</span>
              {percentChange !== undefined && (
                <span className={`text-sm ${percentChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {percentChange >= 0 ? '▲' : '▼'} ${Math.abs(priceChange || 0).toFixed(2)} ({Math.abs(percentChange).toFixed(2)}%)
                </span>
              )}
            </div>
          )}
          {isLoading && currentPrice === undefined && (
            <>
              <Skeleton className="h-8 w-24 mt-1" />
              <Skeleton className="h-4 w-32 mt-1" />
            </>
          )}
        </div>
        
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={activeTimeframe === tf.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange(tf.value)}
              className="text-xs px-2 py-1 h-7"
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPriceUp ? "#14B8A6" : "#EF4444"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPriceUp ? "#14B8A6" : "#EF4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  if (activeTimeframe === "1D") {
                    return format(date, "HH:mm");
                  } else if (activeTimeframe === "1W") {
                    return format(date, "EEE");
                  } else if (activeTimeframe === "1M") {
                    return format(date, "d");
                  } else {
                    return format(date, "MMM");
                  }
                }}
                minTickGap={20}
                fontSize={10}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(tick) => `$${tick.toFixed(0)}`}
                fontSize={10}
                tickCount={5}
              />
              <CartesianGrid vertical={false} strokeDasharray="2 2" opacity={0.2} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={startPrice} stroke="#94A3B8" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPriceUp ? "#0F766E" : "#DC2626"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;
