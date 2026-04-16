import { Home, FolderOpen, TrendingUp, Lightbulb, AlertCircle, Search, Bell, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * A placeholder / skeleton dashboard that mirrors the /home (Insights) layout
 * and is always visible behind the onboarding overlay modals.
 */
export const DashboardBackground = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Dark top bar — matches InsightsTopBar */}
      <header className="h-14 bg-[hsl(222,47%,11%)] flex items-center px-6 gap-4 shrink-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-[15px] text-white tracking-tight">
            Six Labs
          </span>
        </div>
        <div className="flex-1" />
        <div className="w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <div className="h-9 pl-9 text-sm bg-white/10 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center">
            <Bell className="w-[18px] h-[18px] text-white/70" />
          </div>
          <Avatar className="h-7 w-7 ml-1 ring-2 ring-white/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — matches InsightsSidebar */}
        <aside className="hidden lg:flex w-56 flex-col border-r border-border/60 bg-background shrink-0">
          <div className="px-4 pt-5 pb-4">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <nav className="px-3 py-1 space-y-1 flex-1">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: TrendingUp, label: "Top Performers" },
              { icon: Lightbulb, label: "Opportunities" },
              { icon: FolderOpen, label: "Ad Library" },
              { icon: AlertCircle, label: "Needs Review" },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content area — skeleton */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          {/* Summary cards row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-6 w-28 rounded" />
                <Skeleton className="h-2 w-16 rounded" />
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>
            <div className="h-48 flex items-end gap-2 px-4">
              {[40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-muted/60"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Table area */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-32 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-3 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded ml-auto" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};