import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, Download, Loader2, Replace } from "lucide-react";
import { toast } from "sonner";

interface Props {
  adAccountId: string;
}

interface Row {
  id: string;
  brand_guidelines_path: string | null;
  brand_guidelines_filename: string | null;
  brand_guidelines_uploaded_at: string | null;
}

export const BrandGuidelinesSection = ({ adAccountId }: Props) => {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ad_account_profiles")
      .select("id, brand_guidelines_path, brand_guidelines_filename, brand_guidelines_uploaded_at")
      .eq("ad_account_id", adAccountId)
      .maybeSingle();
    setRow(data);
    setLoading(false);
  };

  useEffect(() => {
    if (adAccountId) load();
  }, [adAccountId]);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large. Max 20MB.");
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${adAccountId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("brand-guidelines")
        .upload(path, file, { contentType: file.type || "application/pdf", upsert: false });
      if (upErr) throw upErr;

      const { error: updateErr } = row
        ? await supabase
            .from("ad_account_profiles")
            .update({
              brand_guidelines_path: path,
              brand_guidelines_filename: file.name,
              brand_guidelines_uploaded_at: new Date().toISOString(),
            })
            .eq("id", row.id)
        : await (async () => {
            const { getCurrentAccountId } = await import("@/lib/accountContext");
            const accountId = await getCurrentAccountId();
            if (!accountId) throw new Error("No account found");
            return supabase.from("ad_account_profiles").insert({
              account_id: accountId,
              ad_account_id: adAccountId,
              user_id: user.id,
              brand_kit_status: "pending",
              brand_guidelines_path: path,
              brand_guidelines_filename: file.name,
              brand_guidelines_uploaded_at: new Date().toISOString(),
            });
          })();
      if (updateErr) throw updateErr;
      toast.success("Brand guidelines uploaded");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!row?.id) return;
    const path = row.brand_guidelines_path;
    setUploading(true);
    try {
      if (path) await supabase.storage.from("brand-guidelines").remove([path]);
      await supabase
        .from("ad_account_profiles")
        .update({
          brand_guidelines_path: null,
          brand_guidelines_filename: null,
          brand_guidelines_uploaded_at: null,
        })
        .eq("id", row.id);
      toast.success("Brand guidelines removed");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Remove failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!row?.brand_guidelines_path) return;
    const { data, error } = await supabase.storage
      .from("brand-guidelines")
      .createSignedUrl(row.brand_guidelines_path, 60);
    if (error || !data) { toast.error("Could not generate download link"); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold">Brand guidelines</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a PDF of your brand guidelines. We'll keep it on file and surface it during ad creation.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : row?.brand_guidelines_path ? (
        <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/30">
          <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{row.brand_guidelines_filename ?? "guidelines.pdf"}</p>
            {row.brand_guidelines_uploaded_at && (
              <p className="text-xs text-muted-foreground">
                Uploaded {new Date(row.brand_guidelines_uploaded_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => inputRef.current?.click()} disabled={uploading} title="Replace">
            <Replace className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRemove} disabled={uploading} title="Remove">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2 h-auto py-4 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload brand guidelines PDF
        </Button>
      )}
    </Card>
  );
};
