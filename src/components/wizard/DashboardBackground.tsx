import { Zap, BarChart3, Image, TrendingUp, Layers, FileText, Settings, Search, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A placeholder / skeleton dashboard that's always visible
 * behind the onboarding overlay modals.
 */
export const DashboardBackground = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r bg-card/50">
        <div className="flex items-center gap-2 px-5 h-14 border-b">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">CreativeGen</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: BarChart3, label: "Dashboard", active: true },
            { icon: Image, label: "Creatives" },
            { icon: TrendingUp, label: "Insights" },
            { icon: Layers, label: "Campaigns" },
            { icon: FileText, label: "Reports" },
            { icon: Settings, label: "Settings" },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b bg-card/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </header>

        {/* Dashboard skeleton content */}
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
