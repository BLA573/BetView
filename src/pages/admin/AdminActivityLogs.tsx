import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Loader2, Activity } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface LogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  details: Json | null;
  created_at: string;
}

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data as LogEntry[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track admin actions and system changes</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Target</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-foreground">{log.action}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {log.target_table && (
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          {log.target_table}
                          {log.target_id && ` · ${log.target_id.slice(0, 8)}…`}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {log.admin_id.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
