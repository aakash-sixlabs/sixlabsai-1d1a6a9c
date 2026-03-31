import { cn } from "@/lib/utils";
import {
  Home,
  FolderOpen,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  id: string;
  count?: number;
}

const mainNav: SidebarItem[] = [
  { label: "Home", icon: <Home className="w-4 h-4" />, id: "discover" },
  { label: "Top Performers", icon: <TrendingUp className="w-4 h-4" />, id: "top" },
  { label: "Opportunities", icon: <Lightbulb className="w-4 h-4" />, id: "opportunities", count: 4 },
  { label: "Ad Library", icon: <FolderOpen className="w-4 h-4" />, id: "library" },
  { label: "Needs Review", icon: <AlertCircle className="w-4 h-4" />, id: "needs-review", count: 3 },
];

interface AdAccount {
  id: string;
  account_id: string;
  account_name: string;
}

interface InsightsSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  campaignBoards: { id: string; name: string; count: number }[];
  adAccounts?: AdAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
}

export const InsightsSidebar = ({
  activeView,
  onViewChange,
  adAccounts = [],
  selectedAccountId,
  onAccountChange,
}: InsightsSidebarProps) => {
  return (
    <aside className="w-56 border-r border-border bg-card/50 flex flex-col h-full shrink-0">
      {/* Ad Account Switcher */}
      {adAccounts.length > 0 && (
        <div className="p-3 border-b border-border">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Ad Account
          </label>
          <Select value={selectedAccountId} onValueChange={onAccountChange}>
            <SelectTrigger className="h-9 text-xs bg-background">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Select account" />
              </div>
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
      <div className="p-3 space-y-0.5">
        {mainNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.count != null && (
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                item.id === "needs-review"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};
