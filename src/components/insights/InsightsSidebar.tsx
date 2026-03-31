import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Compass,
  FolderOpen,
  Bookmark,
  TrendingUp,
  Flame,
  Search,
  ChevronRight,
  ChevronDown,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  { label: "Discover", icon: <Compass className="w-4 h-4" />, id: "discover" },
  { label: "Top Performers", icon: <TrendingUp className="w-4 h-4" />, id: "top" },
  { label: "Ad Library", icon: <FolderOpen className="w-4 h-4" />, id: "library" },
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
  campaignBoards,
  adAccounts = [],
  selectedAccountId,
  onAccountChange,
}: InsightsSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBoards = campaignBoards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {item.label}
          </button>
        ))}
      </div>

      {/* Saved views */}
      <div className="px-3 mt-2">
        <button
          onClick={() => onViewChange("saved")}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            activeView === "saved"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Bookmark className="w-4 h-4" />
          Saved Ads
        </button>
        <button
          onClick={() => onViewChange("fatigue")}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            activeView === "fatigue"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Flame className="w-4 h-4" />
          Creative Fatigue
        </button>
      </div>

      {/* Campaigns / Boards */}
      <div className="mt-4 flex-1 overflow-auto">
        <div className="px-5 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Campaigns
          </span>
        </div>
        <div className="space-y-0.5 px-3">
          {filteredBoards.map((board) => (
            <button
              key={board.id}
              onClick={() => onViewChange(`campaign-${board.id}`)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors group",
                activeView === `campaign-${board.id}`
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              <span className="truncate flex-1 text-left">{board.name}</span>
              <span className="text-[10px] font-medium opacity-60">{board.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search boards */}
      <div className="p-3 border-t border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>
    </aside>
  );
};
