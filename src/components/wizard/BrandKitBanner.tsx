import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdAccountProfileDialog } from "./AdAccountProfileDialog";

/**
 * Soft banner shown on /home when the active ad account doesn't have a brand
 * kit yet. Clicking opens the AdAccountProfileDialog where the user can build
 * one. Auto-hides if no default account, or if the kit is already ready.
 */
export const BrandKitBanner = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<{
    id: string;
    name: string;
    metaId: string;
  } | null>(null);

  const refresh = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("default_ad_account_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.default_ad_account_id) return;

    const { data: acct } = await supabase
      .from("ad_accounts")
      .select("id, account_id, account_name")
      .eq("id", profile.default_ad_account_id)
      .maybeSingle();
    if (!acct) return;

    const { data: aap } = await supabase
      .from("ad_account_profiles")
      .select("brand_kit_status")
      .eq("ad_account_id", acct.id)
      .maybeSingle();

    setAccount({ id: acct.id, name: acct.account_name, metaId: acct.account_id });
    setShow(!aap || aap.brand_kit_status !== "ready");
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!show || dismissed || !account) return null;

  return (
    <>
      <div className="mx-4 sm:mx-6 mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Add your brand kit to improve generations
          </p>
          <p className="text-xs text-muted-foreground">
            Logo, colors, and tone help every creative stay on-brand for {account.name}.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          Set up
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <AdAccountProfileDialog
          open
          accountId={account.id}
          accountName={account.name}
          metaAccountId={account.metaId}
          onComplete={() => {
            setOpen(false);
            refresh();
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
};
