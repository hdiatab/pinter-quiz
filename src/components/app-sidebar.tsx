import * as React from "react";
import { HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/constants/dashboard-navigation.constant";
import { AccountStats } from "./account-stats";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const { state } = useSidebar();

  const navItemsWithActive = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.url || location.pathname.startsWith(item.url + "/"),
  }));

  const { sidebarVariant, sidebarCollapsible } = useSelector((s: any) => s.settings) as {
    sidebarVariant: "sidebar" | "floating" | "inset";
    sidebarCollapsible: "offcanvas" | "icon" | "none";
  };

  return (
    <Sidebar
      {...props}
      classNameInner={`${state === "collapsed" ? "!rounded-full duration-1000" : ""}`}
      variant={sidebarVariant}
      collapsible={sidebarCollapsible}
    >
      <SidebarHeader>
        <Link
          to={"/"}
          className={`${state === "collapsed" ? "max-md:p-2" : "p-2"} transition-all hover:bg-primary/5 rounded-full`}
        >
          <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex gap-4">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-full">
              <HelpCircle className="size-7" />
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Pinter Quiz</span>
              <span className="truncate text-xs">by hab</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <NavMain items={navItemsWithActive} />
      </SidebarContent>

      <SidebarFooter>
        <div
          className={`${
            state !== "collapsed" && location.pathname !== "/account" ? "opacity-100" : "opacity-0"
          } transition-opacity delay-100 duration-200 overflow-hidden`}
        >
          {state !== "collapsed" && <AccountStats className="text-xs" />}
        </div>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
