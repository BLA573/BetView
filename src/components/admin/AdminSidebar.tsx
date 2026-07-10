import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  ScanLine,
  Flag,
  Activity,
  Settings,
  Star,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Listings", url: "/admin/listings", icon: Building2 },
  { title: "Agencies", url: "/admin/agencies", icon: Briefcase },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare },
  { title: "Premium Requests", url: "/admin/premium", icon: Star },
  { title: "Plan Requests", url: "/admin/plan-requests", icon: CreditCard },
  { title: "Featured Listings", url: "/admin/featured", icon: Star },
  { title: "Scan Requests", url: "/admin/scan-requests", icon: ScanLine },
  { title: "Reports", url: "/admin/reports", icon: Flag },
  { title: "Activity Logs", url: "/admin/activity", icon: Activity },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img
            src="/betview_logo_primary.png"
            alt="BetView Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
          />
          {!collapsed && (
            <span className="font-display font-semibold text-lg text-sidebar-foreground tracking-tight">
              BetView Admin
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
