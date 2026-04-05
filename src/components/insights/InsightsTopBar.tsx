import { Search, Bell, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "sync" | "insight" | "alert" | "tip";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "Sync complete", description: "Glow Skin Co. Ads — 42 creatives updated", time: "2m ago", read: false, type: "sync" },
  { id: "2", title: "New top performer", description: "\"Summer-Collection-Hero\" hit 4.8x ROAS", time: "1h ago", read: false, type: "insight" },
  { id: "3", title: "Creative needs review", description: "\"Flash-Sale-Countdown\" CTR dropped 40%", time: "3h ago", read: false, type: "alert" },
  { id: "4", title: "Opportunity detected", description: "Static single format outperforming carousel by 2x", time: "5h ago", read: true, type: "tip" },
];

interface InsightsTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFilterClick: () => void;
  userName?: string;
}

export const InsightsTopBar = ({
  searchQuery,
  onSearchChange,
  userName,
}: InsightsTopBarProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "sync": return "🔄";
      case "insight": return "🏆";
      case "alert": return "⚠️";
      case "tip": return "💡";
    }
  };

  return (
    <header className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer shrink-0"
        onClick={() => navigate("/")}
      >
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-[17px] text-foreground tracking-tight">
          CreativeGen
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="w-80">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search creatives, concepts, or formats..."
            className="h-10 pl-10 text-sm bg-background border border-border/60 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative hover:bg-secondary">
              <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-xl shadow-lg border-border/60" align="end">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3.5 border-b border-border/30 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{n.title}</span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.description}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Avatar className="h-8 w-8 ml-1 ring-2 ring-border/40">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {userName ? userName[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
