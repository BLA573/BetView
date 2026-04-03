import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, MessageSquare, Flag, Clock, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Stats {
  totalUsers: number;
  totalListings: number;
  activeInquiries: number;
  pendingApprovals: number;
  flaggedReports: number;
  handledInquiries: number;
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: string }) => (
  <div className="p-5 rounded-xl border border-border bg-card shadow-card">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
    </div>
    <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalListings: 0, activeInquiries: 0,
    pendingApprovals: 0, flaggedReports: 0, handledInquiries: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [users, listings, inquiries, pending, reports, handled] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "handled"),
      ]);
      setStats({
        totalUsers: users.count || 0,
        totalListings: listings.count || 0,
        activeInquiries: inquiries.count || 0,
        pendingApprovals: pending.count || 0,
        flaggedReports: reports.count || 0,
        handledInquiries: handled.count || 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform statistics at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="gradient-blue" />
          <StatCard label="Total Listings" value={stats.totalListings} icon={Building2} color="bg-accent" />
          <StatCard label="Active Inquiries" value={stats.activeInquiries} icon={MessageSquare} color="bg-primary" />
          <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="bg-amber-500" />
          <StatCard label="Flagged Reports" value={stats.flaggedReports} icon={Flag} color="bg-destructive" />
          <StatCard label="Handled Inquiries" value={stats.handledInquiries} icon={CheckCircle} color="bg-emerald-500" />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
