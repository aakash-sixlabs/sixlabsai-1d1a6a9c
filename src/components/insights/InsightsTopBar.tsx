import { Search, Filter, Bell, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface InsightsTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFilterClick: () => void;
  userName?: string;
}

export const InsightsTopBar = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  userName,
}: InsightsTopBarProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer shrink-0"
        onClick={() => navigate("/")}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-lg text-foreground">
          CreativeGen
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1 ml-4">
        {["Insights", "Strategy", "Output"].map((label) => (
          <button
            key={label}
            onClick={() => navigate(`/${label.toLowerCase()}`)}
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ads, campaigns, creatives..."
            className="h-9 pl-9 text-sm bg-muted/30 border-border/50 rounded-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onFilterClick}>
          <Filter className="w-3.5 h-3.5" />
          Filters
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {userName ? userName[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
