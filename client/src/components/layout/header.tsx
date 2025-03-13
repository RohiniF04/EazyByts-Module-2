import React from "react";
import { BellIcon } from "lucide-react";
import { StockSearch } from "@/components/stock-search";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { useUserPreferences } from "@/context/user-preferences";

export function Header() {
  const { theme, setTheme } = useUserPreferences();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sidebar />
      
      <div className="flex-1 flex justify-between items-center">
        <div className="hidden md:block text-xl font-bold">
          FinVest
        </div>
          
        <div className="ml-auto flex items-center gap-4">
          <StockSearch />
          
          <Button variant="ghost" size="icon">
            <BellIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
