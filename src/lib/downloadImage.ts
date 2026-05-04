/**
 * Download an image to the user's device.
 * Fetches as a blob so we always trigger a real download (not navigation),
 * and works across origins as long as CORS is permitted.
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Fallback: open in new tab so the user can save manually.
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

export function extOf(url: string, fallback = "jpg"): string {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.([a-zA-Z0-9]{2,5})$/);
    return m ? m[1].toLowerCase() : fallback;
  } catch {
    const m = url.match(/\.([a-zA-Z0-9]{2,5})(?:$|\?)/);
    return m ? m[1].toLowerCase() : fallback;
  }
}

/** Download many images sequentially with a tiny delay so browsers don't drop downloads. */
export async function downloadAll(
  items: { url: string; filename: string }[],
): Promise<void> {
  for (const it of items) {
    await downloadImage(it.url, it.filename);
    await new Promise((r) => setTimeout(r, 250));
  }
}
