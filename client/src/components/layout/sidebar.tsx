import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart2,
  Star,
  Newspaper,
  Settings,
  Search,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      href: "/",
    },
    {
      title: "Portfolio",
      icon: <BarChart2 className="mr-2 h-4 w-4" />,
      href: "/portfolio",
    },
    {
      title: "Watchlist",
      icon: <Star className="mr-2 h-4 w-4" />,
      href: "/watchlist",
    },
    {
      title: "Explore",
      icon: <Search className="mr-2 h-4 w-4" />,
      href: "/explore",
    },
    {
      title: "News",
      icon: <Newspaper className="mr-2 h-4 w-4" />,
      href: "/news",
    },
    {
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      href: "/settings",
    },
  ];
  
  const NavContent = () => (
    <>
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          FinVest
        </h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location === item.href && "bg-muted font-medium"
                )}
              >
                {item.icon}
                {item.title}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Premium Plan</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <div className="flex h-full flex-col">
            <ScrollArea className="flex-1">
              <NavContent />
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className={cn("hidden md:flex h-screen border-r flex-col", className)}>
      <ScrollArea className="flex-1">
        <NavContent />
      </ScrollArea>
    </div>
  );
}
