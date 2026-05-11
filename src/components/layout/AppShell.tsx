import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { InsightsSidebar } from "@/components/insights/InsightsSidebar";
import { Logo } from "@/components/Logo";

interface AppShellProps {
  children: ReactNode;
  /** Show the sidebar (default: false) */
  showSidebar?: boolean;
  /** Right-side header content (e.g. progress indicator) */
  headerRight?: ReactNode;
  /** Left-side header content override. Defaults to logo. */
  headerLeft?: ReactNode;
  /** Sidebar props when showSidebar is true */
  sidebarProps?: {
    activeView: string;
    onViewChange: (v: string) => void;
    campaignBoards?: { id: string; name: string; count: number }[];
    adAccounts?: { id: string; account_id: string; account_name: string }[];
    selectedAccountId?: string;
    onAccountChange?: (id: string) => void;
  };
}

export const AppShell = ({
  children,
  showSidebar = false,
  headerRight,
  headerLeft,
  sidebarProps,
}: AppShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[hsl(222,47%,11%)]">
      {/* Dark top bar */}
      <header className="h-14 bg-[hsl(222,47%,11%)] flex items-center px-6 gap-4 shrink-0 z-50">
        {headerLeft ?? (
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => navigate("/home")}
          >
            <Logo variant="light" heightClass="h-12" />
          </div>
        )}
        <div className="flex-1" />
        {headerRight}
      </header>

      {/* Content area as a card */}
      <div className="flex flex-1 overflow-hidden bg-card rounded-t-2xl">
        {showSidebar && sidebarProps && (
          <InsightsSidebar
            activeView={sidebarProps.activeView}
            onViewChange={sidebarProps.onViewChange}
            campaignBoards={sidebarProps.campaignBoards ?? []}
            adAccounts={sidebarProps.adAccounts}
            selectedAccountId={sidebarProps.selectedAccountId}
            onAccountChange={sidebarProps.onAccountChange}
          />
        )}
        <main className={`flex-1 overflow-auto ${showSidebar ? "border-l border-border/60" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
