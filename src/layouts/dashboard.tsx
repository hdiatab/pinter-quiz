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

export default function DashboardLayout({
  breadcrumbs,
}: {
  breadcrumbs: {
    label: string;
    href: string;
  }[];
}) {
  const location = useLocation();
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
          <Outlet />
        </div>
      </SidebarInset>
      <FloatingDock className="md:hidden" />
      <div className="fixed top-0 right-0 w-fit">
        <ModeToggle />
      </div>
    </SidebarProvider>
  );
}
