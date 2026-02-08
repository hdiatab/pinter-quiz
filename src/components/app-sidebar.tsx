import * as React from "react";
import { LayoutDashboard, Trophy, User, Settings, HelpCircle, BadgeQuestionMarkIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Start Quiz",
    url: "/start-quiz",
    icon: BadgeQuestionMarkIcon,
  },
  {
    title: "Leaderboards",
    url: "/leaderboards",
    icon: Trophy,
  },
  {
    title: "Account",
    url: "/account",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
] as const;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const { state } = useSidebar();

  const navItemsWithActive = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.url || location.pathname.startsWith(item.url + "/"),
  }));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          to={"/"}
          className={`${state === "collapsed" ? "max-md:p-2" : "p-2"} transition-all hover:bg-primary/5 rounded-sm`}
        >
          <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex gap-4">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <HelpCircle className="size-4" />
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Pinter Quiz</span>
              <span className="truncate text-xs">by hab</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItemsWithActive} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
