import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, FileText, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AdAccountProfileDialogProps {
  open: boolean;
  accountId: string;
  accountName: string;
  metaAccountId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface Page {
  id: string;
  name: string;
  category: string;
}

const INDUSTRIES = [
  "E-commerce / Retail",
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Health & Wellness",
  "Food & Beverage",
  "Home & Garden",
  "Technology / SaaS",
  "Education",
  "Finance & Insurance",
  "Travel & Hospitality",
  "Entertainment & Media",
  "Automotive",
  "Real Estate",
  "Non-Profit",
  "Other",
];

export const AdAccountProfileDialog = ({
  open,
  accountId,
  accountName,
  metaAccountId,
  onComplete,
  onCancel,
}: AdAccountProfileDialogProps) => {
  const [industry, setIndustry] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [selectedPageName, setSelectedPageName] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Load pages from sessionStorage
    const stored = sessionStorage.getItem("meta_connection");
    if (stored) {
      const data = JSON.parse(stored);
      const metaPages = (data.pages || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category || "",
      }));
      setPages(metaPages);

      // Auto-select first page and use its category as industry hint
      if (metaPages.length > 0) {
        setSelectedPageId(metaPages[0].id);
        setSelectedPageName(metaPages[0].name);
        // Try to match category to an industry
        const cat = metaPages[0].category?.toLowerCase() || "";
        const match = INDUSTRIES.find((ind) => cat.includes(ind.toLowerCase().split(" ")[0].toLowerCase()));
        if (match) setIndustry(match);
      }
    }
  }, [open]);

  const handlePageChange = (pageId: string) => {
    setSelectedPageId(pageId);
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      setSelectedPageName(page.name);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ad_account_profiles")
        .upsert({
          ad_account_id: accountId,
          user_id: user.id,
          industry: industry || null,
          facebook_page_id: selectedPageId || null,
          facebook_page_name: selectedPageName || null,
          confirmed: true,
        }, { onConflict: "ad_account_id,user_id" });

      if (error) throw error;

      toast.success("Account profile confirmed!");
      onComplete();
    } catch (err: any) {
      console.error("Ad account profile save error:", err);
      toast.error(err.message || "Failed to save account profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            Set Up Account Profile
          </DialogTitle>
          <DialogDescription>
            Verify the details for <span className="font-medium text-foreground">{accountName}</span> so we can tailor your insights.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 pt-2"
        >
          {/* Account ID (read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Account ID
            </Label>
            <div className="flex items-center gap-2">
              <Input value={metaAccountId} readOnly className="bg-muted" />
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Facebook Page */}
          {pages.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Facebook Page
              </Label>
              <Select value={selectedPageId} onValueChange={handlePageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.name} {page.category ? `(${page.category})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {pages.length === 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Facebook Page ID (optional)
              </Label>
              <Input
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                placeholder="Enter page ID"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Back
            </Button>
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {saving ? "Saving…" : "Confirm & Start Sync"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
