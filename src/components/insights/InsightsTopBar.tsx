import { Search, Bell, Zap, RefreshCw, Check, AlertCircle, Settings as SettingsIcon } from "lucide-react";
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
  onResync?: () => void;
  syncStatus?: "idle" | "syncing" | "complete" | "error";
  syncStep?: string;
  canResync?: boolean;
}

export const InsightsTopBar = ({
  searchQuery,
  onSearchChange,
  userName,
  onResync,
  syncStatus = "idle",
  syncStep,
  canResync = true,
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
    <header className="h-14 bg-[hsl(222,47%,11%)] flex items-center px-6 gap-4 sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer shrink-0"
        onClick={() => navigate("/")}
      >
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-[15px] text-white tracking-tight">
          Six Labs
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="w-72">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search creatives..."
            className="h-9 pl-9 text-sm bg-white/10 border-0 rounded-lg text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Resync */}
        {onResync && canResync && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResync}
            disabled={syncStatus === "syncing"}
            className="h-8 px-2.5 rounded-lg gap-1.5 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
            title={syncStatus === "syncing" ? syncStep || "Syncing…" : "Resync this account"}
          >
            {syncStatus === "syncing" ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] font-medium max-w-[180px] truncate">
                  {syncStep || "Syncing…"}
                </span>
              </>
            ) : syncStatus === "complete" ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-[11px] font-medium">Synced</span>
              </>
            ) : syncStatus === "error" ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[11px] font-medium">Retry sync</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Resync</span>
              </>
            )}
          </Button>
        )}

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
          className="h-8 w-8 rounded-lg hover:bg-white/10"
          title="Settings"
        >
          <SettingsIcon className="w-[18px] h-[18px] text-white/70" />
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg relative hover:bg-white/10">
              <Bell className="w-[18px] h-[18px] text-white/70" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive ring-2 ring-[hsl(222,47%,11%)]" />
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

        <Avatar className="h-7 w-7 ml-1 ring-2 ring-white/20">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
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
