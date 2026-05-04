import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface GenerationNotification {
  id: string; // job id
  status: "generating" | "completed" | "failed" | "pending" | string;
  goal: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  read: boolean;
}

interface Ctx {
  notifications: GenerationNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const GenerationNotificationsContext = createContext<Ctx>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
});

const READ_STORAGE_KEY = "gen_notifs_read_ids";
const SEEN_STORAGE_KEY = "gen_notifs_seen_ids"; // jobs we've already toasted for

const loadSet = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};
const saveSet = (key: string, set: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {}
};

export const GenerationNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<GenerationNotification[]>([]);
  const readIdsRef = useRef<Set<string>>(loadSet(READ_STORAGE_KEY));
  const toastedIdsRef = useRef<Set<string>>(loadSet(SEEN_STORAGE_KEY));
  const userIdRef = useRef<string | null>(null);

  const markRead = useCallback((id: string) => {
    readIdsRef.current.add(id);
    saveSet(READ_STORAGE_KEY, readIdsRef.current);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      prev.forEach((n) => readIdsRef.current.add(n.id));
      saveSet(READ_STORAGE_KEY, readIdsRef.current);
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const upsert = useCallback(
    (row: any, opts: { toastOnComplete?: boolean } = {}) => {
      const next: GenerationNotification = {
        id: row.id,
        status: row.status,
        goal: row.goal ?? null,
        error_message: row.error_message ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        read: readIdsRef.current.has(row.id),
      };

      setNotifications((prev) => {
        const existingIdx = prev.findIndex((n) => n.id === next.id);
        if (existingIdx >= 0) {
          const merged = [...prev];
          merged[existingIdx] = { ...next, read: prev[existingIdx].read };
          return merged;
        }
        return [next, ...prev].slice(0, 30);
      });

      if (
        opts.toastOnComplete &&
        (row.status === "completed" || row.status === "failed") &&
        !toastedIdsRef.current.has(row.id)
      ) {
        toastedIdsRef.current.add(row.id);
        saveSet(SEEN_STORAGE_KEY, toastedIdsRef.current);
        // Mark as unread so the bell pings
        readIdsRef.current.delete(row.id);
        saveSet(READ_STORAGE_KEY, readIdsRef.current);

        if (row.status === "completed") {
          toast.success("Your creatives are ready", {
            description: "Tap to view your new generation.",
            action: {
              label: "View",
              onClick: () => navigate(`/output?jobId=${row.id}`),
            },
          });
        } else {
          toast.error("Generation failed", {
            description: row.error_message ?? "Something went wrong.",
          });
        }
      }
    },
    [navigate],
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user || cancelled) return;
      userIdRef.current = user.id;

      // Initial load — most recent jobs
      const { data } = await supabase
        .from("generation_jobs")
        .select("id, status, goal, error_message, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(15);

      if (data && !cancelled) {
        // On first load, treat already-completed/failed jobs as already toasted
        // so we don't fire stale notifications.
        data.forEach((row: any) => {
          if (row.status === "completed" || row.status === "failed") {
            toastedIdsRef.current.add(row.id);
          }
        });
        saveSet(SEEN_STORAGE_KEY, toastedIdsRef.current);

        setNotifications(
          data.map((row: any) => ({
            id: row.id,
            status: row.status,
            goal: row.goal,
            error_message: row.error_message,
            created_at: row.created_at,
            updated_at: row.updated_at,
            read: readIdsRef.current.has(row.id),
          })),
        );
      }

      // Subscribe to live updates for this user's jobs
      channel = supabase
        .channel(`generation_jobs_user_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "generation_jobs",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const row = (payload.new ?? payload.old) as any;
            if (!row) return;
            upsert(row, { toastOnComplete: true });
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [upsert]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <GenerationNotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead }}
    >
      {children}
    </GenerationNotificationsContext.Provider>
  );
};

export const useGenerationNotifications = () => useContext(GenerationNotificationsContext);
