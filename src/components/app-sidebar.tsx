import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Rocket, Boxes, Cpu, FlaskConical } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "System Health", url: "/", icon: Activity },
  { title: "Deployment Feed", url: "/deployments", icon: Rocket },
  { title: "Model Registry", url: "/models", icon: Boxes },
  { title: "Model Sandbox", url: "/sandbox", icon: FlaskConical },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Cpu className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">Tensorline</span>
            <span className="num text-[10px] uppercase tracking-widest text-muted-foreground">ML Ops · prod</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="num text-[10px] uppercase tracking-widest">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
          <span className="size-2 shrink-0 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          <span className="group-data-[collapsible=icon]:hidden">All regions operational</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
