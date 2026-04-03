import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ShieldOff, UserCog } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";

type ProfileRow = Tables<"profiles">;
type UserRoleRow = Tables<"user_roles">;
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
  roles: string[];
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, avatar_url, is_blocked, created_at")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    const roleMap = new Map<string, string[]>();
    ((roles as UserRoleRow[] | null) || []).forEach((r) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    setUsers(
      (((profiles as ProfileRow[] | null) || []).map((p) => ({
        ...p,
        roles: roleMap.get(p.user_id) || ["user"],
      })))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (profile: UserProfile) => {
    const newVal = !profile.is_blocked;
    const { error } = await supabase.from("profiles").update({ is_blocked: newVal }).eq("id", profile.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newVal ? "User blocked" : "User unblocked" });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          admin_id: user.id,
          action: newVal ? "User blocked" : "User unblocked",
          target_table: "profiles",
          target_id: profile.user_id,
        });
      }
      fetchUsers();
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").upsert(
      { user_id: userId, role },
      { onConflict: "user_id,role" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Role '${role}' assigned` });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          admin_id: user.id,
          action: `Assigned role: ${role}`,
          target_table: "user_roles",
          target_id: userId,
        });
      }
      fetchUsers();
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Role '${role}' removed` });
      fetchUsers();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform users and roles</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Roles</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-foreground text-xs font-semibold">
                            {(u.display_name || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{u.display_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.user_id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={u.is_blocked ? "destructive" : "outline"}>
                        {u.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleBlock(u)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          title={u.is_blocked ? "Unblock" : "Block"}
                        >
                          {u.is_blocked ? (
                            <Shield className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ShieldOff className="w-4 h-4 text-destructive" />
                          )}
                        </button>
                        <div className="relative group">
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Manage roles">
                            <UserCog className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-2 hidden group-hover:block z-20 min-w-[120px]">
                            {(["user", "moderator", "admin"] as AppRole[]).map((role) => {
                              const hasRole = u.roles.includes(role);
                              return (
                                <button
                                  key={role}
                                  onClick={() => hasRole ? removeRole(u.user_id, role) : assignRole(u.user_id, role)}
                                  className={`w-full text-left px-3 py-1.5 rounded text-xs capitalize transition-colors ${hasRole ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary text-foreground"
                                    }`}
                                >
                                  {hasRole ? `✓ ${role}` : role}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
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

export default AdminUsers;
