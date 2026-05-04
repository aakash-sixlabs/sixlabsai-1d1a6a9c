import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Upload, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { IcpEditDialog, type IcpDraft } from "./IcpEditDialog";

interface Icp {
  id: string;
  name: string;
  description: string;
  source: string;
  created_at: string;
}

interface Props {
  adAccountId: string;
}

export const IcpSettings = ({ adAccountId }: Props) => {
  const [icps, setIcps] = useState<Icp[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IcpDraft | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("icps")
      .select("*")
      .eq("ad_account_id", adAccountId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load ICPs");
    setIcps(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (adAccountId) load();
  }, [adAccountId]);

  const handleSave = async (draft: IcpDraft) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (draft.id) {
      const { error } = await supabase
        .from("icps")
        .update({ name: draft.name, description: draft.description })
        .eq("id", draft.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("ICP updated");
    } else {
      const { error } = await supabase.from("icps").insert({
        user_id: user.id,
        ad_account_id: adAccountId,
        name: draft.name,
        description: draft.description,
        source: "manual",
      });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("ICP added");
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ICP?")) return;
    const { error } = await supabase.from("icps").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext === "txt" || ext === "md") {
      return await file.text();
    }
    if (ext === "pdf") {
      const pdfUrl = "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs";
      const pdfjsLib: any = await import(/* @vite-ignore */ pdfUrl);
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs";
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let out = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        out += content.items.map((it: any) => it.str).join(" ") + "\n";
      }
      return out;
    }
    if (ext === "docx") {
      const mammothUrl = "https://esm.sh/mammoth@1.8.0/mammoth.browser.min.js";
      const mammoth: any = await import(/* @vite-ignore */ mammothUrl);
      const buf = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buf });
      return result.value;
    }
    throw new Error("Unsupported file type. Use PDF, DOCX, TXT, or MD.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      toast.info("Reading file…");
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 20) {
        throw new Error("Could not read text from file.");
      }
      toast.info("Extracting ICPs with AI…");
      const { data, error } = await supabase.functions.invoke("parse-icps", {
        body: { text, fileName: file.name },
      });
      if (error) throw error;
      const extracted: { name: string; description: string }[] = data?.icps ?? [];
      if (extracted.length === 0) {
        toast.warning("No ICPs found in this document.");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const rows = extracted.map((i) => ({
        user_id: user.id,
        ad_account_id: adAccountId,
        name: i.name,
        description: i.description,
        source: "upload",
      }));
      const { error: insertError } = await supabase.from("icps").insert(rows);
      if (insertError) throw insertError;
      toast.success(`Added ${extracted.length} ICP${extracted.length > 1 ? "s" : ""}`);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to extract ICPs");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Ideal Customer Profiles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define the audiences your brand targets. These power the ad creation workflow.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload file
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4" />
            New ICP
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : icps.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No ICPs yet. Upload a document to auto-extract them, or add one manually.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {icps.map((icp) => (
            <Card key={icp.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{icp.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {icp.source === "upload" ? "Imported" : "Manual"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {icp.description}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing({ id: icp.id, name: icp.name, description: icp.description });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(icp.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <IcpEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
};
