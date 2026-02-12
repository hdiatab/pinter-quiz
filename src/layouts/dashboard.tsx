import { AppSidebar } from "@/components/app-sidebar";
import { FloatingAccount } from "@/components/floating-account";
import { FloatingDock } from "@/components/floating-dock";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Fragment } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import type { ContentMaxWidth } from "@/store/settings/settingsSlice";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

const widthClass: Record<ContentMaxWidth, string> = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export default function DashboardLayout() {
  const location = useLocation();
  const contentMaxWidth = useSelector((s: any) => s.settings.contentMaxWidth) as ContentMaxWidth;

  const breadcrumbs = location.pathname
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .filter(Boolean)
    .filter((seg, idx, arr) => {
      // hide id untuk route /users/:id  (hapus segmen setelah "users")
      if (arr[idx - 1] === "users") return false;

      // opsional: hide segmen yang purely angka (misal 123)
      if (/^\d+$/.test(seg)) return false;

      // opsional: hide segmen yang looks like uuid
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(seg)) return false;

      return true;
    })
    .map((seg, idx, arr) => {
      const href = "/" + arr.slice(0, idx + 1).join("/");
      const label = decodeURIComponent(seg)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, href };
    });

  return (
    <SidebarProvider>
      <AppSidebar variant="floating" collapsible="icon" />
      <SidebarInset className="@container">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 max-md:hidden">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <Fragment key={breadcrumb.href}>
                      <BreadcrumbItem className="hidden md:block">
                        {isLast ? (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>

                      {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <FloatingAccount className={`md:hidden ${location.pathname === "/account" ? "hidden" : ""}`} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:pt-0 max-md:pb-24">
          <div className={cn("mx-auto w-full", widthClass[contentMaxWidth])}>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <FloatingDock className="md:hidden" />
      <div className="fixed top-0 right-0 w-fit">
        <ModeToggle />
      </div>
    </SidebarProvider>
  );
}
