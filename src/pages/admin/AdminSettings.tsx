import AdminLayout from "@/components/admin/AdminLayout";
import { Settings, Shield, Bell, Palette } from "lucide-react";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform configuration</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Security</h3>
                <p className="text-xs text-muted-foreground">Manage auth and access policies</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Role-based access control is active. Manage user roles from the Users page.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">Configure alerts and email settings</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Notification preferences can be configured per admin user.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Appearance</h3>
                <p className="text-xs text-muted-foreground">Branding and theme settings</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize the platform's look and feel from here.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">General</h3>
                <p className="text-xs text-muted-foreground">Platform-wide settings</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage general platform configuration and defaults.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
