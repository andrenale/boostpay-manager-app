import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Split,
  Receipt,
  Users,
  Settings,
  HelpCircle,
  Wallet,
  AlertTriangle,
  Package,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transações", url: "/transactions", icon: ArrowLeftRight },
  { title: "Cobrança", url: "/cobranca", icon: Receipt },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Split de Pagamentos", url: "/split", icon: Split },
  { title: "Financeiro", url: "/financial", icon: Wallet },
  { title: "Disputas", url: "/disputes", icon: AlertTriangle },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Configurações", url: "/settings", icon: Settings },
  { title: "Ajuda", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-boost-bg-primary border-r border-boost-border">
        {/* Logo */}
        <div className="p-6 border-b border-boost-border">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-boost-text-primary font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold boost-gradient-text">
                Boost Pay
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-boost-text-primary font-bold text-lg">B</span>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-boost-bg-secondary text-boost-accent border-l-2 border-boost-accent"
                          : "text-boost-text-secondary hover:bg-boost-bg-tertiary hover:text-boost-text-primary"
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
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
}