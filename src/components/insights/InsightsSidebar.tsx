import { cn } from "@/lib/utils";
import {
  Home,
  FolderOpen,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  History,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavItemMeta {
  label: string;
  icon: React.ReactNode;
  id: string;
  count?: number;
  description?: string;
  badge?: string;
}

const mainNav: NavItemMeta[] = [
  { label: "Home", icon: <Home className="w-[18px] h-[18px]" />, id: "discover" },
  { label: "Top Performers", icon: <TrendingUp className="w-[18px] h-[18px]" />, id: "top" },
  { label: "Opportunities", icon: <Lightbulb className="w-[18px] h-[18px]" />, id: "opportunities", badge: "Soon" },
  { label: "Ad Library", icon: <FolderOpen className="w-[18px] h-[18px]" />, id: "library" },
  { label: "My Generations", icon: <History className="w-[18px] h-[18px]" />, id: "generations" },
  { label: "Needs Review", icon: <AlertCircle className="w-[18px] h-[18px]" />, id: "needs-review", badge: "Soon" },
];

const DISABLED_IDS = new Set(["opportunities", "needs-review"]);

interface AdAccount {
  id: string;
  account_id: string;
  account_name: string;
}

export interface SidebarKpi {
  label: string;
  value: string;
  hint?: string;
}

interface InsightsSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  campaignBoards: { id: string; name: string; count: number }[];
  adAccounts?: AdAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
  kpis?: SidebarKpi[];
}

export const InsightsSidebar = ({
  activeView,
  onViewChange,
  adAccounts = [],
  selectedAccountId,
  onAccountChange,
  kpis,
}: InsightsSidebarProps) => {
  return (
    <aside className="w-56 border-r border-border/60 bg-background flex flex-col h-full shrink-0">
      {/* Ad Account Switcher */}
      {adAccounts.length > 0 && (
        <div className="px-4 pt-5 pb-4">
          <Select value={selectedAccountId} onValueChange={onAccountChange}>
            <SelectTrigger className="h-10 text-xs bg-background border border-border/60 rounded-xl font-medium shadow-sm hover:shadow transition-shadow">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {adAccounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id} className="text-xs">
                  {acc.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main nav */}
      <nav className="px-3 py-1 space-y-1 flex-1">
        {mainNav.map((item) => {
          const disabled = DISABLED_IDS.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => !disabled && onViewChange(item.id)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                disabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : activeView === item.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <span className={cn(
                "transition-colors",
                disabled
                  ? "text-muted-foreground/50"
                  : activeView === item.id ? "text-primary" : "text-muted-foreground"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-muted text-muted-foreground/70">
                  {item.badge}
                </span>
              )}
              {item.count != null && !item.badge && (
                <span className={cn(
                  "text-[10px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                  item.id === "needs-review"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent/10 text-accent"
                )}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Performance KPI tiles */}
      {kpis && kpis.length > 0 && (
        <div className="px-3 pb-4 pt-2 border-t border-border/60 space-y-2">
          <p className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1">
            Performance
          </p>
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors px-3 py-2.5"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {k.label}
              </p>
              <p className="text-base font-bold text-foreground tracking-tight tabular-nums leading-tight mt-0.5">
                {k.value}
              </p>
              {k.hint && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{k.hint}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
