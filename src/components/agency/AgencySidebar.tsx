import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  ScanLine,
  CreditCard,
  UserCircle,
  Star,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  { title: "Dashboard",        url: "/agency",              icon: LayoutDashboard },
  { title: "My Listings",      url: "/agency/listings",     icon: Building2 },
  { title: "My Leads",         url: "/agency/leads",        icon: MessageSquare },
  { title: "Visit Requests",   url: "/agency/visits",       icon: CalendarCheck },
  { title: "Request Scan",     url: "/agency/scan-request", icon: ScanLine },
  { title: "Featured Listings",url: "/agency/featured",     icon: Star },
  { title: "My Plan",          url: "/agency/plan",         icon: CreditCard },
  { title: "Agency Profile",   url: "/agency/profile",      icon: UserCircle },
];

const AgencySidebar = () => {
  const { state } = useSidebar();
  const { agencyId } = useAuth();
  const collapsed = state === "collapsed";
  const [agencyName, setAgencyName] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    supabase
      .from("agencies")
      .select("name")
      .eq("id", agencyId)
      .single()
      .then(({ data }) => {
        if (data?.name) setAgencyName(data.name);
      });
  }, [agencyId]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue flex-shrink-0">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          {!collapsed && (
            <span
              className="font-display font-semibold text-lg text-sidebar-foreground tracking-tight truncate max-w-[140px]"
              title={agencyName || "Agency Portal"}
            >
              {agencyName || "Agency Portal"}
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/agency"}
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

export default AgencySidebar;
