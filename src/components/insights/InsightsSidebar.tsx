import { cn } from "@/lib/utils";
import {
  Home,
  FolderOpen,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  ChevronDown,
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
    <aside className="w-52 border-r border-border bg-card flex flex-col h-full shrink-0">
      {/* Ad Account Switcher */}
      {adAccounts.length > 0 && (
        <div className="px-3 pt-4 pb-3">
          <Select value={selectedAccountId} onValueChange={onAccountChange}>
            <SelectTrigger className="h-9 text-xs bg-secondary/50 border-0 rounded-lg font-medium">
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
      <nav className="px-2 py-1 space-y-0.5 flex-1">
        {mainNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
              activeView === item.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.count != null && (
              <span className={cn(
                "text-[10px] font-medium tabular-nums",
                item.id === "needs-review"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};
